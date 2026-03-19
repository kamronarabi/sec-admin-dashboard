import { ActionItemsList } from "@/components/action-items-list";

export default function ActionsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Action Items</h2>
      <ActionItemsList />
    </div>
  );
}
