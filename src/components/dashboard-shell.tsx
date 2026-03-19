"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Members", href: "/members" },
  { label: "Events", href: "/events" },
  { label: "Pipelines", href: "/pipelines" },
  { label: "Action Items", href: "/actions" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <aside className="w-56 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">SEC Dashboard</h1>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button
            onClick={() => signOut()}
            className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
