import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus2, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import api, { formatApiError } from "@/lib/api";

const CARGO = ["Oil & Gas Tools", "Garments & Textiles", "PPE", "Industrial Machinery", "Others"];
const PORTS = ["Apapa", "Tin Can", "Onne"];
const DOC_TYPES = ["PAAR", "BOL", "FORM_M", "PROFORMA", "OTHER"];
const DOC_LABELS = { PAAR: "PAAR", BOL: "Bill of Lading", FORM_M: "Form M", PROFORMA: "Proforma Invoice", OTHER: "Other Document" };

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      const base64 = String(result).split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ApplyAgent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ cargo_type: "", port: "", containers: "", weight: "", eta: "", notes: "" });
  const [newDocs, setNewDocs] = useState({ PAAR: null, BOL: null, FORM_M: null, PROFORMA: null, OTHER: null });
  const [vault, setVault] = useState([]);
  const [selectedVault, setSelectedVault] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get("/documents/mine").then((r) => setVault(r.data || [])); }, []);

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === "string" ? v : v.target.value }));

  const handleFile = (type) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error("File too large. Max 8MB.");
    setNewDocs((d) => ({ ...d, [type]: file }));
  };

  const submit = async () => {
    if (!form.cargo_type || !form.port || !form.containers) return toast.error("Cargo, port and containers are required.");
    setLoading(true);
    try {
      const new_documents = [];
      for (const type of DOC_TYPES) {
        const f = newDocs[type];
        if (!f) continue;
        const data_base64 = await fileToBase64(f);
        new_documents.push({ name: f.name, type, mime_type: f.type || "application/octet-stream", data_base64 });
      }
      const document_ids = Object.entries(selectedVault).filter(([, v]) => v).map(([k]) => k);
      await api.post("/applications", { ...form, document_ids, new_documents });
      toast.success("Application submitted. Our broker desk has been notified.");
      navigate("/dashboard/applications");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl" data-testid="apply-agent-page">
      <div>
        <p className="label-eyebrow">Apply Agent</p>
        <h1 className="font-heading text-3xl text-navy mt-1">New clearing application</h1>
        <p className="text-sm text-navy/65 mt-1">Fill cargo details and attach the relevant documents.</p>
      </div>

      <div className="card-flat p-6">
        <h2 className="font-heading text-lg text-navy mb-4">Cargo details</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label className="text-navy">Cargo type</Label>
            <Select value={form.cargo_type} onValueChange={setField("cargo_type")}>
              <SelectTrigger data-testid="apply-cargo" className="mt-1.5"><SelectValue placeholder="Select cargo" /></SelectTrigger>
              <SelectContent>{CARGO.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-navy">Port of discharge</Label>
            <Select value={form.port} onValueChange={setField("port")}>
              <SelectTrigger data-testid="apply-port" className="mt-1.5"><SelectValue placeholder="Select port" /></SelectTrigger>
              <SelectContent>{PORTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-navy">Number of containers</Label>
            <Input data-testid="apply-containers" value={form.containers} onChange={setField("containers")} placeholder="e.g. 4 x 40ft" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-navy">Weight (optional)</Label>
            <Input data-testid="apply-weight" value={form.weight} onChange={setField("weight")} placeholder="e.g. 28 MT" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-navy">Estimated arrival</Label>
            <Input data-testid="apply-eta" type="date" value={form.eta} onChange={setField("eta")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-navy">Notes</Label>
            <Textarea data-testid="apply-notes" rows={3} value={form.notes} onChange={setField("notes")} className="mt-1.5" />
          </div>
        </div>
      </div>

      <div className="card-flat p-6">
        <h2 className="font-heading text-lg text-navy mb-4">Upload documents</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {DOC_TYPES.map((t) => (
            <div key={t} className="border border-dashed border-border rounded-md p-4 hover:border-gold transition-colors" data-testid={`upload-${t}`}>
              <Label className="text-navy">{DOC_LABELS[t]}</Label>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 h-10 rounded-md bg-navy-50 text-navy text-sm font-medium hover:bg-navy hover:text-white transition-colors">
                  <Upload className="h-4 w-4" /> {newDocs[t] ? newDocs[t].name : "Choose file"}
                  <input data-testid={`file-${t}`} type="file" className="hidden" onChange={handleFile(t)} />
                </label>
                {newDocs[t] && (
                  <button onClick={() => setNewDocs((d) => ({ ...d, [t]: null }))} className="text-destructive" data-testid={`remove-${t}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {vault.length > 0 && (
        <div className="card-flat p-6">
          <h2 className="font-heading text-lg text-navy mb-2">Reuse from Document Vault</h2>
          <p className="text-xs text-navy/55 mb-4">Select previously uploaded documents to attach to this application.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {vault.map((d) => (
              <label key={d.document_id} className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-gold" data-testid={`vault-${d.document_id}`}>
                <Checkbox checked={!!selectedVault[d.document_id]} onCheckedChange={(c) => setSelectedVault((s) => ({ ...s, [d.document_id]: !!c }))} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-navy truncate">{d.name}</div>
                  <div className="text-xs text-navy/55">{DOC_LABELS[d.type] || d.type}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={submit} disabled={loading} className="bg-gold text-navy hover:bg-gold-400 h-12 px-8 font-semibold" data-testid="apply-submit-btn">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FilePlus2 className="h-4 w-4" /> Submit request</>}
        </Button>
      </div>
    </div>
  );
}
