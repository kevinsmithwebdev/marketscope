import { createContext, useContext, type ReactNode } from "react";

export type DemoUser = {
  id: string;
  name: string;
};

const demoUser: DemoUser = {
  id: "demo",
  name: "Demo User",
};

const DemoUserContext = createContext<DemoUser>(demoUser);

export function DemoUserProvider({ children }: { children: ReactNode }) {
  return <DemoUserContext.Provider value={demoUser}>{children}</DemoUserContext.Provider>;
}

export function useDemoUser() {
  return useContext(DemoUserContext);
}
