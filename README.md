# Patch Wallet Examples

This repository contains examples and guidelines for working with Base Accounts, which are ERC-4337 compliant smart contract account abstraction wallets. These examples demonstrate how to generate deterministic addresses for your base accounts and provide sample code for creating various types of transactions using the Base Account API.

- [Documentation](https://docs.patchwallet.com/api/base-account-api)

The examples included in this repository cover the following topics:

- Creating an ERC20 token transfer transaction
- Creating a native token transfer transaction
- Generating a base account address from a user ID
- Creating an OpenSea Seaport Transaction
- Creating a 1inch Limit Order

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Creating an ERC20 token transfer transaction](#creating-an-erc20-token-transfer-transaction)
  - [Creating a native token transfer transaction](#creating-a-native-token-transfer-transaction)
  - [Generating a base account address from a user ID](#generating-a-base-account-address-from-a-user-id)
  - [Creating a 0x swap transaction](#creating-a-0x-swap-transaction)
  - [Creating an OpenSea Seaport Transaction](#creating-an-opensea-seaport-transaction)
  - [Creating a 1inch Limit Order](#creating-a-1inch-limit-order)
  - [Upgrading a Patch Wallet](#upgrading-a-patch-wallet)
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

### Enable new validator address(es)

```typescript
import { ethers } from 'ethers'

async function enableValidatorAddresses() {
  // Change these fields
  const userId = 'test:username'
  const chain = 'maticmum'
  const newAddresses = ['0x000...']
  const signer = new ethers.Wallet({YOUR PK}, {YOUR PROVIDER})

  const validatorAddress = '0x9392c6a8a0b5d49cc697b8242d477509bae16700'
  const addressBookAbi = [{ "inputs": [{ "internalType": "address[]", "name": "_addresses", "type": "address[]" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "getOwners", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }]
  const validatorAbi = [{"inputs":[{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"enable","outputs":[],"stateMutability":"payable","type":"function"}]
  const bytecode = '0x608060405234801561001057600080fd5b506040516102f03803806102f083398101604081905261002f916100f5565b8051610042906000906020840190610049565b50506101b9565b82805482825590600052602060002090810192821561009e579160200282015b8281111561009e57825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190610069565b506100aa9291506100ae565b5090565b5b808211156100aa57600081556001016100af565b634e487b7160e01b600052604160045260246000fd5b80516001600160a01b03811681146100f057600080fd5b919050565b6000602080838503121561010857600080fd5b82516001600160401b038082111561011f57600080fd5b818501915085601f83011261013357600080fd5b815181811115610145576101456100c3565b8060051b604051601f19603f8301168101818110858211171561016a5761016a6100c3565b60405291825284820192508381018501918883111561018857600080fd5b938501935b828510156101ad5761019e856100d9565b8452938501939285019261018d565b98975050505050505050565b610128806101c86000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063a0e67e2b14602d575b600080fd5b60336047565b604051603e919060a7565b60405180910390f35b60606000805480602002602001604051908101604052809291908181526020018280548015609d57602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116080575b5050505050905090565b6020808252825182820181905260009190848201906040850190845b8181101560e65783516001600160a01b03168352928401929184019160010160c3565b5090969550505050505056fea26469706673582212201fd24d7648c85a25e5c276c31e41a7f86fe4ec82975d7d6c86276a3f5b2d4bc564736f6c63430008170033'
  const addressBookFactory = new ethers.ContractFactory(addressBookAbi, bytecode, signer)
  const addressBookContract = await addressBookFactory.deploy(newAddresses)
  await addressBookContract.deployTransaction.wait()
  const addressBookAddress = addressBookContract.address
  const validatorInterface = new ethers.utils.Interface(validatorAbi)
  const calldata = validatorInterface.encodeFunctionData('enable', [addressBookAddress])
  const patchWalletTransaction = {
    'userId': userId,
    'chain': chain,
    'to': [validatorAddress],
    'value': ['0'],
    'data': [calldata]
  }
  // Use patchWalletTransaction to submit userOp using your credentials
  console.log(patchWalletTransaction)
}
```

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
import axios from "axios";
import { ERC20_ABI } from "../src/constants";
import { Interface } from "@ethersproject/abi";
import { EthereumAddress } from "../src/types";
import { TransactionFormat } from "../src/types";
import * as dotenv from "dotenv";

dotenv.config();

const API_URL = "https://polygon.api.0x.org/swap/v1/quote";
const API_KEY = process.env.ZEROEX_API_KEY;

async function fetchQuote(
  buyToken: EthereumAddress,
  sellAmount: number,
  sellToken: EthereumAddress
): Promise<any> {
  const url = `${API_URL}?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&feeRecipient=0x74427681c620DE258Aa53a382d6a4C865738A06C&buyTokenPercentageFee=0.1`;
  const headers = {
    "0x-api-key": API_KEY,
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function createTransaction(
  quote: any,
  buyToken: EthereumAddress,
  recipient?: EthereumAddress
): TransactionFormat {
  const erc20Interface = new Interface(ERC20_ABI);

  const approveData = erc20Interface.encodeFunctionData("approve", [
    quote.allowanceTarget,
    quote.sellAmount,
  ]);

  const swapTx: TransactionFormat = {
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

// /**
//  * Fetches a 0x swap quote and constructs a transaction object for approval and swap.
//  * Optionally, it can also include a transfer transaction to send the bought tokens to a recipient.
//  *
//  * @param {EthereumAddress} buyToken - The address of the token to buy.
//  * @param {number} sellAmount - The amount of the sell token to sell.
//  * @param {EthereumAddress} sellToken - The address of the token to sell.
//  * @param {EthereumAddress} [recipient] - Optional recipient address to send the bought tokens to.
//  * @returns {Promise<TransactionFormat>} A promise that resolves to a transaction object.
//  */
async function getZeroExSwap(
  buyToken: EthereumAddress,
  sellAmount: number,
  sellToken: EthereumAddress,
  recipient?: EthereumAddress
): Promise<TransactionFormat> {
  const quote = await fetchQuote(buyToken, sellAmount, sellToken);
  return createTransaction(quote, buyToken, recipient);
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

### Creating a 1inch Limit Order

The `create1InchLimitOrder.ts` file contains a function `createOneInchLimitOrder` that creates a limit order and posts it to the 1inch limit order book with its accompanying orderHash and signature. This function takes the patch wallet address, RPC URL, chain ID, maker asset address, maker asset amount, taker asset address, and taker asset amount as input parameters. This code assumes that the patch wallet has already executed an approve transaction for the ERC20 token being swapped (which will be validated by the 1inch API).

```typescript
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

// ...

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
```

### Upgrading a Patch Wallet

The `upgradePatchWallet.ts` file contains a function `getUpgradeTx` that generates an upgrade transaction for a Patch wallet. This function takes the Patch wallet proxy address to be upgraded and the address of the new implementation contract as input parameters.

```typescript
import { KERNEL_ABI } from "../src/constants";
import { EthereumAddress, TransactionFormat } from "../src/types";
import { Interface } from "@ethersproject/abi";

/**
 * Generates an upgrade transaction for a Patch wallet.
 *
 * @param patchWalletAddress - The Patch wallet proxy address to be upgraded.
 * @param newImplementationAddress - The address of the new implementation contract.
 * @returns {Promise<TransactionFormat>} A promise that resolves to a transaction object.
 */
async function getUpgradeTx(
  patchWalletAddress: EthereumAddress,
  newImplementationAddress: EthereumAddress
): Promise<TransactionFormat> {
  const patchWalletInterface = new Interface(KERNEL_ABI);

  const transferData = patchWalletInterface.encodeFunctionData("upgradeTo", [
    newImplementationAddress,
  ]);

  return { to: [patchWalletAddress], value: ["0x00"], data: [transferData] };
}
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any improvements or suggestions.
