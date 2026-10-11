import { Link } from "react-router";
import { useDemoUser } from "../demo-user";
import styles from "./DashboardPage.module.css";

const areas = [
  {
    to: "/markets",
    title: "Markets",
    text: "Indices, stocks, funds, commodities, and currencies.",
  },
  {
    to: "/crypto",
    title: "Crypto",
    text: "Rankings, prices, market cap, and recent performance.",
  },
  {
    to: "/economy",
    title: "Economy",
    text: "Inflation, unemployment, interest rates, and GDP.",
  },
  {
    to: "/watchlist",
    title: "Watchlist",
    text: "Instruments saved in this browser.",
  },
];

export function DashboardPage() {
  const user = useDemoUser();

  return (
    <section>
      <h1>Welcome, {user.name}</h1>
      <p className={styles.intro}>
        MarketScope is a demonstration of independently loaded market views. Prices may be delayed,
        cached, or incomplete, and they are not a basis for trading or investment decisions.
      </p>
      <div className={styles.grid}>
        {areas.map((area) => (
          <Link className={styles.card} key={area.to} to={area.to}>
            <h2 className={styles.title}>{area.title}</h2>
            <p className={styles.text}>{area.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
