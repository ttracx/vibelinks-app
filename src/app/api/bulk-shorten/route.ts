import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShortCode, isValidUrl } from "@/lib/utils";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    if (urls.length > 100) {
      return NextResponse.json({ error: "Maximum 100 URLs at a time" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const results = [];

    for (const url of urls) {
      if (!isValidUrl(url)) {
        results.push({ original: url, short: "Invalid URL", qr: null });
        continue;
      }

      const shortCode = generateShortCode();

      await prisma.link.create({
        data: {
          originalUrl: url,
          shortCode,
        },
      });

      const shortUrl = `${baseUrl}/${shortCode}`;
      const qrCode = await QRCode.toDataURL(shortUrl, {
        width: 200,
        margin: 1,
      });

      results.push({ original: url, short: shortUrl, qr: qrCode });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Bulk shorten error:", error);
    return NextResponse.json({ error: "Failed to shorten URLs" }, { status: 500 });
  }
}
