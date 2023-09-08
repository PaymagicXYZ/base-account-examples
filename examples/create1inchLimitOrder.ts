import { EthereumAddress } from "../src/types";
import { BytesLike, ethers, TypedDataField } from "ethers";
import {
  LimitOrderBuilder,
  limitOrderProtocolAddresses,
  Web3ProviderConnector,
  LimitOrder,
} from "@1inch/limit-order-protocol-utils";
import Web3 from "web3";
import axios, { AxiosResponse } from "axios";
import { EIP712Parameter } from "@1inch/limit-order-protocol-utils";
import * as dotenv from "dotenv";
dotenv.config();

const AUTH_URL = "https://paymagicapi.com/v1/auth";
const KERNEL_SIGN_URL = "https://paymagicapi.com/v1/kernel/sign";
const RESOLVER_URL = "https://paymagicapi.com/v1/resolver";
const APPLICATION_JSON = "application/json";
const LIMIT_ORDERS_URL = "https://limit-orders.1inch.io/v3.0/";
let accessToken: string | null = null;

/**
 * Fetches an access token from the AUTH_URL.
 * If the access token is already fetched, it returns the existing token.
 * Otherwise, it sends a POST request to the AUTH_URL with the client ID and secret to get a new access token.
 *
 * @param {string} clientId - The client ID.
 * @param {string} clientSecret - The client secret.
 * @returns {Promise<string>} A promise that resolves to an access token.
 */
async function fetchToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  if (accessToken) {
    return accessToken;
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  try {
    const response = await axios.post(AUTH_URL, params);
    accessToken = response.data.access_token!;
    if (accessToken === null) {
      throw new Error("Access token is null");
    }
    return accessToken;
  } catch (error) {
    console.error(`Error fetching token: ${error}`);
    throw error;
  }
}

/**
 * Creates a Web3ProviderConnector instance.
 * It first creates a new HttpProvider with the given RPC URL, then creates a new Web3 instance with the provider.
 * Finally, it creates a new Web3ProviderConnector with the Web3 instance.
 *
 * @param {string} rpcUrl - The RPC URL.
 * @returns {Promise<Web3ProviderConnector>} A promise that resolves to a Web3ProviderConnector instance.
 */
async function createProviderConnector(
  rpcUrl: string
): Promise<Web3ProviderConnector> {
  const provider = new Web3.providers.HttpProvider(rpcUrl);
  const web3 = new Web3(provider);
  //@ts-ignore
  return new Web3ProviderConnector(web3);
}

/**
 * Creates a LimitOrderBuilder instance.
 * It uses the given contract address, chain ID, and Web3ProviderConnector instance to create a new LimitOrderBuilder.
 *
 * @param {EthereumAddress} contractAddress - The contract address.
 * @param {number} chainId - The chain ID.
 * @param {Web3ProviderConnector} providerConnector - The Web3ProviderConnector instance.
 * @returns {Promise<LimitOrderBuilder>} A promise that resolves to a LimitOrderBuilder instance.
 */
async function createLimitOrderBuilder(
  contractAddress: EthereumAddress,
  chainId: number,
  providerConnector: Web3ProviderConnector
): Promise<LimitOrderBuilder> {
  return new LimitOrderBuilder(contractAddress, chainId, providerConnector);
}

/**
 * Creates a LimitOrder instance.
 * It uses the LimitOrderBuilder instance to build a new LimitOrder with the given parameters.
 *
 * @param {LimitOrderBuilder} limitOrderBuilder - The LimitOrderBuilder instance.
 * @param {EthereumAddress} patchWalletAddress - The patch wallet address.
 * @param {EthereumAddress} makerAssetAddress - The maker asset address.
 * @param {number} makerAssetAmount - The maker asset amount.
 * @param {EthereumAddress} takerAssetAddress - The taker asset address.
 * @param {number} takerAssetAmount - The taker asset amount.
 * @returns {Promise<LimitOrder>} A promise that resolves to a LimitOrder instance.
 */
async function createLimitOrder(
  limitOrderBuilder: LimitOrderBuilder,
  patchWalletAddress: EthereumAddress,
  makerAssetAddress: EthereumAddress,
  makerAssetAmount: number,
  takerAssetAddress: EthereumAddress,
  takerAssetAmount: number
): Promise<LimitOrder> {
  return limitOrderBuilder.buildLimitOrder({
    makerAssetAddress,
    takerAssetAddress,
    makerAddress: patchWalletAddress,
    makingAmount: makerAssetAmount.toString(),
    takingAmount: takerAssetAmount.toString(),
  });
}

/**
 * Calculates the order hash.
 * It first builds the typed data for the order, then uses the typed data to calculate the order hash.
 *
 * @param {LimitOrderBuilder} limitOrderBuilder - The LimitOrderBuilder instance.
 * @param {LimitOrder} order - The LimitOrder instance.
 * @returns {BytesLike} The order hash.
 */
function calculateOrderHash(
  limitOrderBuilder: LimitOrderBuilder,
  order: LimitOrder
): BytesLike {
  const orderTypedData = limitOrderBuilder.buildLimitOrderTypedData(order);
  return limitOrderBuilder.buildLimitOrderHash(orderTypedData);
}

/**
 * Creates the typed data for the limit order.
 * It first builds the typed data for the order, then constructs the order types and returns the typed data.
 *
 * @param {LimitOrderBuilder} limitOrderBuilder - The LimitOrderBuilder instance.
 * @param {LimitOrder} order - The LimitOrder instance.
 * @returns {Promise<any>} A promise that resolves to the typed data.
 */
