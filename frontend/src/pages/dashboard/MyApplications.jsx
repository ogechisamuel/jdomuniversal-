import { useEffect, useState } from "react";
import { Files } from "lucide-react";
import api from "@/lib/api";

const STATUS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  cleared: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);

  useEffect(() => { api.get("/applications/mine").then((r) => setApps(r.data || [])); }, []);

  return (
    <div className="space-y-6" data-testid="my-applications-page">
      <div>
        <p className="label-eyebrow">My Applications</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Clearing pipeline</h1>
      </div>

      <div className="card-flat overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy">
            <tr>
              <th className="text-left p-4">Cargo</th>
              <th className="text-left p-4">Port</th>
              <th className="text-left p-4">Containers</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Tracking</th>
              <th className="text-left p-4">Admin notes</th>
              <th className="text-left p-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-navy/55" data-testid="empty-applications"><Files className="inline h-5 w-5 mr-2 text-gold" />No applications yet.</td></tr>
            )}
            {apps.map((a) => (
              <tr key={a.application_id} className="border-t border-border" data-testid={`my-app-${a.application_id}`}>
                <td className="p-4 font-heading text-navy">{a.cargo_type}</td>
                <td className="p-4 text-navy/75">{a.port}</td>
                <td className="p-4 text-navy/75">{a.containers}</td>
                <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${STATUS[a.status]}`}>{a.status}</span></td>
                <td className="p-4 font-mono text-xs text-navy/75">{a.tracking_number || "—"}</td>
                <td className="p-4 text-navy/75 max-w-xs"><div className="truncate">{a.admin_notes || "—"}</div></td>
                <td className="p-4 text-navy/55 text-xs">{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
