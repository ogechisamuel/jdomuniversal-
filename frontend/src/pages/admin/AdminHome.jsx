import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, MessagesSquare, ClipboardList, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

export default function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);

  if (!stats) return <div className="text-sm text-navy/55">Loading stats…</div>;

  const cards = [
    { k: stats.leads_total, v: "Total leads", to: "/admin/leads", i: MessagesSquare, accent: "bg-gold/20" },
    { k: stats.leads_new, v: "New leads", to: "/admin/leads", i: MessagesSquare, accent: "bg-amber-100" },
    { k: stats.applications_total, v: "Applications", to: "/admin/applications", i: ClipboardList, accent: "bg-navy/10" },
    { k: stats.applications_pending, v: "Pending", to: "/admin/applications", i: ClipboardList, accent: "bg-amber-100" },
    { k: stats.applications_processing, v: "Processing", to: "/admin/applications", i: ClipboardList, accent: "bg-blue-100" },
    { k: stats.applications_cleared, v: "Cleared", to: "/admin/applications", i: ClipboardList, accent: "bg-emerald-100" },
    { k: stats.importers_total, v: "Importers", to: "/admin/importers", i: Users, accent: "bg-gold/20" },
  ];

  return (
    <div className="space-y-8" data-testid="admin-home">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Admin Console</p>
          <h1 className="font-heading text-3xl text-navy mt-1">Operations overview</h1>
        </div>
        <ShieldCheck className="h-8 w-8 text-gold hidden sm:block" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Link to={c.to} key={i} className="card-flat p-5 hover:-translate-y-1 hover:shadow-lg group" data-testid={`admin-stat-${c.v}`}>
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${c.accent}`}>
              <c.i className="h-5 w-5 text-navy" />
            </div>
            <div className="mt-4 text-3xl font-heading text-navy">{c.k}</div>
            <div className="text-xs text-navy/55 uppercase tracking-widest mt-1">{c.v}</div>
            <div className="text-xs text-gold-700 mt-4 inline-flex items-center gap-1">Open <ArrowRight className="h-3 w-3" /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
