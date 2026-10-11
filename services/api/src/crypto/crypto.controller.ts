import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { CRYPTO_RANGES, parseChartRange } from "../chart-range";
import { CryptoMarketService } from "./crypto-market.service";

type CacheResponse = {
  setHeader(name: string, value: string): void;
};

@Controller("crypto")
export class CryptoController {
  constructor(private readonly crypto: CryptoMarketService) {}

  @Get("assets")
  async getAssets(@Res({ passthrough: true }) response: CacheResponse) {
    const result = await this.crypto.getAssets();
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }

  @Get(":id/history")
  async getHistory(
    @Param("id") id: string,
    @Query("range") range: string | undefined,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    const parsed = parseChartRange(range, CRYPTO_RANGES);
    const result = await this.crypto.getHistory(id, parsed);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }

  @Get(":id")
  async getAsset(@Param("id") id: string, @Res({ passthrough: true }) response: CacheResponse) {
    const result = await this.crypto.getAsset(id);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }
}
