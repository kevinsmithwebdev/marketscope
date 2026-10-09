import type { InstrumentQuote } from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { Badge, Skeleton } from "@marketscope/ui";
import { fetchQuote } from "./api";
import styles from "./QuoteSummary.module.css";

function formatPrice(price: number) {
  return price.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function QuoteSummary({ symbol }: { symbol: string }) {
  const quote = useQuery({
    queryKey: ["markets", "quote", symbol],
    queryFn: () => fetchQuote(symbol),
  });

  if (quote.isPending) {
    return <Skeleton height={88} />;
  }

  if (quote.isError) {
    const message = quote.error instanceof Error ? quote.error.message : "Quote is unavailable.";
    return <p role="alert">{message}</p>;
  }

  return <QuoteFigure quote={quote.data} />;
}

export function QuoteFigure({ quote }: { quote: InstrumentQuote }) {
  const tone = quote.change === null ? "neutral" : quote.change < 0 ? "negative" : "positive";
  const changeLabel =
    quote.change === null || quote.changePercent === null
      ? "Rate"
      : `${quote.change > 0 ? "+" : ""}${quote.change.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${quote.changePercent})`;

  return (
    <div className={styles.quote}>
      <div>
        <p className={styles.symbol}>{quote.symbol}</p>
        <p className={styles.price}>{formatPrice(quote.price)}</p>
      </div>
      <Badge tone={tone}>{changeLabel}</Badge>
    </div>
  );
}
