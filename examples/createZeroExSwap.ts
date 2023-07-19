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