async function createTypedData(
  limitOrderBuilder: LimitOrderBuilder,
  order: LimitOrder
): Promise<any> {
  const typedData = limitOrderBuilder.buildLimitOrderTypedData(order);
  const orderTypes: { Order: TypedDataField[] } = { Order: [] };
  typedData.types.Order.forEach((item: EIP712Parameter) => {
    orderTypes.Order.push(item);
  });
  return {
    domain: typedData.domain,
    types: orderTypes,
    value: typedData.message,
  };
}

/**
 * Fetches the signature for the order from the Patch sign endpoint.
 * It first fetches the access token, then sends a POST request to the KERNEL_SIGN_URL with the payload and user ID to get the signature.
 *
 * @param {any} payload - The payload.
 * @param {string} userId - The user ID.
 * @returns {Promise<BytesLike>} A promise that resolves to the signature.
 */
async function fetchSignature(
  payload: any,
  userId: string
): Promise<BytesLike> {
  const body = {
    userId,
    typedData: payload,
  };
  const token = await fetchToken(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!
  );

  const response = await axios.post(KERNEL_SIGN_URL, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": APPLICATION_JSON,
    },
  });
  return response.data.signature;
}

/**
 * Posts the order to the LIMIT_ORDERS_URL.
 * It constructs the request body with the order hash, order data, and signature, then sends a POST request to the LIMIT_ORDERS_URL.
 *
 * @param {number} chainId - The chain ID.
 * @param {BytesLike} orderHash - The order hash.
 * @param {LimitOrder} order - The LimitOrder instance.
 * @param {BytesLike} signature - The signature.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the Axios response.
 */
async function postOrder(
  chainId: number,
  orderHash: BytesLike,
  order: LimitOrder,
  signature: BytesLike
): Promise<AxiosResponse> {
  const url = `${LIMIT_ORDERS_URL}${chainId}`;

  const requestBody = {
    orderHash,
    data: order,
    signature,
  };

  return await axios.post(url, requestBody, {
    headers: {
      "Content-Type": APPLICATION_JSON,
    },
  });
}

/**
 * Fetches the patch wallet address from the resolver endpoint.
 * It first fetches the access token, then sends a POST request to the RESOLVER_URL with the user ID to get the patch wallet address.
 *
 * @param {string} userId - The user ID.
 * @returns {Promise<EthereumAddress>} A promise that resolves to the patch wallet address.
 */
async function getPatchWalletAddress(userId: string): Promise<EthereumAddress> {
  const body = {
    userIds: userId,
  };
  const token = await fetchToken(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!
  );
  const response = await axios.post(RESOLVER_URL, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": APPLICATION_JSON,
    },
  });
  return response.data.users[0].accountAddress;
}

/**
 * Fetches the chain ID from the rpcUrl.
 * It creates a new JsonRpcProvider with the rpcUrl, then gets the network and returns the chain ID.
 *
 * @param {string} rpcUrl - The RPC URL.
 * @returns {Promise<number>} A promise that resolves to the chain ID.
 */
async function getChainId(rpcUrl: string): Promise<number> {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  return network.chainId;
}

/**
 * Creates a 1inch limit order for a Patch wallet and posts it to the 1inch limit order book.
 * It first fetches the patch wallet address, creates a Web3ProviderConnector, and gets the chain ID.
 * Then, it creates a LimitOrderBuilder, builds a LimitOrder, calculates the order hash, and creates the typed data.
 * Finally, it fetches the signature and posts the order to the LIMIT_ORDERS_URL.
 *
 * @param {string} patchWalletUserId - The patch wallet user ID.
 * @param {string} rpcUrl - The RPC URL.
 * @param {EthereumAddress} makerAssetAddress - The maker asset address.
 * @param {number} makerAssetAmount - The maker asset amount.
 * @param {EthereumAddress} takerAssetAddress - The taker asset address.
 * @param {number} takerAssetAmount - The taker asset amount.
 * @returns {Promise<void>} A promise that resolves when the order is created.
 */
async function createOneInchLimitOrder(
  patchWalletUserId: string,
  rpcUrl: string,
  makerAssetAddress: EthereumAddress,
  makerAssetAmount: number,
  takerAssetAddress: EthereumAddress,
  takerAssetAmount: number
): Promise<void> {
  const patchWalletAddress = await getPatchWalletAddress(patchWalletUserId);
  const providerConnector = await createProviderConnector(rpcUrl);
  const chainId = await getChainId(rpcUrl);
  const contractAddress =
    limitOrderProtocolAddresses[
      chainId as keyof typeof limitOrderProtocolAddresses
    ];
  const limitOrderBuilder = await createLimitOrderBuilder(
    contractAddress,
    chainId,
    providerConnector
  );
  const order = await createLimitOrder(
    limitOrderBuilder,
    patchWalletAddress,
    makerAssetAddress,
    makerAssetAmount,
    takerAssetAddress,
    takerAssetAmount
  );
  const orderHash = calculateOrderHash(limitOrderBuilder, order);
  const payload = await createTypedData(limitOrderBuilder, order);
  const signature = await fetchSignature(payload, patchWalletUserId);
  await postOrder(chainId, orderHash, order, signature);
  console.log("Success");
}
