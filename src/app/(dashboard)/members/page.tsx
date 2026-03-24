"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, BarChart3 } from "lucide-react";
import { MembersWidget } from "@/components/widgets/members-widget";
import { DemographicsCharts } from "@/components/members/demographics-charts";

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 0 30px rgba(33,150,243,0.03), 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(33,150,243,0.25) 50%, transparent 90%)",
        }}
      />
      <div className="p-3 h-full">{children}</div>
    </div>
  );
}

export default function MembersPage() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
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
        <Users
          size={16}
          color="#2196F3"
          style={{ filter: "drop-shadow(0 0 6px #2196F3)" }}
        />
        <h1
          className="text-sm font-semibold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Members
        </h1>
      </div>

      {/* Demographics Charts */}
      <div className="flex items-center gap-2">
        <BarChart3
          size={14}
          color="#2196F3"
          style={{ filter: "drop-shadow(0 0 6px #2196F3)" }}
        />
        <h2
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Member Demographics
        </h2>
      </div>
      <DemographicsCharts />

      {/* Members table — full width */}
      <GlassPanel className="flex-1 min-h-0">
        <MembersWidget embedded />
      </GlassPanel>
    </div>
  );
}
