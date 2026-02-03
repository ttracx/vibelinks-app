import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      include: {
        _count: { select: { clicks: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json({ error: "Failed to get links" }, { status: 500 });
  }
}
