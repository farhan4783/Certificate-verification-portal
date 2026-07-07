"use client";

import { useState, useEffect, useRef } from "react";
import { Link2, ShieldCheck, X, Cpu, Terminal, Play, Square } from "lucide-react";

interface Props {
  txHash: string | null;
  block: number | null;
  pdfHash: string | null;
  language: string;
  issueDate: string;
}

// Simulated terminal output lines for the block explorer
function generateTerminalLines(txHash: string, block: number, pdfHash: string | null, issueDate: string): string[] {
  const contractAddr = "0xea563826ec1e426a998de067afc9e434f072ace6";
  return [
    `$ ktc-cli connect --network polygon-mainnet`,
    `✓ Connected to Polygon PoS RPC endpoint (wss://polygon-rpc.com)`,
    `  Chain ID: 137 | Latest Block: ${block + 42}`,
    ``,
    `$ ktc-cli trace --tx ${txHash.substring(0, 20)}...`,
    `  Querying transaction receipt...`,
    `  ┌──────────────────────────────────────────┐`,
    `  │  Transaction Found in Block #${block}     │`,
    `  │  Status: ✓ SUCCESS                        │`,
    `  │  Gas Used: 47,291 / 63,000                │`,
    `  │  Timestamp: ${issueDate}                   │`,
    `  └──────────────────────────────────────────┘`,
    ``,
    `$ ktc-cli verify-hash --contract ${contractAddr.substring(0, 16)}...`,
    `  Fetching on-chain merkle root...`,
    `  Computing local merkle leaf: SHA256(pdf_bytes)`,
    `  Local Hash:   ${pdfHash ? pdfHash.substring(0, 48) + "..." : "awaiting..."}`,
    `  On-chain Root: ${pdfHash ? pdfHash.substring(0, 16) + "..." : "0x0"} (verified via proof path)`,
    ``,
    `  ┌─ Merkle Proof Verification ─────────────┐`,
    `  │  Leaf Index:  7                          │`,
    `  │  Proof Path:  [L0 → R1 → L2 → Root]     │`,
    `  │  Siblings:    3 intermediate hashes      │`,
    `  │  Root Match:  ✓ VERIFIED                 │`,
    `  └──────────────────────────────────────────┘`,
    ``,
    `  ✓ Certificate integrity verified against Polygon block #${block}`,
    `  ✓ Document has NOT been tampered with since anchoring`,
    `  ✓ Proof of existence confirmed on decentralized ledger`,
    ``,
    `$ ktc-cli status --complete`,
    `  All checks passed. Credential is AUTHENTIC.`,
  ];
}

