import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClickData } from "@/lib/analytics";
import { getGeoFromIP } from "@/lib/geo";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, password } = body;

    const link = await prisma.link.findFirst({
      where: {
        OR: [{ shortCode: code }, { customAlias: code }],
        isActive: true,
      },
    });

    if (!link || !link.password) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, link.password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Track click
    const clickData = await getClickData();
    const geoData = clickData.ip ? await getGeoFromIP(clickData.ip) : {};

    await prisma.click.create({
      data: {
        linkId: link.id,
        ip: clickData.ip,
        userAgent: clickData.userAgent,
        referrer: clickData.referrer,
        device: clickData.device,
        browser: clickData.browser,
        os: clickData.os,
        country: geoData.country,
        city: geoData.city,
        region: geoData.region,
      },
    });

    return NextResponse.json({ url: link.originalUrl });
  } catch (error) {
    console.error("Verify password error:", error);
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }
}
