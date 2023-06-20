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
