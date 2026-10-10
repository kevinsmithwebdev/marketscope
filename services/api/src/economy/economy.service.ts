import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FredClient, ProviderNotConfiguredError } from "./fred.client";
import type { EconomySeriesId } from "./series";

@Injectable()
export class EconomyService {
  private readonly client: FredClient;

  constructor(config: ConfigService) {
    this.client = new FredClient({
      apiKey: config.get<string>("FRED_API_KEY"),
    });
  }

  async getSeries(id: EconomySeriesId) {
    try {
      return await this.client.getSeries(id);
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) {
        throw new ServiceUnavailableException("Economy data provider is not configured");
      }
      throw new BadGatewayException("Economy data provider request failed");
    }
  }
}
