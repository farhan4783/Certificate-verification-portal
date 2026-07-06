"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";

interface Props {
  id: string;
  certificateId: string;
}

export default function RevokeButton({ id, certificateId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRevoke() {
    const reason = window.prompt(
      `Are you sure you want to revoke certificate ${certificateId}?\n\nPlease enter the reason for revocation (required):`
    );

    if (reason === null) return; // user cancelled

    if (!reason.trim()) {
      alert("A revocation reason is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/certificates/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error?.message || "Failed to revoke certificate");
        return;
      }

      alert("Certificate revoked successfully.");
      router.refresh(); // Refresh page data
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      className="p-2 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-450 rounded-lg transition-all duration-150 disabled:opacity-50"
      title="Revoke Certificate"
    >
      <Ban className="h-4 w-4" />
    </button>
  );
}
