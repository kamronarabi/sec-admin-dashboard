"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(33,150,243,0.06) 0%, transparent 60%), #0f0f1a",
      }}
    >
      {/* Header bar */}
      <header
        className="relative flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Azure accent line at very top */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(33,150,243,0.5) 30%, rgba(66,165,245,0.7) 50%, rgba(33,150,243,0.5) 70%, transparent 95%)",
          }}
        />

        <div className="flex items-center gap-3">
          <div style={{ filter: "drop-shadow(0 0 12px rgba(33,150,243,0.25))" }}>
            <Image src="/SECLOGO.png" alt="SEC Logo" width={28} height={28} />
          </div>
          <div className="flex items-center gap-2">
            <h1
              className="font-semibold text-sm tracking-wide"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              SEC Admin
            </h1>
            <span
              className="text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
              style={{
                color: "rgba(33,150,243,0.8)",
                background: "rgba(33,150,243,0.08)",
                border: "1px solid rgba(33,150,243,0.15)",
              }}
            >
              Dashboard
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 text-[11px] rounded-md transition-all duration-200 cursor-pointer"
          style={{
            color: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden p-4">{children}</main>
    </div>
  );
}
