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
