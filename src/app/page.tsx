"use client";

import { useState } from "react";
import { Link2, QrCode, BarChart3, Shield, Clock, Layers, ArrowRight, Copy, Check, Download } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; qrCode: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkResults, setBulkResults] = useState<Array<{ original: string; short: string; qr: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          customAlias: customAlias || undefined,
          password: password || undefined,
          expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
        }),
      });

      const data = await response.json();
      if (data.shortUrl) {
        setResult({ shortUrl: data.shortUrl, qrCode: data.qrCode });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const urls = bulkUrls.split("\n").filter((u) => u.trim());

    try {
      const response = await fetch("/api/bulk-shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();
      if (data.results) {
        setBulkResults(data.results);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { icon: Link2, title: "Custom Aliases", desc: "Create memorable branded short links" },
    { icon: QrCode, title: "QR Codes", desc: "Auto-generated QR codes for every link" },
    { icon: BarChart3, title: "Click Analytics", desc: "Track clicks with geographic & device data" },
    { icon: Shield, title: "Password Protection", desc: "Secure sensitive links with passwords" },
    { icon: Clock, title: "Link Expiration", desc: "Set auto-expiry for time-limited campaigns" },
    { icon: Layers, title: "Bulk Shortening", desc: "Shorten multiple URLs at once" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Link2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">VibeLinks</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Smart URL shortening with powerful analytics. Track clicks, geographic data, and more.
          </p>
        </div>

        {/* URL Shortener Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setBulkMode(false)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  !bulkMode ? "bg-white text-purple-600" : "text-white hover:bg-white/10"
                }`}
              >
                Single URL
              </button>
              <button
                onClick={() => setBulkMode(true)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  bulkMode ? "bg-white text-purple-600" : "text-white hover:bg-white/10"
                }`}
              >
                Bulk Shorten
              </button>
            </div>

            {!bulkMode ? (
              <form onSubmit={handleSubmit}>
                <div className="flex gap-3 mb-4">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter your long URL here..."
                    required
                    className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? "..." : "Shorten"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-gray-400 text-sm hover:text-white transition mb-4"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <input
                      type="text"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      placeholder="Custom alias (optional)"
                      className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (optional)"
                      className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <select
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                      className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="">Never expires</option>
                      <option value="1">1 day</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit}>
                <textarea
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  placeholder="Enter URLs (one per line)..."
                  rows={6}
                  className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Shorten All URLs"}
                </button>
              </form>
            )}

            {/* Result */}
            {result && !bulkMode && (
              <div className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-1">Your shortened URL:</p>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 text-xl font-semibold hover:underline break-all"
                    >
                      {result.shortUrl}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(result.shortUrl)}
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
                    </button>
                    <a
                      href={result.qrCode}
                      download="qrcode.png"
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </a>
                  </div>
                </div>
                {result.qrCode && (
                  <div className="mt-4 flex justify-center">
                    <Image src={result.qrCode} alt="QR Code" width={150} height={150} className="rounded-lg bg-white p-2" />
                  </div>
                )}
              </div>
            )}

            {/* Bulk Results */}
            {bulkResults.length > 0 && bulkMode && (
              <div className="mt-6 space-y-3">
                {bulkResults.map((r, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-xs truncate">{r.original}</p>
                      <a href={r.short} target="_blank" className="text-cyan-400 hover:underline">
                        {r.short}
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.short)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-white/5 backdrop-blur rounded-xl border border-white/10 hover:border-white/20 transition"
            >
              <feature.icon className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Dashboard Link */}
        <div className="mt-24 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
          >
            <BarChart3 className="w-5 h-5" />
            View Analytics Dashboard
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        {/* Pricing */}
        <div className="mt-24 max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Pro Plan</h2>
            <p className="text-gray-400">Unlock unlimited links and advanced analytics</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-white">$9</span>
              <span className="text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited short links",
                "Custom aliases",
                "Advanced analytics",
                "Geographic tracking",
                "Password protection",
                "Bulk shortening",
                "API access",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/api/checkout"
              className="block w-full py-4 text-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
            >
              Subscribe Now
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-gray-500 text-sm">
          <p>© 2025 VibeLinks. Powered by VibeCaaS.</p>
        </footer>
      </div>
    </div>
  );
}
