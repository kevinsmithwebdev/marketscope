const { spawn } = require("child_process");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const apiRoot = path.resolve(__dirname, "..");
const apiOnly = process.argv.includes("--api-only");

// This machine's Node build does not trust the OS certificate store unless asked.
// Alpha Vantage, CoinGecko, and FRED are HTTPS, so the API process needs that store.
const env = {
  ...process.env,
  NODE_USE_SYSTEM_CA: "1",
};

const processes = [
  {
    name: "api",
    cwd: apiRoot,
    args: [path.join(apiRoot, "node_modules/@nestjs/cli/bin/nest.js"), "start", "--watch"],
  },
];

if (!apiOnly) {
  for (const name of ["shell", "markets", "crypto", "economy", "watchlist"]) {
    const cwd = path.join(repoRoot, "apps", name);
    processes.push({
      name,
      cwd,
      args: [path.join(cwd, "node_modules/webpack/bin/webpack.js"), "serve"],
    });
  }
}

const children = [];
let stopping = false;

function writeLine(name, line) {
  process.stdout.write(`[${name}] ${line}\n`);
}

function stop(child) {
  if (!child.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawn("taskkill", ["/F", "/T", "/PID", String(child.pid)], { stdio: "ignore" });
    return;
  }

  child.kill("SIGTERM");
}

function shutdown(code) {
  if (stopping) {
    return;
  }

  stopping = true;
  for (const child of children) {
    stop(child);
  }

  setTimeout(() => process.exit(code), 300);
}

function prefix(stream, name) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      writeLine(name, line);
    }
  });
}

for (const proc of processes) {
  const child = spawn(process.execPath, proc.args, {
    cwd: proc.cwd,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  prefix(child.stdout, proc.name);
  prefix(child.stderr, proc.name);
  child.on("exit", (code, signal) => {
    if (stopping) {
      return;
    }

    writeLine(proc.name, `exited (${signal ?? code ?? 0})`);
    shutdown(code ?? 1);
  });
  children.push(child);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
