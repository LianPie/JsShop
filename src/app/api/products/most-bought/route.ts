import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const mostBought = 
    await prisma.product.findMany({ orderBy: { boughtCount: "desc" } , take: 8 });



  return NextResponse.json(mostBought);
}
