"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Activity, BarChart3, Settings } from "lucide-react";
import { PipelineStatusCards } from "@/components/pipelines/pipeline-status-cards";
import { AnalyticsSummary } from "@/components/pipelines/analytics-summary";
import { SyncHistoryTable } from "@/components/pipelines/sync-history-table";
import { SpreadsheetConfig } from "@/components/pipelines/spreadsheet-config";

type Tab = "monitor" | "config";

export default function PipelinesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("monitor");
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "monitor", label: "Monitor", icon: <BarChart3 size={12} /> },
    { id: "config", label: "Configuration", icon: <Settings size={12} /> },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
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
          <Activity
            size={16}
            color="#2196F3"
            style={{ filter: "drop-shadow(0 0 6px #2196F3)" }}
          />
          <h1
            className="text-sm font-semibold uppercase tracking-[0.12em]"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Pipelines
          </h1>
        </div>

        {/* Tab navigation */}
        <div
          className="flex rounded-md overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-all duration-200 cursor-pointer"
              style={{
                color: activeTab === tab.id ? "rgba(33,150,243,0.9)" : "rgba(255,255,255,0.4)",
                background: activeTab === tab.id ? "rgba(33,150,243,0.1)" : "transparent",
                borderRight: tab.id !== tabs[tabs.length - 1].id ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {activeTab === "monitor" && (
          <>
            <PipelineStatusCards
              onSyncComplete={() => setRefreshKey((k) => k + 1)}
            />
            <AnalyticsSummary key={refreshKey} />
            <SyncHistoryTable refreshKey={refreshKey} />
          </>
        )}

        {activeTab === "config" && <SpreadsheetConfig />}
      </div>
    </div>
  );
}
