import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { InstrumentGroup } from "./catalog";
import {
  InvalidSymbolError,
  MarketQuoteClient,
  ProviderNotConfiguredError,
} from "./market-quote.client";

@Injectable()
export class MarketQuoteService {
  private readonly client: MarketQuoteClient;

  constructor(config: ConfigService) {
    this.client = new MarketQuoteClient({
      apiKey: config.get<string>("ALPHA_VANTAGE_API_KEY"),
    });
  }

  async getQuote(symbol: string, group?: InstrumentGroup) {
    try {
      return await this.client.getQuote(symbol, group);
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
