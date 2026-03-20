"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Member, AttendanceRecord } from "@/lib/types";

export function MembersWidget() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchMembers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sortBy", "name");
    params.set("sortDir", "asc");
    const res = await fetch(`/api/members?${params}`);
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const viewMember = async (member: Member) => {
    setSelectedMember(member);
    const res = await fetch(`/api/members/${member.id}/attendance`);
    if (res.ok) setAttendance(await res.json());
  };

  const deleteMember = async (id: number) => {
    if (!confirm("Delete this member?")) return;
    await fetch(`/api/members?id=${id}`, { method: "DELETE" });
    fetchMembers();
  };

  const startEdit = (id: number, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    await fetch("/api/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingCell.id,
        [editingCell.field]: editValue,
      }),
    });
    setEditingCell(null);
    fetchMembers();
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#2196F3", boxShadow: "0 0 8px #2196F3" }}
          />
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Members
          </h3>
          <span
            className="text-[10px] font-mono"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {members.length}
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-[11px] rounded-md px-2.5 w-44 outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.8)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(33,150,243,0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th
                className="text-left text-[10px] font-semibold uppercase tracking-wider py-1.5 pr-3"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Name
              </th>
              <th
                className="text-left text-[10px] font-semibold uppercase tracking-wider py-1.5 pr-3"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Email
              </th>
              <th
                className="text-center text-[10px] font-semibold uppercase tracking-wider py-1.5 w-16"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Events
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-[10px] py-6"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Loading...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-[10px] py-6"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="cursor-pointer transition-colors duration-150"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                  onClick={() => viewMember(m)}
                  onMouseEnter={(ev) => {
                    ev.currentTarget.style.background =
                      "rgba(33,150,243,0.04)";
                  }}
                  onMouseLeave={(ev) => {
                    ev.currentTarget.style.background = "transparent";
                  }}
                >
                  <td
                    className="text-xs py-1.5 pr-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {editingCell?.id === m.id &&
                    editingCell.field === "name" ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        autoFocus
                        className="h-6 text-xs rounded px-1.5 w-full outline-none"
                        style={{
                          background: "rgba(33,150,243,0.1)",
                          border: "1px solid rgba(33,150,243,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      />
                    ) : (
                      <span
                        className="font-medium"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                        onDoubleClick={() =>
                          startEdit(m.id, "name", m.name)
                        }
                      >
                        {m.name}
                      </span>
                    )}
                  </td>
                  <td
                    className="text-[11px] py-1.5 pr-3 font-mono"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {m.email}
                  </td>
                  <td
                    className="text-xs text-center py-1.5 font-mono"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {m.events_attended}
                  </td>
                  <td
                    className="py-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors cursor-pointer"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        ···
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewMember(m)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMember(m.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p
        className="text-[9px] tracking-wide"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Double-click name to edit inline
      </p>

      {/* Member detail dialog */}
      <Dialog
        open={!!selectedMember}
        onOpenChange={() => setSelectedMember(null)}
      >
        <DialogContent
          className="max-w-lg"
          style={{
            background:
              "linear-gradient(135deg, #16213e 0%, #0f0f1a 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 0 60px rgba(33,150,243,0.1), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "rgba(255,255,255,0.9)" }}>
              {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Email</span>
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  {selectedMember.email}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Role</span>
                <span>
                  <Badge
                    variant={
                      selectedMember.role === "member"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {selectedMember.role}
                  </Badge>
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Status</span>
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  {selectedMember.status}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                  Events Attended
                </span>
                <span
                  className="font-mono"
                  style={{ color: "rgba(33,150,243,0.8)" }}
                >
                  {selectedMember.events_attended}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Joined</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {selectedMember.join_date}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                  Last Active
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {selectedMember.last_active}
                </span>
              </div>
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: "12px",
                }}
              >
                <h4
                  className="font-semibold mb-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Attendance History
                </h4>
                {attendance.length === 0 ? (
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    No attendance records.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {attendance.map((a, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs py-1"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>
                          {a.title}
                        </span>
                        <span
                          className="font-mono"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {a.date || "No date"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
