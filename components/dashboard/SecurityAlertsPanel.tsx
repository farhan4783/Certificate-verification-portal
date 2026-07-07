"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Globe, Bot, Activity, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface AnomalyAlert {
  type: "GEO_VELOCITY" | "EXCESSIVE_SCANS" | "BOT_SUSPECTED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  certificateId: string;
  humanCertificateId: string;
  description: string;
  metadata: Record<string, unknown>;
  detectedAt: string;
}

interface AlertsResponse {
  success: boolean;
  data: {
    totalAlerts: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    alerts: AnomalyAlert[];
  };
}

const typeIcons: Record<string, React.ReactNode> = {
  GEO_VELOCITY: <Globe className="h-4 w-4" />,
  EXCESSIVE_SCANS: <Activity className="h-4 w-4" />,
  BOT_SUSPECTED: <Bot className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  GEO_VELOCITY: "Geo Velocity",
  EXCESSIVE_SCANS: "Excessive Scans",
  BOT_SUSPECTED: "Bot Suspected",
};

const severityStyles: Record<string, string> = {
  CRITICAL: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  LOW: "bg-slate-700/30 text-slate-400 border-slate-600/30",
};

export default function SecurityAlertsPanel() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [summary, setSummary] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);

  async function fetchAlerts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics/security-alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data: AlertsResponse = await res.json();
      setAlerts(data.data.alerts);
      setSummary({
        total: data.data.totalAlerts,
        critical: data.data.criticalCount,
        high: data.data.highCount,
        medium: data.data.mediumCount,
        low: data.data.lowCount,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load security alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 cursor-pointer hover:bg-slate-900/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Security & Anomaly Alerts</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Real-time fraud detection across verification logs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {summary.total > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 animate-pulse">
              {summary.total} Alert{summary.total !== 1 ? "s" : ""}
            </span>
          )}
          {summary.total === 0 && !loading && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              All Clear
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); fetchAlerts(); }}
            type="button"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-6 space-y-4">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-rose-400">{summary.critical}</p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Critical</p>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-400">{summary.high}</p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">High</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{summary.medium}</p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Medium</p>
            </div>
            <div className="bg-slate-700/15 border border-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-400">{summary.low}</p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Low</p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-8 text-center">
              <RefreshCw className="h-5 w-5 text-slate-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Scanning verification logs for anomalies...</p>
            </div>
          )}

          {/* Alerts List */}
          {!loading && alerts.length > 0 && (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 hover:border-slate-700/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === "CRITICAL" ? "bg-rose-500/15 text-rose-400" :
                      alert.severity === "HIGH" ? "bg-orange-500/15 text-orange-400" :
                      "bg-amber-500/15 text-amber-400"
                    }`}>
                      {typeIcons[alert.type] || <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-200">
                          {typeLabels[alert.type] || alert.type}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${severityStyles[alert.severity]}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="font-mono text-amber-400">{alert.humanCertificateId}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">
                          {new Date(alert.detectedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Alerts State */}
          {!loading && alerts.length === 0 && !error && (
            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
              <Shield className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                No anomalies detected. All verification patterns appear normal.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
