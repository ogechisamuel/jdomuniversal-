import { useState } from "react";
import { FileText, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { formatApiError } from "@/lib/api";

const RESOURCES = [
  {
    title: "PAAR & Form M Checklist",
    desc: "Avoid the 7 most common rejections at NCS pre-clearance.",
    tag: "PDF",
    url: "https://files.jdomuniversal.online/JDOM-PAAR-checklist.pdf",
  },
  {
    title: "Oil & Gas Cargo Documentation Guide",
    desc: "Step-by-step Onne free-zone documentation walk-through.",
    tag: "PDF",
    url: "https://files.jdomuniversal.online/JDOM-Oil-Gas-Guide.pdf",
  },
  {
    title: "SONCAP Compliance Cheat Sheet",
    desc: "Product categories, certificates, common pitfalls.",
    tag: "PDF",
    url: "https://files.jdomuniversal.online/JDOM-SONCAP-Compliance-Cheat-Sheet.pdf",
  },
];

export default function Resources() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", cargo_type: "Resource Center" });
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/leads", { ...form, source: "resource_center", message: "Requested resource downloads." });
      setGranted(true);
      toast.success("Access granted. Tap any download button below.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (r) => {
    toast.success(`Opening ${r.title}…`);
    window.open(r.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="container-x py-20">
          <p className="label-eyebrow text-gold" data-testid="resources-eyebrow">Resource Center</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mt-3 max-w-2xl">Free guides for serious importers.</h1>
          <p className="mt-4 text-white/75 max-w-2xl">Battle-tested checklists, port walkthroughs, and compliance cheat sheets — written by JDOM's senior brokers.</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-x py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            {RESOURCES.map((r) => (
              <div key={r.title} className="card-flat p-6 flex items-center gap-5" data-testid={`resource-${r.title}`}>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-navy text-gold">
                  <FileText className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg text-navy">{r.title}</h3>
                  <p className="text-sm text-navy/65 mt-1">{r.desc}</p>
                  <span className="inline-block mt-2 text-xs text-gold-700 uppercase tracking-widest">{r.tag}</span>
                </div>
                <Button
                  disabled={!granted}
                  onClick={() => handleDownload(r)}
                  className="bg-gold text-navy hover:bg-gold-400 disabled:opacity-50"
                  data-testid={`resource-download-${r.title}`}
                >
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5">
            <div className="card-flat p-7 sticky top-24" data-testid="resource-gate-form">
              <p className="label-eyebrow">Unlock downloads</p>
              <h3 className="font-heading text-2xl text-navy mt-1">Email me the toolkit</h3>
              <p className="text-sm text-navy/65 mt-2">One-time form. Instant access to every JDOM guide.</p>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <Label className="text-navy">Name</Label>
                  <Input data-testid="resource-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-navy">Email</Label>
                  <Input data-testid="resource-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-navy">Phone</Label>
                  <Input data-testid="resource-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="mt-1.5" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-600 text-white" data-testid="resource-submit-btn">
                  <Mail className="h-4 w-4" /> {loading ? "Sending…" : granted ? "Access granted ✓" : "Grant me access"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
