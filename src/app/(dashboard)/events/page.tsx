"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

export default function EventsPage() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(33,150,243,0.15)";
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <ArrowLeft size={14} color="rgba(255,255,255,0.6)" />
        </button>
        <Calendar size={16} color="#2196F3" style={{ filter: "drop-shadow(0 0 6px #2196F3)" }} />
        <h1
          className="text-sm font-semibold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Events
        </h1>
      </div>

      <div
        className="flex-1 rounded-lg flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Full event management — coming soon
        </p>
      </div>
    </div>
  );
}
