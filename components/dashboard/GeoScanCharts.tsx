"use client";

import { useEffect, useState } from "react";
import { Laptop, Tablet, Smartphone, Globe, Shield, RefreshCw, Award } from "lucide-react";

export default function GeoScanCharts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/verification-logs");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to fetch analytics");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="col-span-1 md:col-span-2 h-64 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 text-violet-500 animate-spin" />
          <span className="text-xs text-slate-500 font-mono">Loading live verification logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-1 md:col-span-2 h-64 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
        <span className="text-xs text-rose-450 font-mono">⚠️ Error: {error}</span>
      </div>
    );
  }

  const deviceIcons: Record<string, any> = {
    Desktop: <Laptop className="h-4 w-4" />,
    Mobile: <Smartphone className="h-4 w-4" />,
    Tablet: <Tablet className="h-4 w-4" />,
    Unknown: <Globe className="h-4 w-4" />,
  };

  const statusStyles: Record<string, string> = {
    VALID: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    INVALID: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    REVOKED: "text-red-400 bg-red-500/10 border-red-500/20",
    EXPIRED: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  const totalScans = data.timeline.reduce((acc: number, item: any) => acc + item.count, 0);

  return (
    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Timeline Sparklines */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Verification Scans Timeline</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Scans tracked over the last 7 days</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-violet-400">{totalScans}</span>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Scans (7d)</p>
          </div>
        </div>

        {/* Custom Pure-CSS Bar Graph */}
        <div className="h-32 flex items-end justify-between gap-3 pt-4 border-b border-slate-800">
          {data.timeline.map((item: any, idx: number) => {
            const maxVal = Math.max(...data.timeline.map((t: any) => t.count), 1);
            const heightPercent = Math.round((item.count / maxVal) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[10px] font-mono text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                  {item.count} scans
                </div>
                
                <div
                  className="w-full bg-violet-600/20 group-hover:bg-violet-600 rounded-t-md transition-all duration-300 shadow-md shadow-violet-900/10 group-hover:shadow-violet-600/20"
                  style={{ height: `${Math.max(heightPercent, 8)}%` }}
                />
                <span className="text-[9px] font-mono text-slate-500 mt-2 rotate-12">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scans By Device */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Scans by Device Type</h2>
        <div className="space-y-4">
          {data.devices.length === 0 ? (
            <p className="text-xs text-slate-500">No device scan logs recorded.</p>
          ) : (
            data.devices.map((device: any, idx: number) => {
              const totalDevices = data.devices.reduce((acc: number, d: any) => acc + d.count, 0);
              const percent = Math.round((device.count / totalDevices) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      {deviceIcons[device.name] || <Globe className="h-4 w-4" />}
                      <span>{device.name}</span>
                    </div>
                    <span className="font-mono text-slate-200 font-semibold">{device.count} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Scans By Country (Geo-Tracking) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Geographic Scan Locations</h2>
        <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
          {data.countries.length === 0 ? (
            <p className="text-xs text-slate-500">No geographic scan logs recorded.</p>
          ) : (
            data.countries.map((country: any, idx: number) => {
              const totalCountries = data.countries.reduce((acc: number, c: any) => acc + c.count, 0);
              const percent = Math.round((country.count / totalCountries) * 100);
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sm shrink-0">
                    🌍
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate">{country.name === "local" ? "Local Network (127.0.0.1)" : country.name}</span>
                      <span className="font-mono font-medium text-slate-400 shrink-0">{country.count} scans</span>
                    </div>
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Top Scanned Certificates */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Most Active Verification Audits (Top 5)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider text-left">
                <th className="pb-3">Certificate ID</th>
                <th className="pb-3">Recipient</th>
                <th className="pb-3">Course / Title</th>
                <th className="pb-3 text-right">Verification Scans</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {data.topCertificates.map((cert: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-850/20">
                  <td className="py-3 font-mono text-amber-400">{cert.certificateId}</td>
                  <td className="py-3 text-slate-200">{cert.studentName}</td>
                  <td className="py-3 text-slate-400 truncate max-w-[200px]">{cert.courseTitle}</td>
                  <td className="py-3 text-right font-mono text-slate-100 font-semibold">{cert.scanCount}</td>
                </tr>
              ))}
              {data.topCertificates.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No certificate verifications recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Verification Logs List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Live Scan Logs Audit</h2>
        <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
          {data.recentLogs.map((rl: any, idx: number) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-slate-850 bg-slate-950/20 hover:border-slate-800 transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-full bg-slate-950 flex items-center justify-center text-xs shrink-0 text-slate-500 mt-0.5">
                  {deviceIcons[rl.device] || <Globe className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-amber-400 font-semibold">{rl.certificateId}</span>
                    <span className="text-[10px] text-slate-450">({rl.studentName})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                    <span>Region: <strong className="text-slate-400">{rl.country === "local" ? "Local (Dev)" : rl.country}</strong></span>
                    <span>Device: <strong className="text-slate-400">{rl.device}</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-end gap-2 justify-between">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono border ${statusStyles[rl.result] || "text-slate-400 border-slate-800"}`}>
                  {rl.result}
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {new Date(rl.verifiedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {data.recentLogs.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">No verifications logs found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
