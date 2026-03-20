"use client";

import { PipelineWidget } from "@/components/widgets/pipeline-widget";
import { MembersWidget } from "@/components/widgets/members-widget";
import { EventsWidget } from "@/components/widgets/events-widget";
import { ActionItemsWidget } from "@/components/widgets/action-items-widget";

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 0 30px rgba(33,150,243,0.03), 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(33,150,243,0.25) 50%, transparent 90%)",
        }}
      />
      <div className="p-3 h-full">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="h-full grid grid-cols-[280px_1fr_320px] grid-rows-[auto_1fr] gap-3">
      {/* Top-left: Pipelines — compact */}
      <GlassPanel>
        <PipelineWidget />
      </GlassPanel>

      {/* Top-center + right: Events — spans 2 cols, capped height */}
      <GlassPanel className="col-span-2 max-h-[38vh]">
        <EventsWidget />
      </GlassPanel>

      {/* Bottom-left + center: Members — spans 2 cols */}
      <GlassPanel className="col-span-2">
        <MembersWidget />
      </GlassPanel>

      {/* Bottom-right: Action Items */}
      <GlassPanel>
        <ActionItemsWidget />
      </GlassPanel>
    </div>
  );
}
