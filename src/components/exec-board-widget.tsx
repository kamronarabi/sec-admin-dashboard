"use client";

import { useState } from "react";
import {
  Crown,
  Shield,
  Settings,
  Megaphone,
  Globe,
  BookOpen,
  Box,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OfficerInfo {
  role: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  discord: string | null;
  icon: React.ElementType;
}

const EXEC_BOARD: OfficerInfo[] = [
  {
    role: "President",
    name: null,
    email: null,
    phone: null,
    discord: null,
    icon: Crown,
  },
  {
    role: "Vice President",
    name: null,
    email: null,
    phone: null,
    discord: null,
    icon: Shield,
  },
  {
    role: "Head of Operations",
    name: null,
    email: null,
    phone: null,
    discord: null,
    icon: Settings,
  },
  {
    role: "Head of Marketing",
    name: null,
    email: null,
    phone: null,
    discord: null,
    icon: Megaphone,
  },
  {
    role: "Head of Outreach",
    name: null,
    email: null,
    phone: null,
    discord: null,
    icon: Globe,
  },
  {
    role: "Head of Professional Development",
    name: null,
    email: null,
    phone: null,
    discord: null,
    icon: BookOpen,
  },
  {
    role: "Head of Product",
    name: null,
    email: null,
    phone: null,
    discord: null,
    icon: Box,
  },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="flex items-center justify-center w-5 h-5 rounded transition-all duration-200 cursor-pointer"
      style={{
        background: copied ? "rgba(33,150,243,0.2)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${copied ? "rgba(33,150,243,0.4)" : "rgba(255,255,255,0.06)"}`,
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(33,150,243,0.12)";
          e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        }
      }}
    >
      {copied ? (
        <Check size={9} color="#2196F3" />
      ) : (
        <Copy size={9} color="rgba(255,255,255,0.4)" />
      )}
    </button>
  );
}

function OfficerCard({ officer }: { officer: OfficerInfo }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = officer.icon;
  const isVacant = !officer.name;
  const isPresident = officer.role === "President";

  return (
    <div
      className="relative rounded-md overflow-hidden transition-all duration-300"
      style={{
        background: isPresident
          ? "linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: isPresident
          ? "1px solid rgba(33,150,243,0.2)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isPresident
          ? "0 0 20px rgba(33,150,243,0.06), inset 0 1px 0 rgba(33,150,243,0.1)"
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Top accent line for President */}
      {isPresident && (
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(33,150,243,0.5) 50%, transparent 95%)",
          }}
        />
      )}

      <button
        onClick={() => !isVacant && setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
        style={{ cursor: isVacant ? "default" : "pointer" }}
      >
        {/* Role icon */}
        <div
          className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
          style={{
            background: isPresident
              ? "rgba(33,150,243,0.15)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${isPresident ? "rgba(33,150,243,0.25)" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          <Icon
            size={12}
            color={isPresident ? "#2196F3" : "rgba(255,255,255,0.45)"}
            style={
              isPresident
                ? { filter: "drop-shadow(0 0 4px rgba(33,150,243,0.6))" }
                : undefined
            }
          />
        </div>

        {/* Role + name */}
        <div className="flex-1 text-left min-w-0">
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.12em] leading-none mb-0.5"
            style={{
              color: isPresident
                ? "rgba(33,150,243,0.7)"
                : "rgba(255,255,255,0.35)",
            }}
          >
            {officer.role}
          </div>
          <div
            className="text-[12px] font-medium truncate leading-tight"
            style={{
              color: isVacant
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.85)",
              fontStyle: isVacant ? "italic" : "normal",
            }}
          >
            {officer.name || "Vacant"}
          </div>
        </div>

        {/* Expand indicator */}
        {!isVacant && (
          <div className="shrink-0" style={{ color: "rgba(255,255,255,0.2)" }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        )}
      </button>

      {/* Expanded contact info */}
      {expanded && !isVacant && (
        <div
          className="px-3 pb-2.5 flex flex-col gap-1.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          {officer.email && (
            <div className="flex items-center gap-2 mt-1.5">
              <Mail size={10} color="rgba(255,255,255,0.3)" />
              <span
                className="text-[10px] font-mono flex-1 truncate"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {officer.email}
              </span>
              <CopyButton value={officer.email} label="email" />
            </div>
          )}
          {officer.phone && (
            <div className="flex items-center gap-2">
              <Phone size={10} color="rgba(255,255,255,0.3)" />
              <span
                className="text-[10px] font-mono flex-1 truncate"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {officer.phone}
              </span>
              <CopyButton value={officer.phone} label="phone" />
            </div>
          )}
          {officer.discord && (
            <div className="flex items-center gap-2">
              <MessageCircle size={10} color="rgba(255,255,255,0.3)" />
              <span
                className="text-[10px] font-mono flex-1 truncate"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {officer.discord}
              </span>
              <CopyButton value={officer.discord} label="discord" />
            </div>
          )}
          {!officer.email && !officer.phone && !officer.discord && (
            <p
              className="text-[10px] italic mt-1"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              No contact info added
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ExecBoardWidget() {
  return (
    <div className="h-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Crown
          size={11}
          color="#2196F3"
          style={{ filter: "drop-shadow(0 0 4px #2196F3)" }}
        />
        <h3
          className="text-[10px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Executive Board
        </h3>
      </div>

      {/* Officer cards */}
      <div className="flex-1 overflow-auto min-h-0 flex flex-col gap-1.5 pr-0.5">
        {EXEC_BOARD.map((officer) => (
          <OfficerCard key={officer.role} officer={officer} />
        ))}
      </div>

      {/* Footer */}
      <p
        className="text-[9px] tracking-wide"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Click to expand contact info
      </p>
    </div>
  );
}
