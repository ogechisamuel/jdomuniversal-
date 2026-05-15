import { useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api, { formatApiError } from "@/lib/api";

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", caption: "" });
  const [file, setFile] = useState(null);

  const load = () => api.get("/gallery").then((r) => setItems(r.data || []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!file || !form.title) return toast.error("Title and image required.");
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(",")[1] || "");
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      await api.post("/admin/gallery", { ...form, image_base64: base64, mime_type: file.type || "image/jpeg" });
      toast.success("Gallery image added.");
      setForm({ title: "", caption: "" });
      setFile(null);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const del = async (id) => {
    try { await api.delete(`/admin/gallery/${id}`); toast.success("Deleted."); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6" data-testid="admin-gallery-page">
      <div>
        <p className="label-eyebrow">Gallery manager</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Port images on homepage</h1>
      </div>

      <div className="card-flat p-6">
        <h2 className="font-heading text-lg text-navy mb-4">Add image</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label className="text-navy">Title</Label><Input data-testid="gallery-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label className="text-navy">Caption (optional)</Label><Textarea data-testid="gallery-caption" rows={1} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="mt-1.5" /></div>
          <div className="sm:col-span-3"><Label className="text-navy">Image file</Label><Input data-testid="gallery-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1.5" /></div>
        </div>
        <div className="mt-4"><Button onClick={add} className="bg-gold text-navy hover:bg-gold-400" data-testid="gallery-add-btn"><Plus className="h-4 w-4" /> Add to gallery</Button></div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && <div className="col-span-full card-flat p-6 text-sm text-navy/55">No gallery images yet.</div>}
        {items.map((g) => (
          <div key={g.gallery_id} className="card-flat overflow-hidden" data-testid={`gallery-item-admin-${g.gallery_id}`}>
            <div className="aspect-video bg-navy-50 overflow-hidden">
              <img src={`data:${g.mime_type || "image/jpeg"};base64,${g.image_base64}`} alt={g.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-heading text-navy text-sm truncate">{g.title}</div>
                {g.caption && <div className="text-xs text-navy/55 truncate">{g.caption}</div>}
              </div>
              <Button variant="outline" size="sm" onClick={() => del(g.gallery_id)} className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white" data-testid={`gallery-delete-${g.gallery_id}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
