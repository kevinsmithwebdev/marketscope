import { Controller, Get, Param, Res } from "@nestjs/common";
import { MarketHistoryService } from "./market-history.service";

type CacheResponse = {
  setHeader(name: string, value: string): void;
};

@Controller("markets")
export class MarketsController {
  constructor(private readonly history: MarketHistoryService) {}

  @Get("stocks/:symbol/history")
  async getHistory(
    @Param("symbol") symbol: string,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    console.log("getHistory", symbol);
    const result = await this.history.getDailyHistory(symbol);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }
}
