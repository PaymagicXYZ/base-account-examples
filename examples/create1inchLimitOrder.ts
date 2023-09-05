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
const LIMIT_ORDERS_URL = "https://limit-orders.1inch.io/v3.0";
let accessToken: string | null = null;

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

async function createProviderConnector(
  rpcUrl: string
): Promise<Web3ProviderConnector> {
  const provider = new Web3.providers.HttpProvider(rpcUrl);
  const web3 = new Web3(provider);
  //@ts-ignore
  return new Web3ProviderConnector(web3);
}

async function createLimitOrderBuilder(
  contractAddress: EthereumAddress,
  chainId: number,
  providerConnector: Web3ProviderConnector
): Promise<LimitOrderBuilder> {
  return new LimitOrderBuilder(contractAddress, chainId, providerConnector);
}

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

function calculateOrderHash(
  limitOrderBuilder: LimitOrderBuilder,
  order: LimitOrder
): BytesLike {
  const orderTypedData = limitOrderBuilder.buildLimitOrderTypedData(order);
  return limitOrderBuilder.buildLimitOrderHash(orderTypedData);
}

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

async function fetchSignature(
  payload: any,
  userId: string
): Promise<BytesLike> {
  const body = {
    userId,
    chain: "matic",
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

async function createOneInchLimitOrder(
  patchWalletUserId: string,
  rpcUrl: string,
  chainId: number,
  makerAssetAddress: EthereumAddress,
  makerAssetAmount: number,
  takerAssetAddress: EthereumAddress,
  takerAssetAmount: number
): Promise<void> {
  const patchWalletAddress = await getPatchWalletAddress(patchWalletUserId);
  const providerConnector = await createProviderConnector(rpcUrl);
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
