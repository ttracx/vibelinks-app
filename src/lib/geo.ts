export interface GeoData {
  country?: string;
  city?: string;
  region?: string;
}

export async function getGeoFromIP(ip: string): Promise<GeoData> {
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return { country: "Local", city: "localhost", region: "Development" };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName`);
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country || "Unknown",
        city: data.city || "Unknown",
        region: data.regionName || "Unknown",
      };
    }
  } catch (error) {
    console.error("Geo lookup failed:", error);
  }

  return { country: "Unknown", city: "Unknown", region: "Unknown" };
}
