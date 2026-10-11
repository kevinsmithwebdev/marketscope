import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { CryptoModule } from "./crypto/crypto.module";
import { EconomyModule } from "./economy/economy.module";
import { HealthController } from "./health.controller";
import { MarketsModule } from "./markets/markets.module";
import { SimulationInterceptor, simulationEnabled } from "./simulation.interceptor";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MarketsModule, CryptoModule, EconomyModule],
  controllers: [HealthController],
  providers: simulationEnabled()
    ? [{ provide: APP_INTERCEPTOR, useClass: SimulationInterceptor }]
    : [],
})
export class AppModule {}
