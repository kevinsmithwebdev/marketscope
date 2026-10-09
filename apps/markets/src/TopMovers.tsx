import type { MarketMover } from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { Badge, Card, DataTable, type DataTableColumn, Skeleton } from "@marketscope/ui";
import { fetchMovers } from "./api";
import styles from "./TopMovers.module.css";

const columns: DataTableColumn<MarketMover>[] = [
  { key: "symbol", header: "Symbol", render: (row) => row.symbol },
  {
    key: "price",
    header: "Price",
    render: (row) => row.price.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  },
  {
    key: "change",
    header: "Change",
    render: (row) => (
      <Badge tone={row.change < 0 ? "negative" : "positive"}>{row.changePercent}</Badge>
    ),
  },
];

export function TopMovers() {
  const movers = useQuery({
    queryKey: ["markets", "movers"],
    queryFn: fetchMovers,
  });

  if (movers.isPending) {
    return <Skeleton height={220} />;
  }

  if (movers.isError) {
    const message = movers.error instanceof Error ? movers.error.message : "Movers are unavailable.";
    return <p role="alert">{message}</p>;
  }

  return (
    <div className={styles.movers}>
      <Card title="Top gainers">
        <DataTable columns={columns} getRowKey={(row) => row.symbol} rows={movers.data.gainers} />
      </Card>
      <Card title="Top losers">
        <DataTable columns={columns} getRowKey={(row) => row.symbol} rows={movers.data.losers} />
      </Card>
      {movers.data.updatedAt ? <p className={styles.updated}>Updated {movers.data.updatedAt}.</p> : null}
    </div>
  );
}
