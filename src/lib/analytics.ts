import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export interface ClickData {
  ip: string | null;
  userAgent: string | null;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
}

export async function getClickData(): Promise<ClickData> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || null;
  const referrer = headersList.get("referer") || null;
  
  // Get IP from various headers
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    null;

  let device: string | null = null;
  let browser: string | null = null;
  let os: string | null = null;

  if (userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    device = result.device.type || "desktop";
    browser = result.browser.name || null;
    os = result.os.name || null;
  }

  return { ip, userAgent, referrer, device, browser, os };
}
