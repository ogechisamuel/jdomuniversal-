import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Mail, MessageCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api, { formatApiError } from "@/lib/api";

const CHANNEL_META = {
  email: { label: "Email only", icon: Mail, color: "text-navy bg-navy-50 border-border" },
  whatsapp: { label: "WhatsApp only", icon: MessageCircle, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  both: { label: "Email + WhatsApp", icon: FileText, color: "text-gold-700 bg-gold/10 border-gold/30" },
};

const VARS_HINT = "Available variables: {{name}}, {{cargo_type}}, {{port}}, {{containers}}, {{tracking_number}}, {{eta}}";

export default function AdminTemplates() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    return api.get("/admin/templates").then((r) => setList(r.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6" data-testid="admin-templates-page">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="label-eyebrow">Notification templates</p>
          <h1 className="font-heading text-3xl text-navy mt-1">Predefined client messages</h1>
          <p className="text-sm text-navy/65 mt-2 max-w-2xl">Templates appear in the <strong>Send notification</strong> tab when managing any application. Variables auto-fill from the application before sending.</p>
        </div>
        <TemplateDialog onSaved={load} trigger={
          <Button className="bg-gold text-navy hover:bg-gold-400" data-testid="template-new-btn"><Plus className="h-4 w-4" /> New template</Button>
        } />
      </div>

      {loading && <div className="card-flat p-8 text-sm text-navy/55">Loading…</div>}

      {!loading && list.length === 0 && (
        <div className="card-flat p-12 text-center" data-testid="templates-empty">
          <FileText className="h-10 w-10 text-gold mx-auto" />
          <h3 className="font-heading text-xl text-navy mt-4">No templates yet</h3>
          <p className="text-sm text-navy/65 mt-1">Create your first reusable client message.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((t) => {
          const meta = CHANNEL_META[t.channel] || CHANNEL_META.both;
          const Icon = meta.icon;
          return (
            <div key={t.template_id} className="card-flat p-5 flex flex-col" data-testid={`template-card-${t.template_id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-heading text-navy">{t.label}</h3>
                  <p className="text-xs text-navy/55 mt-1 truncate">{t.subject}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${meta.color}`}>
                  <Icon className="h-3 w-3" /> {meta.label}
                </span>
              </div>
              <p className="text-sm text-navy/70 mt-3 line-clamp-4 whitespace-pre-line">{t.body}</p>
              <div className="flex items-center gap-2 mt-4">
                <TemplateDialog template={t} onSaved={load} trigger={
                  <Button variant="outline" size="sm" data-testid={`template-edit-${t.template_id}`}><Pencil className="h-3 w-3" /> Edit</Button>
                } />
                <DeleteButton t={t} onDone={load} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeleteButton({ t, onDone }) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    if (!window.confirm(`Delete template "${t.label}"?`)) return;
    setBusy(true);
    try {
      await api.delete(`/admin/templates/${t.template_id}`);
      toast.success("Template deleted");
      onDone();
    } catch (e) { toast.error(formatApiError(e)); } finally { setBusy(false); }
  };
  return (
    <Button variant="outline" size="sm" disabled={busy} onClick={onClick} className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white" data-testid={`template-delete-${t.template_id}`}>
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3" /> Delete</>}
    </Button>
  );
}

function TemplateDialog({ template, onSaved, trigger }) {
  const isEdit = !!template;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: template?.label || "",
    subject: template?.subject || "",
    body: template?.body || "",
    channel: template?.channel || "both",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        label: template?.label || "",
        subject: template?.subject || "",
        body: template?.body || "",
        channel: template?.channel || "both",
      });
    }
  }, [open, template]);

  const save = async () => {
    if (!form.label || !form.subject || !form.body) return toast.error("Label, subject, and body are required.");
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/templates/${template.template_id}`, form);
        toast.success("Template updated");
      } else {
        await api.post("/admin/templates", form);
        toast.success("Template created");
      }
      setOpen(false);
      onSaved();
    } catch (e) { toast.error(formatApiError(e)); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-navy">{isEdit ? "Edit template" : "New template"}</DialogTitle>
          <p className="text-xs text-navy/55 -mt-1">{VARS_HINT}</p>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-navy">Label (admin-only)</Label>
              <Input data-testid="tpl-form-label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Request PAAR" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-navy">Channel</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger data-testid="tpl-form-channel" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Email + WhatsApp</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-navy">Subject / WhatsApp headline</Label>
            <Input data-testid="tpl-form-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. PAAR document needed for {{cargo_type}}" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-navy">Message body</Label>
            <Textarea data-testid="tpl-form-body" rows={9} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="mt-1.5 font-mono text-[13px] leading-relaxed" />
          </div>
          <Button onClick={save} disabled={saving} className="w-full bg-gold text-navy hover:bg-gold-400 font-semibold" data-testid="tpl-form-save">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save changes" : "Create template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
