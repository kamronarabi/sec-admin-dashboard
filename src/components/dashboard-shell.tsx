"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
  LayoutDashboard,
  Activity,
  Users,
  Calendar,
  CheckSquare,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pipelines", href: "/pipelines", icon: Activity },
  { label: "Members", href: "/members", icon: Users },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Action Items", href: "/action-items", icon: CheckSquare },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(33,150,243,0.12)";
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.25)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(33,150,243,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Menu size={16} color="rgba(255,255,255,0.5)" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden p-4">{children}</main>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setDrawerOpen(false)}
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
        >
          {/* Drawer panel */}
          <div
            className="absolute top-0 right-0 h-full w-64 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.4), -2px 0 8px rgba(33,150,243,0.05)",
              animation: "slideIn 200ms ease-out",
            }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Navigation
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center w-6 h-6 rounded cursor-pointer transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <X size={13} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setDrawerOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-left cursor-pointer transition-all duration-200"
                    style={{
                      background: active
                        ? "rgba(33,150,243,0.12)"
                        : "transparent",
                      color: active
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.5)",
                      border: active
                        ? "1px solid rgba(33,150,243,0.2)"
                        : "1px solid transparent",
                      boxShadow: active
                        ? "0 0 12px rgba(33,150,243,0.1)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      }
                    }}
                  >
                    <Icon
                      size={14}
                      style={{
                        color: active ? "#2196F3" : "currentColor",
                        filter: active
                          ? "drop-shadow(0 0 4px #2196F3)"
                          : "none",
                      }}
                    />
                    <span className="text-[12px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sign out at bottom */}
            <div
              className="px-3 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,83,80,0.08)";
                  e.currentTarget.style.color = "rgba(239,83,80,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }}
              >
                <LogOut size={14} />
                <span className="text-[12px] font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer slide-in animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
