"use client";

import { useState } from "react";
import IssueCertificateForm from "./IssueCertificateForm";
import BulkIssueForm from "./BulkIssueForm";

interface Student {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

interface Course {
  id: string;
  title: string;
}

interface Props {
  eligibleStudents: Student[];
  courses: Course[];
}

export default function TrainerIssuanceTabs({ eligibleStudents, courses }: Props) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  return (
    <div className="space-y-4">
      {/* Tabs Header */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "single"
              ? "bg-violet-600 text-white shadow-md shadow-violet-650/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          👤 Single Issuance
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "bulk"
              ? "bg-violet-600 text-white shadow-md shadow-violet-650/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          📂 Bulk CSV
        </button>
      </div>

      {/* Tabs Content */}
      <div className="transition-all duration-200">
        {activeTab === "single" ? (
          <IssueCertificateForm eligibleStudents={eligibleStudents} courses={courses} />
        ) : (
          <BulkIssueForm courses={courses} />
        )}
      </div>
    </div>
  );
}
