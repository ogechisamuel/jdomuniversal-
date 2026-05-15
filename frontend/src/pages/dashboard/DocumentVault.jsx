import { useEffect, useState } from "react";
import { Upload, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api, { formatApiError } from "@/lib/api";

const TYPES = ["PAAR", "BOL", "FORM_M", "PROFORMA", "OTHER"];
const LABELS = { PAAR: "PAAR", BOL: "Bill of Lading", FORM_M: "Form M", PROFORMA: "Proforma Invoice", OTHER: "Other" };

function fmtBytes(n) {
  if (!n) return "—";
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / (1024 * 1024)).toFixed(1)}MB`;
}

export default function DocumentVault() {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("PAAR");
  const [uploading, setUploading] = useState(false);

  const load = () => api.get("/documents/mine").then((r) => setDocs(r.data || []));
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(",")[1] || "");
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      await api.post("/documents", { name: file.name, type, mime_type: file.type || "application/octet-stream", data_base64: base64 });
      toast.success("Document uploaded.");
      setFile(null);
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setUploading(false);
    }
  };

  const download = async (d) => {
    try {
      const { data } = await api.get(`/documents/${d.document_id}`);
      const blob = await (await fetch(`data:${data.mime_type};base64,${data.data_base64}`)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = data.name;
      a.click();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div className="space-y-6" data-testid="vault-page">
      <div>
        <p className="label-eyebrow">Document Vault</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Reusable document storage</h1>
      </div>

      <div className="card-flat p-6">
        <h2 className="font-heading text-lg text-navy mb-4">Upload a document</h2>
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <Label className="text-navy">Document type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="vault-type" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{LABELS[t]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-navy">File (max 8MB)</Label>
            <Input data-testid="vault-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1.5" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={upload} disabled={!file || uploading} className="bg-gold text-navy hover:bg-gold-400" data-testid="vault-upload-btn">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Upload</>}
          </Button>
        </div>
      </div>

      <div className="card-flat overflow-hidden">
        <div className="p-5 border-b border-border font-heading text-lg text-navy">Your documents ({docs.length})</div>
        <div className="divide-y divide-border">
          {docs.length === 0 && <div className="p-6 text-sm text-navy/55" data-testid="vault-empty">No documents uploaded yet.</div>}
          {docs.map((d) => (
            <div key={d.document_id} className="p-4 flex items-center gap-4" data-testid={`vault-row-${d.document_id}`}>
              <FileText className="h-5 w-5 text-gold" />
              <div className="flex-1 min-w-0">
                <div className="font-heading text-navy truncate">{d.name}</div>
                <div className="text-xs text-navy/55">{LABELS[d.type] || d.type} · {fmtBytes(d.size_bytes)} · {new Date(d.created_at).toLocaleDateString()}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => download(d)} data-testid={`download-${d.document_id}`}><Download className="h-4 w-4" /> Download</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
