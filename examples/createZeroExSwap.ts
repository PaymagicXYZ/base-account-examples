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
