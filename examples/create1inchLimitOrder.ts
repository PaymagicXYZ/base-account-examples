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

const AUTH_URL = "https://paymagicapi.com/v1/auth";
const KERNEL_SIGN_URL = "https://paymagicapi.com/v1/kernel/sign";
const APPLICATION_JSON = "application/json";

async function fetchToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  try {
    const response = await axios.post(AUTH_URL, params);
    return response.data.access_token!;
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
  return ethers.utils._TypedDataEncoder.getPayload(
    typedData.domain,
    orderTypes,
    typedData.message
  );
}

async function fetchSignature(payload: any): Promise<BytesLike> {
  const body = {
    userId: "test:elonmusk",
    chain: "matic",
    typedData: payload,
  };
  const accessToken = fetchToken(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!
  );
  const response = await axios.post(KERNEL_SIGN_URL, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
  const url = `https://limit-orders.1inch.io/v3.0/${chainId}`;
  const requestBody = {
    orderHash,
    order,
    signature,
  };
  return await axios.post(url, requestBody, {
    headers: {
      "Content-Type": APPLICATION_JSON,
    },
  });
}

async function createOneInchLimitOrder(
  patchWalletAddress: EthereumAddress,
  rpcUrl: string,
  chainId: number,
  makerAssetAddress: EthereumAddress,
  makerAssetAmount: number,
  takerAssetAddress: EthereumAddress,
  takerAssetAmount: number
): Promise<void> {
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
  const signature = await fetchSignature(payload);
  await postOrder(chainId, orderHash, order, signature);
}
