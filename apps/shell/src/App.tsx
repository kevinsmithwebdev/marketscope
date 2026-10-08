import { lazy, Suspense } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router";
import { DashboardPage } from "./pages/DashboardPage";

const MarketsApp = lazy(() =>
  import("markets/App").then((module) => ({ default: module.App })),
);

const CryptoApp = lazy(() =>
  import("crypto/App").then((module) => ({ default: module.App })),
);

const EconomyApp = lazy(() =>
  import("economy/App").then((module) => ({ default: module.App })),
);

const WatchlistApp = lazy(() =>
  import("watchlist/App").then((module) => ({ default: module.App })),
);

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
          element={
            <Suspense fallback={<p>Loading markets...</p>}>
              <MarketsApp />
            </Suspense>
          }
        />
        <Route
          path="/crypto"
          element={
            <Suspense fallback={<p>Loading crypto...</p>}>
              <CryptoApp />
            </Suspense>
          }
        />
        <Route
          path="/economy"
          element={
            <Suspense fallback={<p>Loading economy...</p>}>
              <EconomyApp />
            </Suspense>
          }
        />
        <Route
          path="/watchlist"
          element={
            <Suspense fallback={<p>Loading watchlist...</p>}>
              <WatchlistApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
