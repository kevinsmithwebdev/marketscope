import { Controller, Get, Res } from "@nestjs/common";
import { EconomyService } from "./economy.service";
import type { EconomySeriesId } from "./series";

type CacheResponse = {
  setHeader(name: string, value: string): void;
};

@Controller("economy")
export class EconomyController {
  constructor(private readonly economy: EconomyService) {}

  @Get("inflation")
  getInflation(@Res({ passthrough: true }) response: CacheResponse) {
    return this.read("inflation", response);
  }

  @Get("unemployment")
  getUnemployment(@Res({ passthrough: true }) response: CacheResponse) {
    return this.read("unemployment", response);
  }

  @Get("interest-rates")
  getInterestRates(@Res({ passthrough: true }) response: CacheResponse) {
    return this.read("interest-rates", response);
  }

  @Get("gdp")
  getGdp(@Res({ passthrough: true }) response: CacheResponse) {
    return this.read("gdp", response);
  }

  private async read(id: EconomySeriesId, response: CacheResponse) {
    const result = await this.economy.getSeries(id);
    response.setHeader("X-Cache", result.cacheStatus);
    return result.data;
  }
}
