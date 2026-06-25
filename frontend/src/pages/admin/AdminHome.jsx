import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, MessagesSquare, ClipboardList, ShieldCheck, Mail, MessageCircle, MessageSquareText, TrendingUp, Clock, Send, Loader2 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, Cell } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api, { formatApiError } from "@/lib/api";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [notif, setNotif] = useState(null);
  const [digest, setDigest] = useState(null);
  const [savingDigest, setSavingDigest] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/admin/notification-analytics").then((r) => setNotif(r.data));
    api.get("/admin/digest/settings").then((r) => setDigest(r.data));
  }, []);

  const saveDigest = async (next) => {
    setSavingDigest(true);
    try {
      const { data } = await api.put("/admin/digest/settings", next);
      setDigest(data);
      toast.success(next.enabled ? `Daily digest enabled · fires at ${next.hour}:00 UTC` : "Daily digest disabled");
    } catch (e) { toast.error(formatApiError(e)); } finally { setSavingDigest(false); }
  };

  const sendDigestNow = async () => {
    setSendingDigest(true);
    try {
      const { data } = await api.post("/admin/digest/send");
      const { data: refreshed } = await api.get("/admin/digest/settings");
      setDigest(refreshed);
      toast.success(`Digest sent · ${data.matched} shipment${data.matched === 1 ? "" : "s"} included`);
    } catch (e) { toast.error(formatApiError(e)); } finally { setSendingDigest(false); }
  };

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

  const deliveredPct = notif && notif.total > 0 ? Math.round((notif.delivered / notif.total) * 100) : 0;
  const totalChannel = notif ? notif.by_email + notif.by_whatsapp : 0;
  const emailPct = totalChannel ? Math.round((notif.by_email / totalChannel) * 100) : 0;
  const waPct = totalChannel ? 100 - emailPct : 0;

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

      {digest && (
        <div className="card-flat p-5 grid lg:grid-cols-12 gap-6 items-start" data-testid="digest-card">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold-700">
              <Clock className="h-3.5 w-3.5" /> Daily digest
            </div>
            <h2 className="font-heading text-xl text-navy mt-2">Wake up to your demurrage risk</h2>
            <p className="text-sm text-navy/65 mt-2 leading-relaxed">
              Every morning at your chosen hour, we run your <Link to="/admin/applications" className="text-gold-700 underline">default filter preset</Link> and email a summary of shipments needing eyes — straight to your admin inbox.
            </p>
            {digest.last_run_at && (
              <p className="text-xs text-navy/55 mt-3" data-testid="digest-last-run">
                Last sent: <strong>{new Date(digest.last_run_at).toLocaleString()}</strong> · {digest.last_run_count ?? 0} shipment{digest.last_run_count === 1 ? "" : "s"} included{digest.last_run_manual ? " · manual" : " · automatic"}
              </p>
            )}
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between rounded-md border border-border bg-navy-50 px-4 py-3">
              <div>
                <div className="text-sm font-heading text-navy">Enable daily digest</div>
                <p className="text-xs text-navy/55">Auto-emails the admin once per day, only when there is something in the default filter.</p>
              </div>
              <Switch
                checked={!!digest.enabled}
                disabled={savingDigest}
                onCheckedChange={(v) => saveDigest({ enabled: v, hour: digest.hour ?? 8 })}
                data-testid="digest-enabled-toggle"
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs uppercase tracking-widest text-navy/55">Send hour (UTC)</label>
                <Select
                  value={String(digest.hour ?? 8)}
                  onValueChange={(v) => saveDigest({ enabled: !!digest.enabled, hour: parseInt(v, 10) })}
                >
                  <SelectTrigger data-testid="digest-hour-select" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <SelectItem key={h} value={String(h)}>{String(h).padStart(2, "0")}:00 UTC</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={sendDigestNow} disabled={sendingDigest} className="bg-gold text-navy hover:bg-gold-400 font-semibold" data-testid="digest-send-now-btn">
                {sendingDigest ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send test now</>}
              </Button>
            </div>
            {digest.enabled && (
              <p className="text-xs text-gold-700 inline-flex items-center gap-1" data-testid="digest-status-on">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · next dispatch at {String(digest.hour ?? 8).padStart(2, "0")}:00 UTC
              </p>
            )}
          </div>
        </div>
      )}

      {notif && (
        <div className="grid lg:grid-cols-3 gap-4" data-testid="notification-analytics">
          {/* Volume + 14-day chart */}
          <div className="card-flat p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="label-eyebrow">Client notifications</p>
                <h2 className="font-heading text-xl text-navy mt-1">Last 14 days</h2>
              </div>
              <Link to="/admin/templates" className="text-xs text-gold-700 hover:underline inline-flex items-center gap-1" data-testid="manage-templates-link">
                <MessageSquareText className="h-3.5 w-3.5" /> Manage templates
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Metric k={notif.last_30d} v="Sent · 30d" />
              <Metric k={notif.total} v="All time" />
              <Metric k={`${deliveredPct}%`} v="Delivered" />
            </div>
            <div className="h-32 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={notif.daily} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748B" }} interval={1} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(11,31,58,0.05)" }}
                    contentStyle={{ background: "#0B1F3A", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
                    labelStyle={{ color: "#D4AF37" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {notif.daily.map((d, i) => (
                      <Cell key={i} fill={d.count > 0 ? "#D4AF37" : "#E2E8F0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {totalChannel > 0 && (
              <div className="mt-3 space-y-2" data-testid="channel-breakdown">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-navy"><Mail className="h-3 w-3" /> Email · {notif.by_email}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700"><MessageCircle className="h-3 w-3" /> WhatsApp · {notif.by_whatsapp}</span>
                </div>
                <div className="h-2 rounded-full bg-emerald-100 overflow-hidden flex">
                  <div className="bg-navy" style={{ width: `${emailPct}%` }} title={`Email ${emailPct}%`} />
                  <div className="bg-[#25D366]" style={{ width: `${waPct}%` }} title={`WhatsApp ${waPct}%`} />
                </div>
              </div>
            )}
          </div>

          {/* Top templates */}
          <div className="card-flat p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="label-eyebrow">Top templates</p>
                <h2 className="font-heading text-xl text-navy mt-1">Most sent</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-gold" />
            </div>
            {(!notif.top_templates || notif.top_templates.length === 0) && (
              <div className="text-sm text-navy/55 text-center py-8" data-testid="no-template-usage">
                No template-based notifications yet. Send your first one from any application.
              </div>
            )}
            <ol className="space-y-2.5">
              {(notif.top_templates || []).map((t, i) => (
                <li key={t.template_id} className="flex items-center gap-3" data-testid={`top-tpl-${i}`}>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-navy-50 text-navy font-heading text-xs">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-heading truncate ${t.exists ? "text-navy" : "text-navy/40 line-through"}`}>{t.label}</div>
                    <div className="text-[10px] uppercase tracking-widest text-navy/45 mt-0.5">{t.channel} · last used {new Date(t.last_used).toLocaleDateString()}</div>
                  </div>
                  <span className="text-sm font-heading text-gold-700 tabular-nums">{t.count}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ k, v }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <div className="text-2xl font-heading text-navy">{k}</div>
      <div className="text-[10px] uppercase tracking-widest text-navy/50">{v}</div>
    </div>
  );
}
