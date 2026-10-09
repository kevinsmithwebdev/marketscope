import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HISTORY_STALE_TIME_MS } from "./api";
import { StockHistoryChart } from "./StockHistoryChart";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: HISTORY_STALE_TIME_MS,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StockHistoryChart symbol="SPY" />
    </QueryClientProvider>
  );
}
