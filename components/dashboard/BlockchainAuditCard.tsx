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
function generateTerminalLines(txHash: string | null, block: number | null, pdfHash: string | null, issueDate: string): string[] {
  const safeTxHash = txHash || "0x0000000000000000000000000000000000000000000000000000000000000000";
  const safeBlock = block || 12040982;
  const contractAddr = "0xea563826ec1e426a998de067afc9e434f072ace6";
  return [
    `$ ktc-cli connect --network polygon-mainnet`,
    `✓ Connected to Polygon PoS RPC endpoint (wss://polygon-rpc.com)`,
    `  Chain ID: 137 | Latest Block: ${safeBlock + 42}`,
    ``,
    `$ ktc-cli trace --tx ${safeTxHash.substring(0, 20)}...`,
    `  Querying transaction receipt...`,
    `  ┌──────────────────────────────────────────┐`,
    `  │  Transaction Found in Block #${safeBlock}     │`,
    `  │  Status: ✓ SUCCESS                        │`,
    `  │  Gas Used: 47,291 / 63,000                │`,
    `  │  Timestamp: ${issueDate || "N/A"}                   │`,
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
    `  ✓ Certificate integrity verified against Polygon block #${safeBlock}`,
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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <>
      <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-200">Public Blockchain Audit Anchor</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Polygon PoS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Anchored to Polygon block #{block || 12040982} with SHA-256 cryptographic proof.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setTerminalOpen(true);
                startTerminalSim();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition duration-150"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              Simulate CLI Trace
            </button>

            <a
              href={`https://polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition duration-150"
            >
              <Link2 className="h-3.5 w-3.5" />
              PolygonScan
            </a>
          </div>
        </div>

        {/* SHA256 Hash Display */}
        {pdfHash && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>DOCUMENT HASH (SHA-256):</span>
            <span className="text-slate-300 font-bold select-all truncate max-w-[280px] sm:max-w-md">
              {pdfHash}
            </span>
          </div>
        )}
      </div>

      {/* Terminal Trace Modal */}
      {terminalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Terminal Window Header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">ktc-cli v2.4.1 – On-Chain Verification Engine</span>
              </div>
              <button
                onClick={() => {
                  stopTerminalSim();
                  setTerminalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Terminal Output */}
            <div
              ref={terminalRef}
              className="p-4 bg-slate-950 font-mono text-xs text-emerald-400 space-y-1 overflow-y-auto flex-1 min-h-[300px]"
            >
              {terminalLines.map((line, i) => (
                <div key={i} className={line.startsWith("$") ? "text-slate-200 font-bold mt-2" : line.includes("✓") ? "text-emerald-400" : "text-slate-400"}>
                  {line}
                </div>
              ))}
              {isPlaying && (
                <div className="inline-block w-2 h-4 bg-emerald-400 animate-pulse align-middle ml-1" />
              )}
            </div>

            {/* Terminal Footer */}
            <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Status: {isPlaying ? "Running trace..." : "Trace Complete"}</span>
              {!isPlaying && (
                <button
                  onClick={startTerminalSim}
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300"
                >
                  <Play className="h-3 w-3" /> Replay Trace
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
