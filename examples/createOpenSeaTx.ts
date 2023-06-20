import {
  EthereumAddress,
  TransactionFormat,
  Fulfiller,
  OpenSeaResponse,
  OpenSeaOrder,
  Listing,
} from "../src/types";
import { Interface } from "@ethersproject/abi";
import { SEAPORT_ABI } from "../src/constants";
import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Posts fulfiller and listing data to OpenSea API and returns the response.
 * @param {Fulfiller} fulfiller - The fulfiller object containing the address of the sender.
 * @param {Listing} listing - The listing object containing the hash, chain, and protocol_address.
 * @returns {Promise<OpenSeaResponse>} - The OpenSea API response.
 */
async function postOpenSeaData(
  fulfiller: Fulfiller,
  listing: Listing
): Promise<OpenSeaResponse> {
  const url = `https://api.opensea.io/v2/listings/fulfillment_data`;
  const apiKey = process.env.OPENSEA_API_KEY;

  try {
    const response = await axios.post<OpenSeaResponse>(
      url,
      {
        listing: listing,
        fulfiller: fulfiller,
      },
      {
        headers: {
          "X-API-KEY": apiKey,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error fetching data:", axiosError.message);
    throw axiosError;
  }
}

/**
 * Fetches OpenSea order data for a given token address and token ID.
 * @param {EthereumAddress} tokenAddress - The token address.
 * @param {number} tokenId - The token ID.
 * @returns {Promise<OpenSeaOrder>} - The OpenSea order data.
 */
async function fetchOpenSeaData(
  tokenAddress: EthereumAddress,
  tokenId: number
): Promise<OpenSeaOrder> {
  const url = `https://api.opensea.io/v2/orders/matic/seaport/listings?asset_contract_address=${tokenAddress}&limit=1&token_ids=${tokenId}&order_by=eth_price&order_direction=asc`;
  const apiKey = process.env.OPENSEA_API_KEY;

  try {
    const response = await axios.get<{ orders: OpenSeaOrder[] }>(url, {
      headers: {
        "X-API-KEY": apiKey,
        Accept: "application/json",
      },
    });

    return response.data.orders[0];
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error fetching data:", axiosError.message);
    throw axiosError;
  }
}

/**
 * Gets the OpenSea transaction data for a given token address, token ID, and sender address.
 * @param {EthereumAddress} tokenAddress - The token address.
 * @param {number} tokenId - The token ID.
 * @param {EthereumAddress} sender - The sender address.
 * @returns {Promise<TransactionFormat>} - The transaction data.
 */
async function getOpenSeaTx(
  tokenAddress: EthereumAddress,
  tokenId: number,
  sender: EthereumAddress
): Promise<TransactionFormat> {
  const data: OpenSeaOrder = await fetchOpenSeaData(tokenAddress, tokenId);
  const fulfiller: Fulfiller = { address: sender };
  const listing: Listing = {
    hash: data.order_hash,
    chain: "matic",
    protocol_address: data.protocol_address,
  };

  const response: OpenSeaResponse = await postOpenSeaData(fulfiller, listing);
  const { parameters } = response.fulfillment_data.transaction.input_data;

  const seaportInterface = new Interface(SEAPORT_ABI);
  const encodedFunctionData = seaportInterface.encodeFunctionData(
    "fulfillBasicOrder_efficient_6GL6yc",
    [parameters]
  );

  return {
    to: [response.fulfillment_data.transaction.to],
    value: [response.fulfillment_data.transaction.value],
    data: [encodedFunctionData],
  };
}
