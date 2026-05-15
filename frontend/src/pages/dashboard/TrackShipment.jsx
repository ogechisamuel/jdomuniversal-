import { useState } from "react";
import { Search, Truck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function TrackShipment() {
  const [trackNo, setTrackNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(null); setResult(null);
    try {
      const { data } = await api.get(`/tracking/${trackNo.trim()}`);
      setResult(data);
    } catch {
      setErr("Tracking number not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl" data-testid="track-page">
      <div>
        <p className="label-eyebrow">Track Shipment</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Live cargo status</h1>
        <p className="text-sm text-navy/65 mt-1">Enter the tracking number provided by your JDOM agent.</p>
      </div>

      <form onSubmit={search} className="card-flat p-6 flex gap-2">
        <Input data-testid="track-input-dash" value={trackNo} onChange={(e) => setTrackNo(e.target.value)} placeholder="e.g. JDM-2026-00421" className="flex-1 h-12" />
        <Button type="submit" disabled={loading || !trackNo} className="bg-navy text-white hover:bg-navy-600 h-12 px-6" data-testid="track-search-btn">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Search</>}
        </Button>
      </form>

      {err && <div className="card-flat p-6 text-sm text-destructive" data-testid="track-error">{err}</div>}

      {result && (
        <div className="card-flat p-6 space-y-4" data-testid="track-result-card">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-navy text-gold">
              <Truck className="h-6 w-6" />
            </span>
            <div>
              <div className="font-heading text-xl text-navy">Tracking #{result.tracking_number}</div>
              <div className="text-xs text-navy/55">Last update: {new Date(result.updated_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            <Cell k="Status" v={result.status} />
            <Cell k="Port" v={result.port} />
            <Cell k="Cargo" v={result.cargo_type} />
            <Cell k="Containers" v={result.containers} />
          </div>
          <div>
            <div className="text-xs text-navy/55 uppercase tracking-widest">Latest update</div>
            <div className="font-heading text-navy mt-1">{result.tracking_status || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({ k, v }) {
  return (
    <div>
      <div className="text-xs text-navy/55 uppercase tracking-widest">{k}</div>
      <div className="font-heading text-navy capitalize mt-1">{v || "—"}</div>
    </div>
  );
}
