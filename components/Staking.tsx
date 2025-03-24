"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { StakeRewards } from "./StakeRewards";
import { NFT_CONTRACT, STAKING_CONTRACT } from "../utils/contracts";
import { NFT } from "thirdweb";
import { useEffect, useState } from "react";
import {
  claimTo,
  getNFTs,
  ownerOf,
  totalSupply,
} from "thirdweb/extensions/erc721";
import { NFTCard } from "./NFTCard";
import { StakedNFTCard } from "./StakedNFTCard";

export type NFTMetadata = {
  uri: string;
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  background_color?: string;
  properties?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  image_url?: string;
} & Record<string, unknown>;

export const Staking = () => {
  const account = useActiveAccount();

  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);

  //   const getOwnedNFTs = async () => {
  //     let ownedNFTs: NFT[] = [];

  //     // const totalNFTSupply = await totalSupply({
  //     //   contract: NFT_CONTRACT,
  //     // });

  //     // const nfts = await getNFTs({
  //     //   contract: NFT_CONTRACT,
  //     //   start: 0,
  //     //   count: parseInt(totalNFTSupply.toString()),
  //     // });

  //     const ownedNFTss = await test({
  //       contract: NFT_CONTRACT,
  //       owner: account?.address as string,
  //     });

  //     console.log(ownedNFTss);

  //     // for (let nft of nfts) {
  //     //   const owner = await ownerOf({
  //     //     contract: NFT_CONTRACT,
  //     //     tokenId: nft.id,
  //     //   });
  //     //   if (owner === account?.address) {
  //     //     ownedNFTs.push(nft);
  //     //   }
  //     // }
  //     // setOwnedNFTs(ownedNFTs);
  //   };

  const getOwnedNFTs = async () => {
    try {
      const response = await fetch(
        `/api/ownednfts?address=${account?.address}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch NFTs");
      }
      const data = await response.json();

      const transformedNFTs = (data.result || [])
        .filter((nft: any) => {
          const tokenAddress = nft.token_address?.toLowerCase();
          const contractAddress = NFT_CONTRACT.address?.toLowerCase();
          const matches = tokenAddress === contractAddress;
          return matches;
        })
        .map((nft: any) => {
          const rawMetadata =
            typeof nft.metadata === "string"
              ? JSON.parse(nft.metadata)
              : nft.metadata;

          const metadata: NFTMetadata = {
            uri: nft.token_uri,
            name: rawMetadata.name,
            description: rawMetadata.description,
            image: rawMetadata.image,
            animation_url: rawMetadata.animation_url,
            external_url: rawMetadata.external_url,
            background_color: rawMetadata.background_color,
            properties: rawMetadata.properties,
            attributes: rawMetadata.attributes
              ? Object.fromEntries(
                  rawMetadata.attributes.map((attr: any) => [
                    attr.trait_type,
                    attr.value,
                  ])
                )
              : undefined,
            image_url: rawMetadata.image_url,
          };

          return {
            metadata,
            owner: nft.owner_of,
            id: BigInt(nft.token_id),
            tokenURI: nft.token_uri,
            type: nft.contract_type as "ERC721" | "ERC1155",
            ...(nft.contract_type === "ERC1155" && {
              supply: BigInt(nft.amount || 1),
            }),
          };
        });

      setOwnedNFTs(transformedNFTs);
    } catch (err) {
      console.error("Error fetching owned NFTs:", err);
      setOwnedNFTs([]);
    }
  };

  useEffect(() => {
    if (account) {
      getOwnedNFTs();
    }
  }, [account]);

  const { data: stakedInfo, refetch: refetchStakedInfo } = useReadContract({
    contract: STAKING_CONTRACT,
    method: "getStakeInfo",
    params: [account?.address || ""],
  });

  if (account) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#151515",
          borderRadius: "8px",
          width: "500px",
          padding: "20px",
        }}
      >
        <ConnectButton client={client} chain={chain} />
        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "20px 0",
            width: "100%",
          }}
        >
          <h2 style={{ marginRight: "20px" }}>Claim NFT to Stake</h2>
          <TransactionButton
            transaction={() =>
              claimTo({
                contract: NFT_CONTRACT,
                to: account?.address || "",
                quantity: BigInt(1),
              })
            }
            onTransactionConfirmed={() => {
              alert("NFT claimed!");
              getOwnedNFTs(account?.address);
            }}
            style={{
              fontSize: "12px",
              backgroundColor: "#333",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "10px",
            }}
          >
            Claim NFT
          </TransactionButton>
        </div> */}
        <hr
          style={{
            width: "100%",
            border: "1px solid #333",
          }}
        />
        <div
          style={{
            margin: "20px 0",
            width: "100%",
          }}
        >
          <h2>Owned NFTs</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              width: "500px",
            }}
          >
            {ownedNFTs && ownedNFTs.length > 0 ? (
              ownedNFTs.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  refetch={getOwnedNFTs}
                  refecthStakedInfo={refetchStakedInfo}
                />
              ))
            ) : (
              <p>You own 0 NFTs</p>
            )}
          </div>
        </div>
        <hr
          style={{
            width: "100%",
            border: "1px solid #333",
          }}
        />
        <div style={{ width: "100%", margin: "20px 0" }}>
          <h2>Staked NFTs</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              width: "500px",
            }}
          >
            {stakedInfo && stakedInfo[0].length > 0 ? (
              stakedInfo[0].map((nft: any, index: number) => (
                <StakedNFTCard
                  key={index}
                  tokenId={nft}
                  refetchStakedInfo={refetchStakedInfo}
                  refetchOwnedNFTs={getOwnedNFTs}
                />
              ))
            ) : (
              <p style={{ margin: "20px" }}>No NFTs staked</p>
            )}
          </div>
        </div>
        <hr
          style={{
            width: "100%",
            border: "1px solid #333",
          }}
        />
        {/* <StakeRewards /> */}
      </div>
    );
  }
};
