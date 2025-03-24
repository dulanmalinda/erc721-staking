import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address query parameter is required" },
        { status: 400 }
      );
    }

    const url = `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=base&format=decimal&media_items=false`;

    const response = await axios.get(url, {
      headers: {
        accept: "application/json",
        "X-API-Key": process.env.MORALIS_API_KEY!,
      },
    });

    return NextResponse.json(response.data, {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching NFT data:", error?.response || error.message);
    return NextResponse.json(
      { error: "Failed to fetch NFT data" },
      { status: 500 }
    );
  }
}
