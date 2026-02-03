import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClickData } from "@/lib/analytics";
import { getGeoFromIP } from "@/lib/geo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const link = await prisma.link.findFirst({
      where: {
        OR: [{ shortCode: code }, { customAlias: code }],
        isActive: true,
      },
    });

    if (!link) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check expiration
    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/?expired=true", request.url));
    }

    // Check password
    if (link.password) {
      return NextResponse.redirect(new URL(`/p/${code}`, request.url));
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

    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
