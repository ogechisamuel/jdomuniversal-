import { useEffect, useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api, { formatApiError } from "@/lib/api";

export default function AdminTestimonials() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", company: "", quote: "", rating: 5 });
  const load = () => api.get("/testimonials").then((r) => setList(r.data || []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await api.post("/admin/testimonials", form);
      toast.success("Testimonial added.");
      setForm({ name: "", role: "", company: "", quote: "", rating: 5 });
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const del = async (id) => {
    try { await api.delete(`/admin/testimonials/${id}`); toast.success("Deleted."); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6" data-testid="admin-testimonials-page">
      <div>
        <p className="label-eyebrow">Testimonial manager</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Featured testimonials</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 card-flat p-6 h-fit">
          <h2 className="font-heading text-lg text-navy mb-4">Add testimonial</h2>
          <div className="space-y-3">
            <div><Label className="text-navy">Name</Label><Input data-testid="testimonial-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-navy">Role</Label><Input data-testid="testimonial-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-navy">Company</Label><Input data-testid="testimonial-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div><Label className="text-navy">Quote</Label><Textarea data-testid="testimonial-quote" rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="mt-1.5" /></div>
            <div><Label className="text-navy">Rating (1-5)</Label><Input data-testid="testimonial-rating" type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value || "5") })} className="mt-1.5" /></div>
            <Button onClick={add} disabled={!form.name || !form.quote} className="w-full bg-gold text-navy hover:bg-gold-400" data-testid="testimonial-add-btn"><Plus className="h-4 w-4" /> Add testimonial</Button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {list.length === 0 && <div className="card-flat p-6 text-sm text-navy/55">No testimonials yet.</div>}
          {list.map((t) => (
            <div key={t.testimonial_id} className="card-flat p-5" data-testid={`testimonial-card-${t.testimonial_id}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-navy/85 italic">"{t.quote}"</p>
                  <div className="mt-3 text-sm">
                    <div className="font-heading text-navy">{t.name}</div>
                    <div className="text-xs text-navy/55">{t.role}{t.company ? ` · ${t.company}` : ""}</div>
                  </div>
                  <div className="flex gap-0.5 text-gold mt-2">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold" />)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => del(t.testimonial_id)} className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white" data-testid={`testimonial-delete-${t.testimonial_id}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
