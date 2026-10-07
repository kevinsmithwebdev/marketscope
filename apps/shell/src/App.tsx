import { BrowserRouter, Link, Route, Routes } from "react-router";
import { CryptoPage } from "./pages/CryptoPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EconomyPage } from "./pages/EconomyPage";
import { MarketsPage } from "./pages/MarketsPage";
import { WatchlistPage } from "./pages/WatchlistPage";

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
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/crypto" element={<CryptoPage />} />
        <Route path="/economy" element={<EconomyPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Routes>
    </BrowserRouter>
  );
}
