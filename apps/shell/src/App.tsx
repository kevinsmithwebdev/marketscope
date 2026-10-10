import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router";
import { DeveloperPanel } from "./DeveloperPanel";
import { DemoUserProvider, useDemoUser } from "./demo-user";
import { Notifications } from "./Notifications";
import { DashboardPage } from "./pages/DashboardPage";
import { RemoteErrorBoundary } from "./RemoteErrorBoundary";
import styles from "./App.module.css";

type RemoteModule = {
  App: ComponentType;
};

function loadRemote(importer: () => Promise<RemoteModule>) {
  return () => importer().then((module) => ({ default: module.App }));
}

const MarketsApp = lazy(loadRemote(() => import("markets/App")));
const CryptoApp = lazy(loadRemote(() => import("crypto/App")));
const EconomyApp = lazy(loadRemote(() => import("economy/App")));
const WatchlistApp = lazy(loadRemote(() => import("watchlist/App")));

function RemoteRoute({
  name,
  remote: Remote,
}: {
  name: string;
  remote: LazyExoticComponent<ComponentType>;
}) {
  return (
    <RemoteErrorBoundary name={name}>
      <Suspense fallback={<p>Loading {name.toLowerCase()}...</p>}>
        <Remote />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? styles.active : styles.link;
}

function ShellFrame() {
  const user = useDemoUser();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <strong className={styles.brand}>MarketScope</strong>
        <nav aria-label="Primary" className={styles.nav}>
          <NavLink className={navClass} to="/">
            Dashboard
          </NavLink>
          <NavLink className={navClass} to="/markets">
            Markets
          </NavLink>
          <NavLink className={navClass} to="/crypto">
            Crypto
          </NavLink>
          <NavLink className={navClass} to="/economy">
            Economy
          </NavLink>
          <NavLink className={navClass} to="/watchlist">
            Watchlist
          </NavLink>
        </nav>
        <DeveloperPanel />
        <span className={styles.user}>{user.name}</span>
      </header>
      <Notifications>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/markets" element={<RemoteRoute name="Markets" remote={MarketsApp} />} />
            <Route path="/crypto" element={<RemoteRoute name="Crypto" remote={CryptoApp} />} />
            <Route path="/economy" element={<RemoteRoute name="Economy" remote={EconomyApp} />} />
            <Route
              path="/watchlist"
              element={<RemoteRoute name="Watchlist" remote={WatchlistApp} />}
            />
          </Routes>
        </main>
      </Notifications>
    </div>
  );
}

export function App() {
  return (
    <DemoUserProvider>
      <BrowserRouter>
        <ShellFrame />
      </BrowserRouter>
    </DemoUserProvider>
  );
}
