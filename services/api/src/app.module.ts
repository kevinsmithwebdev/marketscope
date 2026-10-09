import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { MarketsModule } from "./markets/markets.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MarketsModule],
  controllers: [HealthController],
})
export class AppModule {}
