import { isAddress } from "ethers/lib/utils";
import { BytesLike } from "ethers";

function isEthereumAddress(address: string): address is EthereumAddress {
  return isAddress(address);
}

export type EthereumAddress = string;

export interface TransactionFormat {
  to: EthereumAddress[];
  data: BytesLike[];
  value: BytesLike[];
}

export interface FullPostRequest extends TransactionFormat {
  chain: string;
  userId: string;
  transaction: TransactionFormat;
}

export interface OpenSeaOrder {
  order_hash: string;
  protocol_address: string;
}

export interface OpenSeaFulfillmentData {
  fulfillment_data: {
    transaction: {
      to: string;
      value: string;
      input_data: {
        parameters: any;
      };
    };
  };
}

export interface BasicOrderParameters {
  considerationToken: string;
  considerationIdentifier: string;
  considerationAmount: string;
  offerer: string;
  zone: string;
  offerToken: string;
  offerIdentifier: string;
  offerAmount: string;
  basicOrderType: string;
  startTime: string;
  endTime: string;
  zoneHash: string;
  salt: string;
  offererConduitKey: string;
  fulfillerConduitKey: string;
  totalOriginalAdditionalRecipients: string;
  additionalRecipients: string[];
  signature: string;
}

export interface Fulfiller {
  address: EthereumAddress;
}

export interface Listing {
  hash: string;
  chain: string;
  protocol_address: EthereumAddress;
}

export interface OpenSeaOrder {
  order_hash: string;
  protocol_address: EthereumAddress;
}

export interface OpenSeaResponse {
  fulfillment_data: {
    transaction: {
      to: EthereumAddress;
      value: string;
      input_data: {
        parameters: any;
      };
    };
  };
}
