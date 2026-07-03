"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  id: string;
  endpoint: string;
  confirmMessage?: string;
}

export default function DeleteButton({ id, endpoint, confirmMessage }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const msg = confirmMessage || "Are you sure you want to delete this record? This action cannot be undone.";
    if (!window.confirm(msg)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error?.message || "Failed to delete record");
        return;
      }

      router.refresh(); // Refresh page data
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-lg transition-all duration-150"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
