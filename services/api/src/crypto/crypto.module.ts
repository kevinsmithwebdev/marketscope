import { Module } from "@nestjs/common";
import { CryptoController } from "./crypto.controller";
import { CryptoMarketService } from "./crypto-market.service";

@Module({
  controllers: [CryptoController],
  providers: [CryptoMarketService],
})
export class CryptoModule {}
