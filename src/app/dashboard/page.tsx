"use client";

import { useEffect, useState } from "react";
import { Link2, BarChart3, Globe, Monitor, ExternalLink, ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import Link from "next/link";

interface LinkData {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

interface Stats {
  totalClicks: number;
  countryStats: Array<{ name: string; value: number }>;
  browserStats: Array<{ name: string; value: number }>;
  deviceStats: Array<{ name: string; value: number }>;
  referrerStats: Array<{ name: string; value: number }>;
  clicksOverTime: Array<{ date: string; clicks: number }>;
}

const COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (selectedLink) {
      fetchStats(selectedLink);
    }
  }, [selectedLink]);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      const data = await response.json();
      setLinks(data.links || []);
      if (data.links?.length > 0) {
        setSelectedLink(data.links[0].shortCode);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (code: string) => {
    try {
      const response = await fetch(`/api/links/${code}/stats`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Links</p>
            <p className="text-3xl font-bold text-white">{links.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Clicks</p>
            <p className="text-3xl font-bold text-white">{totalClicks}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Avg Clicks/Link</p>
            <p className="text-3xl font-bold text-white">
              {links.length > 0 ? (totalClicks / links.length).toFixed(1) : 0}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Active Links</p>
            <p className="text-3xl font-bold text-white">{links.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Links List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur rounded-xl border border-white/20 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-400" />
                  Your Links
                </h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {links.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setSelectedLink(link.shortCode)}
                    className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition ${
                      selectedLink === link.shortCode ? "bg-white/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-cyan-400 font-medium truncate">/{link.shortCode}</p>
                        <p className="text-gray-500 text-sm truncate">{link.originalUrl}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-white font-semibold">{link._count.clicks}</p>
                        <p className="text-gray-500 text-xs">clicks</p>
                      </div>
                    </div>
                  </button>
                ))}
                {links.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    No links yet. Create one to get started!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            {stats && stats.totalClicks > 0 ? (
              <>
                {/* Clicks Over Time */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Clicks Over Time</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.clicksOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="clicks"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={{ fill: "#0ea5e9" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Countries */}
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      Top Countries
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.countryStats.slice(0, 5)}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            label={({ name, percent }) =>
                              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                          >
                            {stats.countryStats.slice(0, 5).map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Browsers */}
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-cyan-400" />
                      Browsers
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.browserStats.slice(0, 5)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            stroke="#9ca3af"
                            fontSize={12}
                            width={80}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              border: "none",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Devices */}
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Devices</h3>
                    <div className="space-y-3">
                      {stats.deviceStats.map((d, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-white/10 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                style={{
                                  width: `${(d.value / stats.totalClicks) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-white font-medium w-12 text-right">
                              {d.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Referrers */}
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-cyan-400" />
                      Top Referrers
                    </h3>
                    <div className="space-y-3">
                      {stats.referrerStats.slice(0, 5).map((r, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-gray-300 truncate max-w-[150px]">{r.name}</span>
                          <span className="text-white font-medium">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur rounded-xl p-16 border border-white/20 text-center">
                <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Analytics Yet</h3>
                <p className="text-gray-400">
                  {links.length > 0
                    ? "Share your links to start tracking clicks!"
                    : "Create a link to get started with analytics"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
