import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router";
import { DashboardPage } from "./pages/DashboardPage";
import { RemoteErrorBoundary } from "./RemoteErrorBoundary";

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

export function App() {
  return (
    <BrowserRouter>
      <header>
        <strong>MarketScope</strong>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/markets">Markets</Link>
          <Link to="/crypto">Crypto</Link>
          <Link to="/economy">Economy</Link>
          <Link to="/watchlist">Watchlist</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/markets"
          element={<RemoteRoute name="Markets" remote={MarketsApp} />}
        />
        <Route
          path="/crypto"
          element={<RemoteRoute name="Crypto" remote={CryptoApp} />}
        />
        <Route
          path="/economy"
          element={<RemoteRoute name="Economy" remote={EconomyApp} />}
        />
        <Route
          path="/watchlist"
          element={<RemoteRoute name="Watchlist" remote={WatchlistApp} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
