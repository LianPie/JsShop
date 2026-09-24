import { NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET() {
  const mostBought = [...products]
    .sort((a, b) => b.boughtCount - a.boughtCount)
    .slice(0, 8);

  return NextResponse.json(mostBought);
}
