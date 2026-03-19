import { MembersTable } from "@/components/members-table";

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Members</h2>
      <MembersTable />
    </div>
  );
}
