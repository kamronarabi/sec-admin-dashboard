import { PipelineMonitor } from "@/components/pipeline-monitor";

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pipeline Health</h2>
      <PipelineMonitor />
    </div>
  );
}
