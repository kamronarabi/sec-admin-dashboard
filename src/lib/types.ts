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
  heard_about: string | null;
  major: string | null;
  year: string | null;
  interests: string | null;
  mailing_list: number;
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

export interface Email {
  id: number;
  gmail_id: string;
  thread_id: string | null;
  from_address: string;
  to_address: string | null;
  subject: string | null;
  snippet: string | null;
  body_html: string | null;
  received_at: string;
  is_read: number;
  labels: string | null;
  synced_at: string;
}

export interface SentEmail {
  id: number;
  to_addresses: string;
  subject: string;
  body_html: string;
  gmail_message_id: string | null;
  sent_by: string;
  recipient_count: number;
  sent_at: string;
}

export interface EventNote {
  id: number;
  event_id: number;
  went_well: string | null;
  went_wrong: string | null;
  admin_email: string;
  created_at: string;
  updated_at: string;
}
