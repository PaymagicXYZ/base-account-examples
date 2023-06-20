# Base Account Examples

This repository contains examples and guidelines for working with Base Accounts, which are ERC-4337 compliant smart contract account abstraction wallets. These examples demonstrate how to generate deterministic addresses for your base accounts and provide sample code for creating various types of transactions using the Base Account API.

- [Documentation](https://docs.patchwallet.com/api/base-account-api)

The examples included in this repository cover the following topics:

- Creating an ERC20 token transfer transaction
- Creating a native token transfer transaction
- Generating a base account address from a user ID

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Creating an ERC20 token transfer transaction](#creating-an-erc20-token-transfer-transaction)
  - [Creating a native token transfer transaction](#creating-a-native-token-transfer-transaction)
  - [Generating a base account address from a user ID](#generating-a-base-account-address-from-a-user-id)
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
} from "../src/constants/index";
import { id } from "ethers/lib/utils";

/**
 * Get the base account address for a user.
 *
 * @param {string} baseProvider - The base wallet provider (e.g., "patchwallets").
 * @param {string} userId - The user's unique identifier (e.g., "example@email.com").
 * @returns {Promise<string>} - A promise that resolves to the user's base account address.
 */
async function getBaseAccountAddress(
  baseProvider: string,
  userId: string
): Promise<string> {
  const provider = getDefaultProvider(
    process.env.PROVIDER || "https://polygon.llamarpc.com"
  );

  const factoryContract = new Contract(
    FACTORY_ADDRESS,
    PATCH_FACTORY_ABI,
    provider
  );

  function formUserIdAndSuffix(userId: string): string {
    return `${userId}${KERNEL_ACCOUNT_SUFFIX}`;
  }
  async function getAccountAddress(index: number): Promise<string> {
    return await factoryContract.getAccountAddress(index);
  }

  return getAccountAddress(
    parseInt(id(formUserIdAndSuffix(`${baseProvider}:${userId}`)))
  );
}
```

### Creating a 0x swap transaction

```typescript
import fetch from "node-fetch";
import { ERC20_ABI } from "../src/constants";
import { Interface } from "@ethersproject/abi";

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
  buyToken: string,
  sellAmount: number,
  sellToken: string,
  recipient?: string
) {
  const quoteResponse = await fetch(
    `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellAmount=${sellAmount}&sellToken=${sellToken}`
  );

  // Check for error from 0x API
  if (quoteResponse.status !== 200) {
    const body = await quoteResponse.text();
    throw new Error(body);
  }

  const quote = await quoteResponse.json();

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

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any improvements or suggestions.
