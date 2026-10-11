import { Controller, Get, Query, Res } from "@nestjs/common";
import { ECONOMY_RANGES, parseChartRange } from "../chart-range";
import { EconomyService } from "./economy.service";
import type { EconomySeriesId } from "./series";

type CacheResponse = {
  setHeader(name: string, value: string): void;
};

@Controller("economy")
export class EconomyController {
  constructor(private readonly economy: EconomyService) {}

  @Get("inflation")
  getInflation(
    @Query("range") range: string | undefined,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    return this.read("inflation", response, range);
  }

  @Get("unemployment")
  getUnemployment(
    @Query("range") range: string | undefined,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    return this.read("unemployment", response, range);
  }

  @Get("interest-rates")
  getInterestRates(
    @Query("range") range: string | undefined,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    return this.read("interest-rates", response, range);
  }

  @Get("gdp")
  getGdp(
    @Query("range") range: string | undefined,
    @Res({ passthrough: true }) response: CacheResponse,
  ) {
    return this.read("gdp", response, range);
  }

  private async read(id: EconomySeriesId, response: CacheResponse, range: string | undefined) {
    const parsed = parseChartRange(range, ECONOMY_RANGES);
    const result = await this.economy.getSeries(id, parsed);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }
}
