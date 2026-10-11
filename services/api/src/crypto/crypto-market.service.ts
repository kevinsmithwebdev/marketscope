import { BadGatewayException, BadRequestException, Injectable } from "@nestjs/common";
import type { ChartRange } from "../chart-range";
import { CryptoMarketClient, InvalidAssetError } from "./crypto-market.client";

@Injectable()
export class CryptoMarketService {
  private readonly client = new CryptoMarketClient();

  async getAssets() {
    return this.call(() => this.client.getAssets());
  }

  async getAsset(id: string) {
    return this.call(() => this.client.getAsset(id));
  }

  async getHistory(id: string, range?: ChartRange) {
    return this.call(() => this.client.getHistory(id, range));
  }

  private async call<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof InvalidAssetError) {
        throw new BadRequestException("Asset id is not valid");
      }
      throw new BadGatewayException("Crypto provider request failed");
    }
  }
}
