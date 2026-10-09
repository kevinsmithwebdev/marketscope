import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  InvalidSymbolError,
  MarketHistoryClient,
  ProviderNotConfiguredError,
} from "./market-history.client";

@Injectable()
export class MarketHistoryService {
  private readonly client: MarketHistoryClient;

  constructor(config: ConfigService) {
    this.client = new MarketHistoryClient({
      apiKey: config.get<string>("ALPHA_VANTAGE_API_KEY"),
    });
  }

  async getDailyHistory(symbol: string) {
    try {
      return await this.client.getDailyHistory(symbol);
    } catch (error) {
      if (error instanceof InvalidSymbolError) {
        throw new BadRequestException("Symbol is not valid");
      }
      if (error instanceof ProviderNotConfiguredError) {
        throw new ServiceUnavailableException("Market data provider is not configured");
      }
      throw new BadGatewayException("Market data provider request failed");
    }
  }
}
