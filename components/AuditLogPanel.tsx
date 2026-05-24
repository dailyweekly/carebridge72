import { History } from "lucide-react";
import type { AuditLogEntry } from "@/lib/types";

type AuditLogPanelProps = {
  logs: AuditLogEntry[];
};

export function AuditLogPanel({ logs }: AuditLogPanelProps) {
  return (
    <section className="mt-6 rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <History size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">처리 이력</h2>
      </div>
      <div className="grid gap-2">
        {logs.map((log) => (
          <div key={log.id} className="grid gap-2 rounded border border-line bg-panel p-3 text-sm md:grid-cols-[120px_120px_160px_minmax(0,1fr)]">
            <span className="font-semibold text-slate-700">{log.at}</span>
            <span>{log.actor}</span>
            <span className="font-bold text-ink">{log.action}</span>
            <span className="text-slate-700">{log.detail}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
