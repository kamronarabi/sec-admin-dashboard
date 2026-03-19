import { EventsList } from "@/components/events-list";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Events</h2>
      <EventsList />
    </div>
  );
}
