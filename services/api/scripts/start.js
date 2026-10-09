const { spawn } = require("child_process");
const path = require("path");

const nestBin = path.resolve(__dirname, "../node_modules/@nestjs/cli/bin/nest.js");

// This machine's Node build does not trust the OS certificate store unless asked.
// Alpha Vantage is HTTPS, so the API process needs that store.
const child = spawn(process.execPath, [nestBin, "start", "--watch"], {
  stdio: "inherit",
  cwd: path.resolve(__dirname, ".."),
  env: {
    ...process.env,
    NODE_USE_SYSTEM_CA: "1",
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
