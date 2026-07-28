"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, UserCheck } from "lucide-react";

interface AttendanceCheckInButtonProps {
  sessionId?: string;
}

export default function AttendanceCheckInButton({ sessionId }: AttendanceCheckInButtonProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/student/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setCheckedIn(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (checkedIn) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        Checked In Today!
      </div>
    );
  }

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading || !sessionId}
      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <UserCheck className="h-4 w-4" />
          Mark Attendance
        </>
      )}
    </button>
  );
}
