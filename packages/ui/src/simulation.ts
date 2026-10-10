import { useEffect, useState } from "react";

const REMOTE_FAULT_KEY = "marketscope.remote-fault";
const API_SIMULATION_KEY = "marketscope.api-sim";

export function simulationHeaders(): HeadersInit {
  const mode = sessionStorage.getItem(API_SIMULATION_KEY);
  return mode ? { "x-marketscope-sim": mode } : {};
}

export function simulateRemoteFault(name: string | null) {
  if (name) {
    sessionStorage.setItem(REMOTE_FAULT_KEY, name);
  } else {
    sessionStorage.removeItem(REMOTE_FAULT_KEY);
  }

  window.dispatchEvent(
    new CustomEvent("marketscope.simulate", {
      detail: { remote: name },
    }),
  );
}

export function simulateApiFault(mode: "error" | "timeout" | null) {
  if (mode) {
    sessionStorage.setItem(API_SIMULATION_KEY, mode);
  } else {
    sessionStorage.removeItem(API_SIMULATION_KEY);
  }
}

export function useRemoteFault(name: string) {
  const [faulted, setFaulted] = useState(() => sessionStorage.getItem(REMOTE_FAULT_KEY) === name);

  useEffect(() => {
    function onSimulate() {
      setFaulted(sessionStorage.getItem(REMOTE_FAULT_KEY) === name);
    }

    window.addEventListener("marketscope.simulate", onSimulate);
    return () => window.removeEventListener("marketscope.simulate", onSimulate);
  }, [name]);

  if (faulted) {
    throw new Error(`Simulated ${name} failure`);
  }
}
