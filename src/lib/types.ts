export interface Member {
  id: number;
  email: string;
  name: string;
  discord_id: string | null;
  discord_username: string | null;
  github_username: string | null;
  role: string;
  events_attended: number;
  join_date: string;
  last_active: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  date: string | null;
  type: string;
  location: string | null;
  attendance_count: number;
  source_sheet: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: number;
  source: string;
  status: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  duration_ms: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface ActionItem {
  id: number;
  title: string;
  description: string | null;
  source: string;
  status: string;
  priority: "high" | "medium" | "low";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  title: string;
  date: string | null;
  type: string;
  checked_in_at: string;
}
