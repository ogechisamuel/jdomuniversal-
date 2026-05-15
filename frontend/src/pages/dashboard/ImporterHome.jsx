import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2, Files, FolderOpen, Truck, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  cleared: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function ImporterHome() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    api.get("/applications/mine").then((r) => setApps(r.data || []));
    api.get("/documents/mine").then((r) => setDocs(r.data || []));
  }, []);

  const stats = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    processing: apps.filter((a) => a.status === "processing").length,
    cleared: apps.filter((a) => a.status === "cleared").length,
  };

  const cards = [
    { to: "/dashboard/apply", t: "Apply Agent", d: "Submit a new clearing request", i: FilePlus2 },
    { to: "/dashboard/applications", t: "My Applications", d: "See status of every request", i: Files },
    { to: "/dashboard/documents", t: "Document Vault", d: "Reuse uploaded docs", i: FolderOpen },
    { to: "/dashboard/track", t: "Track Shipment", d: "Get live tracking updates", i: Truck },
  ];

  return (
    <div className="space-y-8" data-testid="importer-home">
      <div>
        <p className="label-eyebrow">Dashboard</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Welcome, {user?.name?.split(" ")[0] || "Importer"}</h1>
        <p className="text-sm text-navy/65 mt-1">Here's a snapshot of your clearing pipeline.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { k: stats.total, v: "Total applications" },
          { k: stats.pending, v: "Pending" },
          { k: stats.processing, v: "Processing" },
          { k: stats.cleared, v: "Cleared" },
        ].map((s, i) => (
          <div key={i} className="card-flat p-5" data-testid={`stat-card-${i}`}>
            <div className="text-3xl font-heading text-navy">{s.k}</div>
            <div className="text-xs text-navy/55 uppercase tracking-widest mt-2">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="card-flat p-5 hover:-translate-y-1 hover:shadow-lg group" data-testid={`quick-${c.t}`}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold group-hover:bg-gold group-hover:text-navy transition-colors">
              <c.i className="h-5 w-5" />
            </span>
            <h3 className="font-heading text-base text-navy mt-4">{c.t}</h3>
            <p className="text-xs text-navy/60 mt-1">{c.d}</p>
            <div className="text-xs text-gold-700 mt-4 inline-flex items-center gap-1">Open <ArrowRight className="h-3 w-3" /></div>
          </Link>
        ))}
      </div>

      <div className="card-flat overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg text-navy">Recent applications</h2>
          <Link to="/dashboard/applications" className="text-sm text-gold-700 hover:underline" data-testid="see-all-apps-link">See all</Link>
        </div>
        <div className="divide-y divide-border">
          {apps.length === 0 && <div className="p-6 text-sm text-navy/55" data-testid="no-apps">No applications yet. Submit your first clearing request.</div>}
          {apps.slice(0, 5).map((a) => (
            <div key={a.application_id} className="p-5 flex flex-wrap items-center gap-4" data-testid={`row-app-${a.application_id}`}>
              <div className="flex-1 min-w-0">
                <div className="font-heading text-navy">{a.cargo_type}</div>
                <div className="text-xs text-navy/55">{a.port} · {a.containers} · {new Date(a.created_at).toLocaleDateString()}</div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-navy/45">{docs.length} document{docs.length === 1 ? "" : "s"} in your vault.</div>
    </div>
  );
}
