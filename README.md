# Base Account Examples

This repository contains examples and guidelines for working with Base Accounts, which are ERC-4337 compliant smart contract account abstraction wallets. These examples demonstrate how to generate deterministic addresses for your base accounts and provide sample code for creating various types of transactions using the Base Account API.

- [Documentation](https://docs.patchwallet.com/api/base-account-api)

The examples included in this repository cover the following topics:

- Creating an ERC20 token transfer transaction
- Creating a native token transfer transaction
- Generating a base account address from a user ID
- Creating an OpenSea Seaport Transaction

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Creating an ERC20 token transfer transaction](#creating-an-erc20-token-transfer-transaction)
  - [Creating a native token transfer transaction](#creating-a-native-token-transfer-transaction)
  - [Generating a base account address from a user ID](#generating-a-base-account-address-from-a-user-id)
  - [Creating a 0x swap transaction](#creating-a-0x-swap-transaction)
  - [Creating an OpenSea Seaport Transaction](#creating-an-opensea-seaport-transaction)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (version 12.x or higher)
- [Yarn](https://yarnpkg.com/getting-started/install) (version 1.x)

## Installation

To install the required dependencies, run the following command:

```bash
yarn
```

## Usage

### Creating an ERC20 token transfer transaction

The `createERC20Tx.ts` file contains a function `getERC20Tx` that creates an ERC20 token transfer transaction. This function takes the recipient's address, the token contract address, and the amount to be transferred as input parameters.

```typescript
import { ERC20_ABI } from "../src/constants";
import { Contract } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { parseUnits } from "ethers/lib/utils";
import { EthereumAddress, TransactionFormat } from "../src/types";

/**
 * Generates an ERC20 token transfer transaction.
 *
 * @param recipient - The recipient's address.
 * @param tokenAddress - The token contract address.
 * @param amount - The amount to be transferred.
 * @returns An object containing the transaction data.
 */
async function getERC20Tx(
  recipient: EthereumAddress,
  tokenAddress: EthereumAddress,
  amount: number
): Promise<TransactionFormat> {
  const provider = new JsonRpcProvider(process.env.PROVIDER);
  const erc20Contract = new Contract(tokenAddress, ERC20_ABI, provider);

  const decimals = await erc20Contract.decimals();

  const amountWei = parseUnits(amount.toString(), decimals);

  const transferData = erc20Contract.interface.encodeFunctionData("transfer", [
    recipient,
    amountWei,
  ]);

  return { to: [tokenAddress], value: ["0x00"], data: [transferData] };
}
```

### Creating a native token transfer transaction

The `createNativeTx.ts` file contains a function `getNativeTx` that creates a native token transfer transaction. This function takes the recipient's address and the amount to be transferred as input parameters.

```typescript
import { parseUnits } from "ethers/lib/utils";
import { EthereumAddress, TransactionFormat } from "../src/types";

/**
 * Generates a native token transfer transaction.
 *
 * @param recipient - The recipient's address.
 * @param amount - The amount to be transferred in ether.
 * @returns {Promise<TransactionFormat>} A promise that resolves to a transaction object.
 */
async function getNativeTx(
  recipient: EthereumAddress,
  amount: number
): Promise<TransactionFormat> {
  const amountWei = parseUnits(amount.toString(), "ether");

  return { to: [recipient], value: [amountWei.toHexString()], data: ["0x"] };
}
```

### Generating a base account address from a user ID

The `getAddress.ts` file contains a function `getBaseAccountAddress` that generates a base account address from a base provider and user ID. This function takes the user ID as an input parameter.

```typescript
import { Contract, getDefaultProvider } from "ethers";
import {
  FACTORY_ADDRESS,
  PATCH_FACTORY_ABI,
  KERNEL_ACCOUNT_SUFFIX,
} from "../src/constants";
import { id } from "ethers/lib/utils";
import { EthereumAddress } from "../src/types";

const provider = getDefaultProvider(
  process.env.PROVIDER || "https://polygon.llamarpc.com"
);

const factoryContract = new Contract(
  FACTORY_ADDRESS,
  PATCH_FACTORY_ABI,
  provider
);

/**
 * Forms a string by concatenating the user ID and the kernel account suffix.
 *
 * @param {string} userId - The user's unique identifier.
 * @returns {string} - The concatenated string.
 */
function formUserIdAndSuffix(userId: string): string {
  return `${userId}:${KERNEL_ACCOUNT_SUFFIX}`;
}
async function getAccountAddress(index: number): Promise<string> {
  return await factoryContract.getAccountAddress(index);
}

/**
 * Get the base account address for a user.
 *
 * @param {string} baseProvider - The base wallet provider (e.g., "patchwallets").
 * @param {string} userId - The user's unique identifier (e.g., "example@email.com").
 * @returns {Promise<EthereumAddress>} - A promise that resolves to the user's base account address.
 */
async function getBaseAccountAddress(
  baseProvider: string,
  userId: string
): Promise<EthereumAddress> {
  return getAccountAddress(
    parseInt(id(formUserIdAndSuffix(`${baseProvider}:${userId}`)))
  );
}
```

### Creating a 0x swap transaction

The `createZeroExSwap.ts` file contains a function `getZeroExSwap` that fetches a 0x swap quote and constructs a transaction object for approval and swap. Optionally, it can also include a transfer transaction to send the bought tokens to a recipient.

```typescript
import fetch from "node-fetch";
import { ERC20_ABI } from "../src/constants";
import { Interface } from "@ethersproject/abi";
import { EthereumAddress } from "../src/types";
import { TransactionFormat } from "../src/types";

/**
 * Fetches a 0x swap quote and constructs a transaction object for approval and swap.
 * Optionally, it can also include a transfer transaction to send the bought tokens to a recipient.
 *
 * @param {EthereumAddress} buyToken - The address of the token to buy.
 * @param {number} sellAmount - The amount of the sell token to sell.
 * @param {EthereumAddress} sellToken - The address of the token to sell.
 * @param {EthereumAddress} [recipient] - Optional recipient address to send the bought tokens to.
 * @returns {Promise<TransactionFormat>} A promise that resolves to a transaction object.
 */
async function getZeroExSwap(
  buyToken: EthereumAddress,
  sellAmount: number,
  sellToken: EthereumAddress,
  recipient?: EthereumAddress
): Promise<TransactionFormat> {
  const quoteResponse = await fetch(
    `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellAmount=${sellAmount}&sellToken=${sellToken}`
  );

  // Check for error from 0x API
  if (quoteResponse.status !== 200) {
    const body = await quoteResponse.text();
    throw new Error(body);
  }

  const quote: any = await quoteResponse.json();

  const erc20Interface = new Interface(ERC20_ABI);

  const approveData = erc20Interface.encodeFunctionData("approve", [
    quote.allowanceTarget,
    quote.sellAmount,
  ]);

  const swapTx = {
    to: [buyToken, quote.to],
    data: [approveData, quote.data],
    value: ["0x00", "0x00"],
  };

  if (recipient) {
    swapTx.to.push(buyToken);
    swapTx.value.push("0x00");
    const transferData = erc20Interface.encodeFunctionData("transfer", [
      recipient,
      quote.buyAmount,
    ]);

    swapTx.data.push(transferData);
  }

  return swapTx;
}
```

### Creating an OpenSea Seaport Transaction

The `createOpenSeaTx.ts` file contains a function `getOpenSeaTx` that gets the OpenSea transaction data for a given ERC-721 token address, token ID, and sender address.

```typescript
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
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any improvements or suggestions.
