import { createWalletClient, getContract, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

export const walletClient = createWalletClient({
  chain: arbitrumSepolia,
  transport: http(),
  account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
}).extend(publicActions);

export const CoinflipAddress = "0xc5f7e2e3ea007ff00796cde95f54b27d114ac33e";

export const CoinflipABI = [
  { inputs: [], name: "GameAlreadyResolved", type: "error" },
  { inputs: [], name: "GameNotFound", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "MinBetNotMet",
    type: "error",
  },
  { inputs: [], name: "OnlySupraRouter", type: "error" },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "RandomnessRequestFailed", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256[]", name: "rng_list", type: "uint256[]" },
    ],
    name: "fulfillRandomness",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "newGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    name: "GameCreated",
    type: "event",
    inputs: [
      {
        indexed: true,
        name: "nonce",
        type: "uint256",
      },
      {
        indexed: true,
        name: "player",
        type: "address",
      },
      {
        name: "bet",
        type: "uint256",
      },
    ],
  },
  {
    anonymous: false,
    name: "GameResolved",
    type: "event",
    inputs: [
      {
        indexed: true,
        name: "nonce",
        type: "uint256",
      },
      {
        indexed: true,
        name: "player",
        type: "address",
      },
      {
        type: "uint256",
        name: "bet",
      },
      {
        name: "won",
        type: "bool",
      },
    ],
  },
  {
    anonymous: false,
    name: "Withdrawal",
    type: "event",
    inputs: [
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
  },
] as const;

export const coinflip = getContract({
  abi: CoinflipABI,
  address: CoinflipAddress,
  client: walletClient,
});
