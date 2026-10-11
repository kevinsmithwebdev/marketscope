import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { MARKET_RANGES, parseChartRange } from "../chart-range";
import { findInstrument, MARKET_CATALOG } from "./catalog";
import { MarketHistoryService } from "./market-history.service";
import { MarketMoversService } from "./market-movers.service";
import { MarketQuoteService } from "./market-quote.service";

type CacheResponse = {
  setHeader(name: string, value: string): void;
};

@Controller("markets")
export class MarketsController {
  constructor(
    private readonly history: MarketHistoryService,
    private readonly quotes: MarketQuoteService,
    private readonly movers: MarketMoversService,
  ) {}

  @Get("catalog")
  getCatalog() {
    return { instruments: MARKET_CATALOG };
  }

  @Get("movers")
  async getMovers(@Res({ passthrough: true }) response: CacheResponse) {
    const result = await this.movers.getMovers();
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }

  @Get("stocks/:symbol/quote")
  async getQuote(
    @Param("symbol") symbol: string,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    const result = await this.quotes.getQuote(symbol, findInstrument(symbol)?.group);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }

  @Get("stocks/:symbol/history")
  async getHistory(
    @Param("symbol") symbol: string,
    @Query("range") range: string | undefined,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    const parsed = parseChartRange(range, MARKET_RANGES);
    const result = await this.history.getHistory(symbol, findInstrument(symbol)?.group, parsed);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }
}
