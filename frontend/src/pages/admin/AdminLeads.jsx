import { useEffect, useState } from "react";
import { Check, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import api, { formatApiError } from "@/lib/api";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const load = () => api.get("/admin/leads").then((r) => setLeads(r.data || []));
  useEffect(() => { load(); }, []);

  const markContacted = async (id) => {
    try {
      await api.patch(`/admin/leads/${id}`, { status: "contacted" });
      toast.success("Lead marked as contacted.");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6" data-testid="admin-leads-page">
      <div>
        <p className="label-eyebrow">Lead management</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Incoming leads ({leads.length})</h1>
      </div>

      <div className="card-flat overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Contact</th>
              <th className="text-left p-4">Cargo</th>
              <th className="text-left p-4">Port</th>
              <th className="text-left p-4">Containers</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Submitted</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-navy/55" data-testid="no-leads">No leads yet.</td></tr>}
            {leads.map((l) => (
              <tr key={l.lead_id} className="border-t border-border align-top" data-testid={`lead-row-${l.lead_id}`}>
                <td className="p-4">
                  <div className="font-heading text-navy">{l.name}</div>
                  <div className="text-xs text-navy/55">{l.company || "—"}</div>
                </td>
                <td className="p-4 text-xs">
                  <div className="flex items-center gap-1 text-navy/75"><Mail className="h-3 w-3 text-gold" /> {l.email}</div>
                  <div className="flex items-center gap-1 text-navy/75 mt-1"><Phone className="h-3 w-3 text-gold" /> {l.phone}</div>
                </td>
                <td className="p-4 text-navy/85">{l.cargo_type}</td>
                <td className="p-4 text-navy/75">{l.port || "—"}</td>
                <td className="p-4 text-navy/75">{l.containers || "—"}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${l.status === "new" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>{l.status}</span>
                </td>
                <td className="p-4 text-xs text-navy/55">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-4">
                  {l.status === "new" ? (
                    <Button size="sm" onClick={() => markContacted(l.lead_id)} className="bg-gold text-navy hover:bg-gold-400" data-testid={`mark-contacted-${l.lead_id}`}>
                      <Check className="h-3 w-3" /> Mark contacted
                    </Button>
                  ) : <span className="text-xs text-navy/40">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
