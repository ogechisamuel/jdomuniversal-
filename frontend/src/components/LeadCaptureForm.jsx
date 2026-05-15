import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api, { formatApiError } from "@/lib/api";

const cargoTypes = ["Oil & Gas Tools", "Garments & Textiles", "PPE", "Industrial Machinery", "Others"];
const ports = ["Apapa", "Tin Can", "Onne"];

export default function LeadCaptureForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    cargo_type: "", port: "", containers: "", eta: "",
    name: "", email: "", phone: "", company: "", message: "",
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === "string" ? v : v.target.value }));

  const canNext1 = form.cargo_type && form.port;
  const canSubmit = form.name && form.email && form.phone;

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/leads", { ...form, source: "homepage_multistep" });
      setDone(true);
      toast.success("Request received. Our specialist will call you within 30 minutes.");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-white border border-gold/30 p-8 text-center shadow-xl" data-testid="lead-success">
        <div className="mx-auto h-14 w-14 rounded-full bg-gold/20 flex items-center justify-center mb-4">
          <Check className="h-7 w-7 text-gold-700" />
        </div>
        <h3 className="font-heading text-2xl text-navy mb-2">Quote request received</h3>
        <p className="text-navy/70 text-sm">A JDOM specialist will reach out within <strong>30 minutes</strong> with a clearing timeline and quote.</p>
      </div>
    );
  }

  return (
    <div id="lead-form" className="rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-2xl shadow-navy/10" data-testid="lead-capture-form">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="label-eyebrow">Request a Quote</p>
          <h3 className="font-heading text-2xl text-navy mt-1">Tell us about your cargo</h3>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2].map((s) => (
            <span key={s} data-testid={`lead-step-indicator-${s}`}
                  className={`h-1.5 w-6 rounded-full ${step >= s ? "bg-gold" : "bg-navy/10"}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="grid gap-4">
          <div>
            <Label className="text-navy">Cargo type</Label>
            <Select value={form.cargo_type} onValueChange={set("cargo_type")}>
              <SelectTrigger data-testid="lead-cargo-type" className="mt-1.5"><SelectValue placeholder="Select cargo type" /></SelectTrigger>
              <SelectContent>
                {cargoTypes.map((c) => <SelectItem key={c} value={c} data-testid={`lead-cargo-${c}`}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-navy">Port of discharge</Label>
              <Select value={form.port} onValueChange={set("port")}>
                <SelectTrigger data-testid="lead-port" className="mt-1.5"><SelectValue placeholder="Select port" /></SelectTrigger>
                <SelectContent>
                  {ports.map((p) => <SelectItem key={p} value={p} data-testid={`lead-port-${p}`}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-navy">Containers / Weight</Label>
              <Input data-testid="lead-containers" placeholder="e.g. 4 x 40ft" value={form.containers} onChange={set("containers")} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label className="text-navy">Estimated arrival</Label>
            <Input data-testid="lead-eta" type="date" value={form.eta} onChange={set("eta")} className="mt-1.5" />
          </div>
          <Button data-testid="lead-next-btn" disabled={!canNext1} onClick={() => setStep(2)} className="bg-navy text-white hover:bg-navy-600 mt-2">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-navy">Full name</Label>
              <Input data-testid="lead-name" value={form.name} onChange={set("name")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-navy">Company</Label>
              <Input data-testid="lead-company" value={form.company} onChange={set("company")} className="mt-1.5" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-navy">Email</Label>
              <Input data-testid="lead-email" type="email" value={form.email} onChange={set("email")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-navy">Phone / WhatsApp</Label>
              <Input data-testid="lead-phone" value={form.phone} onChange={set("phone")} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label className="text-navy">Additional notes</Label>
            <Textarea data-testid="lead-message" rows={3} value={form.message} onChange={set("message")} className="mt-1.5" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="lead-back-btn" onClick={() => setStep(1)}>Back</Button>
            <Button
              data-testid="lead-submit-btn"
              disabled={!canSubmit || loading}
              onClick={submit}
              className="flex-1 bg-gold text-navy hover:bg-gold-400 font-semibold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Request Immediate Quote <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
