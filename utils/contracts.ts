import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { stakingABI } from "./stakingABI";

const nftContractAddress = "0xe7842212c9dF42BB329Eb0719c728e578eaBd55F";
const rewardTokenContractAddress = "0x5f4fB22B3EEC9DF08705ddb484afd805E30c2E69";
const stakingContractAddress = "0x7FcC060F04350a68CAF5100E42D8eb505112A35d";

export const NFT_CONTRACT = getContract({
  client: client,
  chain: chain,
  address: nftContractAddress,
});

export const REWARD_TOKEN_CONTRACT = getContract({
  client: client,
  chain: chain,
  address: rewardTokenContractAddress,
});

export const STAKING_CONTRACT = getContract({
  client: client,
  chain: chain,
  address: stakingContractAddress,
  abi: stakingABI,
});
