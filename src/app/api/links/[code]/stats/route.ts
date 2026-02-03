import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    const link = await prisma.link.findFirst({
      where: {
        OR: [{ shortCode: code }, { customAlias: code }],
      },
      include: {
        clicks: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Aggregate stats
    const totalClicks = link.clicks.length;

    // Clicks by country
    const countryStats = link.clicks.reduce((acc, click) => {
      const country = click.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clicks by browser
    const browserStats = link.clicks.reduce((acc, click) => {
      const browser = click.browser || "Unknown";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clicks by device
    const deviceStats = link.clicks.reduce((acc, click) => {
      const device = click.device || "desktop";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clicks by referrer
    const referrerStats = link.clicks.reduce((acc, click) => {
      const referrer = click.referrer ? new URL(click.referrer).hostname : "Direct";
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clicks over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clicksOverTime = link.clicks
      .filter((c) => c.timestamp >= thirtyDaysAgo)
      .reduce((acc, click) => {
        const date = click.timestamp.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return NextResponse.json({
      link: {
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
      },
      stats: {
        totalClicks,
        countryStats: Object.entries(countryStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        browserStats: Object.entries(browserStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        deviceStats: Object.entries(deviceStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        referrerStats: Object.entries(referrerStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        clicksOverTime: Object.entries(clicksOverTime)
          .map(([date, clicks]) => ({ date, clicks }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
      recentClicks: link.clicks.slice(0, 50).map((c) => ({
        timestamp: c.timestamp,
        country: c.country,
        city: c.city,
        device: c.device,
        browser: c.browser,
        referrer: c.referrer,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
