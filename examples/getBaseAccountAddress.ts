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
