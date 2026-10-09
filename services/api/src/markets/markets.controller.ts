import { Controller, Get, Param, Res } from "@nestjs/common";
import { findInstrument, MARKET_CATALOG } from "./catalog";
import { MarketHistoryService } from "./market-history.service";
import { MarketQuoteService } from "./market-quote.service";

type CacheResponse = {
  setHeader(name: string, value: string): void;
};

@Controller("markets")
export class MarketsController {
  constructor(
    private readonly history: MarketHistoryService,
    private readonly quotes: MarketQuoteService,
  ) {}

  @Get("catalog")
  getCatalog() {
    return { instruments: MARKET_CATALOG };
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
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    console.log("getHistory", symbol);
    const result = await this.history.getDailyHistory(symbol, findInstrument(symbol)?.group);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }
}
