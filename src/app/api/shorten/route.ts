import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShortCode, isValidUrl } from "@/lib/utils";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, customAlias, password, expiresIn } = body;

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Check if custom alias is taken
    if (customAlias) {
      const existing = await prisma.link.findUnique({
        where: { customAlias },
      });
      if (existing) {
        return NextResponse.json({ error: "Alias already taken" }, { status: 400 });
      }
    }

    const shortCode = customAlias || generateShortCode();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const expiresAt = expiresIn
      ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000)
      : null;

    const link = await prisma.link.create({
      data: {
        originalUrl: url,
        shortCode,
        customAlias: customAlias || null,
        password: hashedPassword,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const shortUrl = `${baseUrl}/${link.shortCode}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#0ea5e9", light: "#ffffff" },
    });

    return NextResponse.json({
      shortUrl,
      shortCode: link.shortCode,
      qrCode,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    console.error("Shorten error:", error);
    return NextResponse.json({ error: "Failed to shorten URL" }, { status: 500 });
  }
}
