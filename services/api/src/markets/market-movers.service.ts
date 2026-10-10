import { BadGatewayException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MarketMoversClient, ProviderNotConfiguredError } from "./market-movers.client";

@Injectable()
export class MarketMoversService {
  private readonly client: MarketMoversClient;

  constructor(config: ConfigService) {
    this.client = new MarketMoversClient({
      apiKey: config.get<string>("ALPHA_VANTAGE_API_KEY"),
    });
  }

  async getMovers() {
    try {
      return await this.client.getMovers();
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) {
        throw new ServiceUnavailableException("Market data provider is not configured");
      }
      throw new BadGatewayException("Market data provider request failed");
    }
  }
}
