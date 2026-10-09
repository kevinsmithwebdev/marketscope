import { Module } from "@nestjs/common";
import { MarketHistoryService } from "./market-history.service";
import { MarketQuoteService } from "./market-quote.service";
import { MarketsController } from "./markets.controller";

@Module({
  controllers: [MarketsController],
  providers: [MarketHistoryService, MarketQuoteService],
})
export class MarketsModule {}
