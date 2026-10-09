import { Module } from "@nestjs/common";
import { MarketHistoryService } from "./market-history.service";
import { MarketsController } from "./markets.controller";

@Module({
  controllers: [MarketsController],
  providers: [MarketHistoryService],
})
export class MarketsModule {}
