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
