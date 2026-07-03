"use client";

interface Props {
  certificateId: string;
}

export default function CopyLinkButton({ certificateId }: Props) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/verify/${certificateId}`
      );
      // Brief visual feedback via a toast-like approach using alert for simplicity
      // In a real app, use a toast library
    } catch {
      // Fallback for browsers that deny clipboard access
      const url = `${window.location.origin}/verify/${certificateId}`;
      window.prompt("Copy this verification link:", url);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors text-center"
    >
      🔗 Copy Link
    </button>
  );
}
