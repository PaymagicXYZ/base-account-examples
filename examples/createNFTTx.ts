import { EthereumAddress, TransactionFormat } from "../src/types";
import { Interface } from "@ethersproject/abi";
import { SEAPORT_ABI } from "../src/constants";
import axios from "axios";

/**
 * Post fulfillment data to OpenSea API.
 * @param fulfiller - The fulfiller object containing the sender's address.
 * @param listing - The listing object containing the order hash, chain, and protocol address.
 * @returns The response data from the OpenSea API.
 */
async function postOpenSeaData(fulfiller: any, listing: any) {
  const url = `https://api.opensea.io/v2/listings/fulfillment_data`;
  const apiKey = process.env.OPENSEA_API_KEY;

  try {
    const response = await axios.post(
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
    console.error("Error fetching data:", error);
  }
}

/**
 * Fetch OpenSea data for a specific token and tokenId.
 * @param tokenAddress - The Ethereum address of the token.
 * @param tokenId - The ID of the token.
 * @returns The order data for the specified token and tokenId.
 */
async function fetchOpenSeaData(
  tokenAddress: EthereumAddress,
  tokenId: number
): Promise<void> {
  const url = `https://api.opensea.io/v2/orders/matic/seaport/listings?asset_contract_address=${tokenAddress}&limit=1&token_ids=${tokenId}&order_by=eth_price&order_direction=asc`;
  const apiKey = process.env.OPENSEA_API_KEY;

  try {
    const response = await axios.get(url, {
      headers: {
        "X-API-KEY": apiKey,
        Accept: "application/json",
      },
    });

    return response.data.orders[0];
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

/**
 * Get OpenSea transaction data for a specific token, tokenId, and sender.
 * @param tokenAddress - The Ethereum address of the token.
 * @param tokenId - The ID of the token.
 * @param sender - The Ethereum address of the sender.
 * @returns The transaction data for the specified token, tokenId, and sender.
 */
async function getOpenSeaTx(
  tokenAddress: EthereumAddress,
  tokenId: number,
  sender: EthereumAddress
): Promise<TransactionFormat> {
  const data: any = await fetchOpenSeaData(tokenAddress, tokenId);
  const fulfiller = { address: sender };
  const listing = {
    hash: data.order_hash,
    chain: "matic",
    protocol_address: data.protocol_address,
  };

  const response = await postOpenSeaData(fulfiller, listing);

  const basicOrderParameters = {
    considerationToken:
      response.fulfillment_data.transaction.input_data.parameters
        .considerationToken,
    considerationIdentifier:
      response.fulfillment_data.transaction.input_data.parameters
        .considerationIdentifier,
    considerationAmount:
      response.fulfillment_data.transaction.input_data.parameters
        .considerationAmount,
    offerer:
      response.fulfillment_data.transaction.input_data.parameters.offerer,
    zone: response.fulfillment_data.transaction.input_data.parameters.zone,
    offerToken:
      response.fulfillment_data.transaction.input_data.parameters.offerToken,
    offerIdentifier:
      response.fulfillment_data.transaction.input_data.parameters
        .offerIdentifier,
    offerAmount:
      response.fulfillment_data.transaction.input_data.parameters.offerAmount,
    basicOrderType:
      response.fulfillment_data.transaction.input_data.parameters
        .basicOrderType,
    startTime:
      response.fulfillment_data.transaction.input_data.parameters.startTime,
    endTime:
      response.fulfillment_data.transaction.input_data.parameters.endTime,
    zoneHash:
      response.fulfillment_data.transaction.input_data.parameters.zoneHash,
    salt: response.fulfillment_data.transaction.input_data.parameters.salt,
    offererConduitKey:
      response.fulfillment_data.transaction.input_data.parameters
        .offererConduitKey,
    fulfillerConduitKey:
      response.fulfillment_data.transaction.input_data.parameters
        .fulfillerConduitKey,
    totalOriginalAdditionalRecipients:
      response.fulfillment_data.transaction.input_data.parameters
        .totalOriginalAdditionalRecipients,
    additionalRecipients:
      response.fulfillment_data.transaction.input_data.parameters
        .additionalRecipients,
    signature:
      response.fulfillment_data.transaction.input_data.parameters.signature,
  };

  const seaportInterface = new Interface(SEAPORT_ABI);

  const encodedFunctionData = seaportInterface.encodeFunctionData(
    "fulfillBasicOrder_efficient_6GL6yc",
    [basicOrderParameters]
  );

  return {
    to: [response.fulfillment_data.transaction.to],
    value: [response.fulfillment_data.transaction.value],
    data: [encodedFunctionData],
  };
}
