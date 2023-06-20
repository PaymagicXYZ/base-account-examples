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
 * @returns {Promise<TransactionFormat>} A promise that resolves to a transaction object.
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
