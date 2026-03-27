"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, Search, X, ChevronDown } from "lucide-react";

interface MailingMember {
  id: number;
  email: string;
  name: string;
}

interface RecipientPickerProps {
  onChange: (emails: string[]) => void;
}

export function RecipientPicker({ onChange }: RecipientPickerProps) {
  const [mode, setMode] = useState<"mailing_list" | "select">("mailing_list");
  const [mailingList, setMailingList] = useState<MailingMember[]>([]);
  const [allMembers, setAllMembers] = useState<MailingMember[]>([]);
  const [selected, setSelected] = useState<MailingMember[]>([]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/members/mailing-list")
      .then((r) => r.json())
      .then(setMailingList);
    fetch("/api/members?sortBy=name&sortDir=ASC")
      .then((r) => r.json())
      .then((data) =>
        setAllMembers(
          (data as MailingMember[]).map((m) => ({
            id: m.id,
            email: m.email,
            name: m.name,
          }))
        )
      );
  }, []);

  useEffect(() => {
    if (mode === "mailing_list") {
      onChange(mailingList.map((m) => m.email));
    } else {
      onChange(selected.map((m) => m.email));
    }
  }, [mode, mailingList, selected, onChange]);

  const toggleMember = useCallback(
    (member: MailingMember) => {
      setSelected((prev) => {
        const exists = prev.find((m) => m.id === member.id);
        return exists ? prev.filter((m) => m.id !== member.id) : [...prev, member];
      });
    },
    []
  );

  const filtered = allMembers.filter(
    (m) =>
      !selected.find((s) => s.id === m.id) &&
      (m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()))
  );

  const recipientCount = mode === "mailing_list" ? mailingList.length : selected.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
          To:
        </span>

        {/* Mode toggle */}
        <div
          className="flex rounded-md overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            type="button"
            onClick={() => setMode("mailing_list")}
            className="text-[10px] font-medium px-2.5 py-1 transition-all duration-150 cursor-pointer"
            style={{
              background:
                mode === "mailing_list"
                  ? "rgba(33,150,243,0.15)"
                  : "rgba(255,255,255,0.02)",
              color:
                mode === "mailing_list"
                  ? "#2196F3"
                  : "rgba(255,255,255,0.4)",
            }}
          >
            <Users size={10} className="inline mr-1" style={{ verticalAlign: "-1px" }} />
            Mailing List
          </button>
          <button
            type="button"
            onClick={() => setMode("select")}
            className="text-[10px] font-medium px-2.5 py-1 transition-all duration-150 cursor-pointer"
            style={{
              background:
                mode === "select"
                  ? "rgba(33,150,243,0.15)"
                  : "rgba(255,255,255,0.02)",
              color:
                mode === "select" ? "#2196F3" : "rgba(255,255,255,0.4)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Select Members
          </button>
        </div>

        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
          style={{
            background: "rgba(33,150,243,0.1)",
            color: "rgba(33,150,243,0.7)",
          }}
        >
          {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Select mode: search + chips */}
      {mode === "select" && (
        <div>
          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selected.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(33,150,243,0.1)",
                    color: "rgba(33,150,243,0.8)",
                    border: "1px solid rgba(33,150,243,0.15)",
                  }}
                >
                  {m.name}
                  <button
                    type="button"
                    onClick={() => toggleMember(m)}
                    className="cursor-pointer hover:text-white"
                  >
                    <X size={9} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search dropdown */}
          <div className="relative">
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Search size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search members..."
                className="flex-1 bg-transparent text-[11px] outline-none"
                style={{ color: "rgba(255,255,255,0.8)" }}
              />
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="cursor-pointer"
              >
                <ChevronDown
                  size={11}
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    transform: dropdownOpen ? "rotate(180deg)" : "none",
                    transition: "transform 150ms",
                  }}
                />
              </button>
            </div>

            {dropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-md max-h-[150px] overflow-y-auto z-20"
                style={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  scrollbarWidth: "thin",
                }}
              >
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    No members found
                  </div>
                ) : (
                  filtered.slice(0, 20).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        toggleMember(m);
                        setSearch("");
                      }}
                      className="w-full text-left px-3 py-1.5 transition-colors duration-100 cursor-pointer"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(33,150,243,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {m.name}
                      </span>
                      <span className="text-[10px] ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {m.email}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
