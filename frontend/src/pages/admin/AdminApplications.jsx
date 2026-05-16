import { useEffect, useState } from "react";
import { Save, Download, Loader2, Send, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api, { formatApiError } from "@/lib/api";

const STATUS = ["pending", "processing", "cleared"];

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const load = () => api.get("/admin/applications").then((r) => setApps(r.data || []));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6" data-testid="admin-apps-page">
      <div>
        <p className="label-eyebrow">Applications</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Clearing requests ({apps.length})</h1>
      </div>

      <div className="card-flat overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy">
            <tr>
              <th className="text-left p-4">Importer</th>
              <th className="text-left p-4">Cargo</th>
              <th className="text-left p-4">Port</th>
              <th className="text-left p-4">Containers</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Tracking</th>
              <th className="text-left p-4">Docs</th>
              <th className="text-left p-4">Manage</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-navy/55" data-testid="no-apps-admin">No applications yet.</td></tr>}
            {apps.map((a) => (
              <ApplicationRow key={a.application_id} a={a} onSaved={load} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApplicationRow({ a, onSaved }) {
  const [form, setForm] = useState({
    status: a.status, tracking_number: a.tracking_number || "", tracking_status: a.tracking_status || "", admin_notes: a.admin_notes || "",
  });
  const [notifyOnSave, setNotifyOnSave] = useState(true);
  const [notice, setNotice] = useState({ subject: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [open, setOpen] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/applications/${a.application_id}`, { ...form, notify_importer: notifyOnSave });
      if (data?.status_changed && data?.email_sent) {
        toast.success("Application updated · importer notified by email");
      } else if (data?.status_changed && notifyOnSave && !data?.email_sent) {
        toast.warning("Status saved, but email delivery failed (check SendGrid).");
      } else {
        toast.success("Application updated");
      }
      setOpen(false);
      onSaved();
    } catch (e) { toast.error(formatApiError(e)); } finally { setSaving(false); }
  };

  const sendNotice = async () => {
    if (!notice.subject || !notice.message) return toast.error("Subject and message are required.");
    setNotifying(true);
    try {
      await api.post(`/admin/applications/${a.application_id}/notify`, notice);
      toast.success(`Email sent to ${a.user_email}`);
      setNotice({ subject: "", message: "" });
    } catch (e) { toast.error(formatApiError(e)); } finally { setNotifying(false); }
  };

  const download = async (docId) => {
    try {
      const { data } = await api.get(`/documents/${docId}`);
      const blob = await (await fetch(`data:${data.mime_type};base64,${data.data_base64}`)).blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = data.name;
      link.click();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <tr className="border-t border-border align-top" data-testid={`admin-app-${a.application_id}`}>
      <td className="p-4">
        <div className="font-heading text-navy text-sm">{a.user_name}</div>
        <div className="text-xs text-navy/55">{a.user_email}</div>
      </td>
      <td className="p-4 text-navy/85">{a.cargo_type}</td>
      <td className="p-4 text-navy/75">{a.port}</td>
      <td className="p-4 text-navy/75">{a.containers}</td>
      <td className="p-4"><span className="text-xs px-2.5 py-1 rounded-full border capitalize bg-navy-50 text-navy border-border">{a.status}</span></td>
      <td className="p-4 font-mono text-xs">{a.tracking_number || "—"}</td>
      <td className="p-4 text-xs">
        {a.document_ids?.length ? (
          <div className="flex flex-col gap-1">
            {a.document_ids.map((id) => (
              <button key={id} onClick={() => download(id)} className="text-gold-700 hover:underline inline-flex items-center gap-1" data-testid={`admin-doc-${id}`}>
                <Download className="h-3 w-3" /> {id.slice(0, 12)}…
              </button>
            ))}
          </div>
        ) : <span className="text-navy/40">—</span>}
      </td>
      <td className="p-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-navy text-white hover:bg-navy-600" data-testid={`manage-app-${a.application_id}`}>Manage</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-navy">Manage application</DialogTitle>
              <p className="text-xs text-navy/55 -mt-1">{a.user_name} · {a.user_email}</p>
            </DialogHeader>
            <Tabs defaultValue="status" className="mt-2">
              <TabsList className="grid grid-cols-2 w-full" data-testid="manage-tabs">
                <TabsTrigger value="status" data-testid="tab-status">Status &amp; tracking</TabsTrigger>
                <TabsTrigger value="notify" data-testid="tab-notify">Send notification</TabsTrigger>
              </TabsList>
              <TabsContent value="status" className="space-y-4 mt-4">
                <div>
                  <Label className="text-navy">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger data-testid="manage-status" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-navy">Tracking number</Label>
                    <Input data-testid="manage-tracking-number" value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-navy">Tracking status</Label>
                    <Input data-testid="manage-tracking-status" value={form.tracking_status} onChange={(e) => setForm({ ...form, tracking_status: e.target.value })} placeholder="e.g. At Onne port" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label className="text-navy">Admin notes (visible to importer)</Label>
                  <Textarea data-testid="manage-notes" value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })} className="mt-1.5" rows={3} />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-navy-50 px-4 py-3" data-testid="manage-notify-toggle-wrapper">
                  <div>
                    <div className="text-sm font-heading text-navy flex items-center gap-2"><Bell className="h-4 w-4 text-gold" /> Email importer on status change</div>
                    <p className="text-xs text-navy/55">Sends a branded JDOM update if the status changes.</p>
                  </div>
                  <Switch checked={notifyOnSave} onCheckedChange={setNotifyOnSave} data-testid="manage-notify-toggle" />
                </div>
                <Button onClick={save} disabled={saving} className="bg-gold text-navy hover:bg-gold-400 w-full" data-testid="manage-save-btn">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save changes</>}
                </Button>
              </TabsContent>
              <TabsContent value="notify" className="space-y-4 mt-4">
                <p className="text-xs text-navy/65">Send a one-off email to <strong>{a.user_email}</strong>. Useful for clarifications, document requests, or arrival pings.</p>
                <div>
                  <Label className="text-navy">Subject</Label>
                  <Input data-testid="notify-subject" value={notice.subject} onChange={(e) => setNotice({ ...notice, subject: e.target.value })} placeholder="e.g. PAAR document needed" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-navy">Message</Label>
                  <Textarea data-testid="notify-message" rows={6} value={notice.message} onChange={(e) => setNotice({ ...notice, message: e.target.value })} placeholder="Hello, please share your latest PAAR by EOD..." className="mt-1.5" />
                </div>
                <Button onClick={sendNotice} disabled={notifying || !notice.subject || !notice.message} className="bg-navy hover:bg-navy-600 text-white w-full" data-testid="notify-send-btn">
                  {notifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send notification</>}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
