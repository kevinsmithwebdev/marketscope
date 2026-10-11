import { addWatchItem, readWatchlist } from "@marketscope/watchlist-client";
import { Button } from "@marketscope/ui";
import { useEffect, useState } from "react";

export function AddToWatchlist({ symbol, name }: { symbol: string; name: string }) {
  const [saved, setSaved] = useState(() => readWatchlist().some((item) => item.key === symbol));

  useEffect(() => {
    function onUpdate() {
      setSaved(readWatchlist().some((item) => item.key === symbol));
    }

    onUpdate();
    window.addEventListener("watchlist.updated", onUpdate);
    return () => window.removeEventListener("watchlist.updated", onUpdate);
  }, [symbol]);

  return (
    <Button
      disabled={saved}
      onClick={() => {
        addWatchItem({ key: symbol, symbol, name, kind: "equity" });
        window.dispatchEvent(
          new CustomEvent("marketscope.notify", {
            detail: { message: `Added ${symbol} to the watchlist` },
          }),
        );
      }}
      variant="secondary"
    >
      {saved ? "On watchlist" : "Add to watchlist"}
    </Button>
  );
}
