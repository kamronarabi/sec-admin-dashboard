"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type SortKey = "name" | "email" | "events_attended" | "role" | "status";

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);

    const res = await fetch(`/api/members?${params}`);
    if (res.ok) {
      setMembers(await res.json());
    }
    setLoading(false);
  }, [search, roleFilter, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const startEdit = (id: number, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    await fetch("/api/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingCell.id, [editingCell.field]: editValue }),
    });
    setEditingCell(null);
    fetchMembers();
  };

  const deleteMember = async (id: number) => {
    if (!confirm("Delete this member?")) return;
    await fetch(`/api/members?id=${id}`, { method: "DELETE" });
    fetchMembers();
  };

  const viewMember = async (member: Member) => {
    setSelectedMember(member);
    const res = await fetch(`/api/members/${member.id}/attendance`);
    if (res.ok) setAttendance(await res.json());
  };

  const sortIndicator = (key: SortKey) => {
    if (sortBy !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  const SortableHead = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => handleSort(sortKey)}
    >
      {label}{sortIndicator(sortKey)}
    </TableHead>
  );

  if (loading) return <p className="text-muted-foreground">Loading members...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All Roles</option>
          <option value="member">Member</option>
          <option value="officer">Officer</option>
          <option value="lead">Lead</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Name" sortKey="name" />
              <SortableHead label="Email" sortKey="email" />
              <SortableHead label="Events" sortKey="events_attended" />
              <SortableHead label="Role" sortKey="role" />
              <SortableHead label="Status" sortKey="status" />
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No members found. Data will appear after the first pipeline sync.
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => viewMember(m)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {editingCell?.id === m.id && editingCell.field === "name" ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        autoFocus
                        className="h-7 text-sm"
                      />
                    ) : (
                      <span onDoubleClick={() => startEdit(m.id, "name", m.name)}>
                        {m.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{m.email}</TableCell>
                  <TableCell>{m.events_attended}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {editingCell?.id === m.id && editingCell.field === "role" ? (
                      <select
                        value={editValue}
                        onChange={(e) => { setEditValue(e.target.value); }}
                        onBlur={saveEdit}
                        autoFocus
                        className="border rounded px-2 py-1 text-sm bg-background"
                      >
                        <option value="member">Member</option>
                        <option value="officer">Officer</option>
                        <option value="lead">Lead</option>
                      </select>
                    ) : (
                      <Badge
                        variant={m.role === "member" ? "secondary" : "default"}
                        className="cursor-pointer"
                        onDoubleClick={() => startEdit(m.id, "role", m.role)}
                      >
                        {m.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={m.status === "active" ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(m.id, "status", m.status);
                      }}
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-sm">
                        ...
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {members.length} member{members.length !== 1 ? "s" : ""} — double-click name or role to edit inline
      </p>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMember?.name}</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Email</span>
                <span>{selectedMember.email}</span>
                <span className="text-muted-foreground">Role</span>
                <span>{selectedMember.role}</span>
                <span className="text-muted-foreground">Status</span>
                <span>{selectedMember.status}</span>
                <span className="text-muted-foreground">Events Attended</span>
                <span>{selectedMember.events_attended}</span>
                <span className="text-muted-foreground">Joined</span>
                <span>{selectedMember.join_date}</span>
                <span className="text-muted-foreground">Last Active</span>
                <span>{selectedMember.last_active}</span>
                {selectedMember.discord_username && (
                  <>
                    <span className="text-muted-foreground">Discord</span>
                    <span>{selectedMember.discord_username}</span>
                  </>
                )}
                {selectedMember.github_username && (
                  <>
                    <span className="text-muted-foreground">GitHub</span>
                    <span>{selectedMember.github_username}</span>
                  </>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Attendance History</h4>
                {attendance.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No attendance records.</p>
                ) : (
                  <div className="space-y-1">
                    {attendance.map((a, i) => (
                      <div key={i} className="flex justify-between text-sm border-b py-1">
                        <span>{a.title}</span>
                        <span className="text-muted-foreground">{a.date || "No date"}</span>
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