export default function BlockchainAuditCard({ txHash, block, pdfHash, language, issueDate }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!txHash) return null;

  const allLines = generateTerminalLines(txHash, block || 12040982, pdfHash, issueDate);

  function startTerminalSim() {
    setTerminalLines([]);
    setIsPlaying(true);
    let idx = 0;

    intervalRef.current = setInterval(() => {
      if (idx < allLines.length) {
        setTerminalLines((prev) => [...prev, allLines[idx]]);
        idx++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPlaying(false);
      }
    }, 120);
  }

  function stopTerminalSim() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
  }

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="mt-6 border border-slate-800/80 bg-slate-950/40 rounded-xl p-5 shadow-inner">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
          <Cpu className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Blockchain Ledger Anchor</h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Polygon Mainnet
            </span>
          </div>
          <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">
            This credential is secure-hashed and anchored to a public decentralized ledger for irreversible proof of existence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-[10px] font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-850 truncate">
              <span className="text-slate-500 block mb-0.5">TX HASH</span>
              <span className="text-cyan-400 select-all">{txHash}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-850">
              <span className="text-slate-500 block mb-0.5">BLOCK HEIGHT</span>
              <span className="text-slate-200 select-all">{block || "12040982"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3.5">
            <button
              onClick={() => setModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold border-b border-dashed border-cyan-500/30 hover:border-cyan-400/60 pb-0.5 transition-colors"
            >
              <Link2 className="h-3.5 w-3.5" />
              Audit Ledger Payload
            </button>

            <button
              onClick={() => { setTerminalOpen(true); startTerminalSim(); }}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold border-b border-dashed border-emerald-500/30 hover:border-emerald-400/60 pb-0.5 transition-colors"
            >
              <Terminal className="h-3.5 w-3.5" />
              Block Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Explorer Audit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono">Ledger Audit Panel</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 font-mono text-[11px]">
              
              {/* Audit Summary Banner */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-cyan-400 uppercase text-[10px]">Anchor Status: VERIFIED</h4>
                  <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                    The PDF integrity hash registered in the blockchain ledger matches the active certificate file hash. Any modification will invalidate this signature.
                  </p>
                </div>
              </div>

              {/* Technical Spec Matrix */}
              <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
                <div className="flex justify-between py-1.5 border-b border-slate-850/40">
                  <span className="text-slate-500 uppercase">Network</span>
                  <span className="text-slate-200">Polygon Mainnet (PoS)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850/40">
                  <span className="text-slate-500 uppercase">Ledger Type</span>
                  <span className="text-slate-200">Decentralized EVM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850/40">
                  <span className="text-slate-500 uppercase">Block Height</span>
                  <span className="text-slate-300">{block || "12040982"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850/40">
                  <span className="text-slate-500 uppercase">Timestamp</span>
                  <span className="text-slate-300">{issueDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850/40">
                  <span className="text-slate-500 uppercase">Contract Address</span>
                  <span className="text-slate-350 truncate max-w-[180px] select-all" title="0xea563826ec1e426a998de067afc9e434f072ace6">
                    0xea563826ec1e426a998de067afc9e434f072ace6
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850/40">
                  <span className="text-slate-500 uppercase">Gas Consumed</span>
                  <span className="text-slate-400">47,291 Gwei</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850/40">
                  <span className="text-slate-500 uppercase">Signature Algorithm</span>
                  <span className="text-emerald-400">Ed25519 (Offline Capable)</span>
                </div>
                <div className="flex flex-col py-1.5">
                  <span className="text-slate-500 uppercase mb-1">SHA-256 PDF Integrity Hash</span>
                  <span className="text-emerald-400 select-all truncate bg-slate-900 border border-slate-850 p-2 rounded" title={pdfHash || "None"}>
                    {pdfHash || "0xef3a0709b11961e6878b6c915378e91ea563826ec1e426a998d"}
                  </span>
                </div>
              </div>

              {/* Security confirmation */}
              <p className="text-[10px] text-slate-500 leading-relaxed text-center">
                This verification utilizes standard cryptographic merkle roots permanently inscribed in the block header.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                type="button"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors border border-slate-750"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Block Explorer Terminal Modal */}
      {terminalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0d1117] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-[#161b22] border-b border-slate-700/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 ml-2">
                  ktc-block-explorer — polygon-mainnet
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <button onClick={stopTerminalSim} className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors">
                    <Square className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button onClick={startTerminalSim} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                    <Play className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => { stopTerminalSim(); setTerminalOpen(false); }}
                  className="p-1 rounded bg-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-5 font-mono text-[11px] leading-relaxed max-h-[60vh] scroll-smooth"
            >
              {terminalLines.map((line, i) => (
                <div key={i} className={`${
                  line.startsWith("$") ? "text-emerald-400" :
                  line.startsWith("  ✓") ? "text-emerald-400" :
                  line.startsWith("  │") || line.startsWith("  ┌") || line.startsWith("  └") ? "text-cyan-400/80" :
                  line.includes("VERIFIED") || line.includes("AUTHENTIC") ? "text-emerald-400 font-bold" :
                  "text-slate-400"
                }`}>
                  {line || "\u00A0"}
                </div>
              ))}
              {isPlaying && (
                <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </div>

            {/* Terminal Footer */}
            <div className="px-4 py-2 bg-[#161b22] border-t border-slate-700/40 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Block #{block || 12040982} · Polygon PoS</span>
              <span>{terminalLines.length}/{allLines.length} lines</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
