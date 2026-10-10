import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CryptoModule } from "./crypto/crypto.module";
import { HealthController } from "./health.controller";
import { MarketsModule } from "./markets/markets.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MarketsModule, CryptoModule],
  controllers: [HealthController],
})
export class AppModule {}
