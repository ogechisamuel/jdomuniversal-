import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Anchor, Zap, FileCheck2, Phone, MapPin, ClipboardList, Truck, Search, FlaskConical, Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import api from "@/lib/api";
import { whatsappLink, COMPANY } from "@/lib/company";

const HERO_IMG = "https://images.unsplash.com/photo-1605745341112-85968b19335b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwzfHxjYXJnbyUyMHBvcnQlMjBjb250YWluZXJzJTIwc2hpcHxlbnwwfHx8fDE3Nzg4NzM4NjV8MA&ixlib=rb-4.1.0&q=85";

const industries = [
  { title: "Oil & Gas Tools", img: "https://images.unsplash.com/photo-1588011930968-eadac80e6a5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxvaWwlMjBnYXMlMjBpbmR1c3RyaWFsJTIwZXF1aXBtZW50fGVufDB8fHx8MTc3ODg3Mzg2NXww&ixlib=rb-4.1.0&q=85", icon: FlaskConical, points: ["Onne deep-water specialist", "Permit & customs duty optimisation", "Bonded handling of high-value tools"] },
  { title: "Garments & Textiles", img: "https://images.unsplash.com/photo-1718117059204-8380b0706219?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHx0ZXh0aWxlcyUyMGdhcm1lbnRzJTIwZmFicmljJTIwbWFudWZhY3R1cmluZ3xlbnwwfHx8fDE3Nzg4NzM4NzN8MA&ixlib=rb-4.1.0&q=85", icon: Truck, points: ["Apapa & Tin Can rapid release", "SONCAP & Form M handling", "Pre-shipment inspection ready"] },
  { title: "PPE & Safety Cargo", img: "https://images.unsplash.com/photo-1612787114413-a5e60ede7db8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxwcGUlMjBwZXJzb25hbCUyMHByb3RlY3RpdmUlMjBlcXVpcG1lbnQlMjBjb25zdHJ1Y3Rpb258ZW58MHx8fHwxNzc4ODczODczfDA&ixlib=rb-4.1.0&q=85", icon: ShieldCheck, points: ["NAFDAC / SON coordination", "Cold-chain & sealed handling", "Fast HS-code classification"] },
];

const steps = [
  { icon: ClipboardList, title: "Submit Request", text: "Send shipping documents in minutes via your dashboard." },
  { icon: FileCheck2, title: "Document Review", text: "PAAR, BOL, Form M & Proforma validated by our brokers." },
  { icon: Zap, title: "Customs Filing", text: "Direct electronic filing to NCS with priority lanes." },
  { icon: Anchor, title: "Port Operations", text: "Boots-on-ground at Apapa, Tin Can and Onne." },
  { icon: Truck, title: "Delivered & Cleared", text: "Cargo released, transport coordinated, tracking shared." },
];

export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [trackNo, setTrackNo] = useState("");
  const [trackResult, setTrackResult] = useState(null);

  useEffect(() => {
    api.get("/testimonials").then((r) => setTestimonials(r.data || [])).catch(() => {});
    api.get("/gallery").then((r) => setGallery(r.data || [])).catch(() => {});
  }, []);

  const track = async (e) => {
    e.preventDefault();
    setTrackResult({ loading: true });
    try {
      const { data } = await api.get(`/tracking/${trackNo.trim()}`);
      setTrackResult({ data });
    } catch {
      setTrackResult({ error: "Tracking number not found." });
    }
  };

  const fallbackGallery = [
    "https://images.unsplash.com/photo-1763951515641-12637c29d176?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwzfHxsb2dpc3RpY3MlMjB3YXJlaG91c2UlMjB3b3JrZXJzfGVufDB8fHx8MTc3ODg3Mzg2NXww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1573207535342-8c0f9506112e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjB3YXJlaG91c2UlMjB3b3JrZXJzfGVufDB8fHx8MTc3ODg3Mzg2NXww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1772298783095-be38fa901232?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwyfHxsb2dpc3RpY3MlMjB3YXJlaG91c2UlMjB3b3JrZXJzfGVufDB8fHx8MTc3ODg3Mzg2NXww&ixlib=rb-4.1.0&q=85",
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/30" />
        </div>
        <div className="relative container-x py-20 lg:py-32 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <span className="label-eyebrow text-gold" data-testid="hero-eyebrow">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" /> Licensed Customs Broker · Apapa · Tin Can · Onne
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] mt-5 tracking-tight" data-testid="hero-title">
              Zero-Delay Customs Clearing for{" "}
              <span className="text-gold">Oil &amp; Industrial Cargo</span>
            </h1>
            <p className="mt-6 text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed">
              JDOM Universal Concept Ltd moves Nigeria's most demanding cargo through customs in record time. From oil-rig spares to PPE consignments — handled by veterans with direct port access.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#lead-form" className="btn-gold" data-testid="hero-quote-btn">
                Request Immediate Quote <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#track" className="btn-outline-navy bg-white/5 border-white/30 text-white hover:bg-white hover:text-navy" data-testid="hero-track-btn">
                Track Shipment
              </a>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-outline-navy border-white/30 text-white hover:bg-[#25D366] hover:border-[#25D366] hover:text-white" data-testid="hero-whatsapp-btn">
                WhatsApp Chat
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { k: "72h", v: "Avg. Onne clearance" },
                { k: "1,200+", v: "Containers / year" },
                { k: "0", v: "Demurrage incidents" },
              ].map((s) => (
                <div key={s.k} className="border-l border-gold/40 pl-4">
                  <div className="font-heading text-3xl text-gold font-extrabold">{s.k}</div>
                  <div className="text-white/60 text-xs uppercase tracking-widest mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <LeadCaptureForm />
          </div>
        </div>
      </section>

      {/* TRACK BAR */}
      <section id="track" className="bg-white border-b border-border">
        <div className="container-x py-10 grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5">
            <p className="label-eyebrow">Live tracking</p>
            <h2 className="font-heading text-2xl sm:text-3xl text-navy mt-1">Where is my cargo?</h2>
            <p className="text-navy/70 text-sm mt-2">Enter the tracking reference provided by your JDOM agent.</p>
          </div>
          <form onSubmit={track} className="md:col-span-7 flex gap-2">
            <input
              data-testid="track-input"
              value={trackNo}
              onChange={(e) => setTrackNo(e.target.value)}
              placeholder="e.g. JDM-2026-00421"
              className="flex-1 h-12 px-4 rounded-md border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <Button type="submit" className="bg-navy text-white hover:bg-navy-600 h-12 px-6" data-testid="track-submit-btn">
              <Search className="h-4 w-4" /> Track
            </Button>
          </form>
          {trackResult && (
            <div className="md:col-span-12 rounded-lg bg-navy-50 border border-border p-4 text-sm text-navy" data-testid="track-result">
              {trackResult.loading && "Searching…"}
              {trackResult.error && <span className="text-destructive">{trackResult.error}</span>}
              {trackResult.data && (
                <div className="grid sm:grid-cols-4 gap-3">
                  <div><div className="text-xs uppercase text-navy/60">Tracking</div><div className="font-semibold">{trackResult.data.tracking_number}</div></div>
                  <div><div className="text-xs uppercase text-navy/60">Status</div><div className="font-semibold capitalize text-gold-700">{trackResult.data.status}</div></div>
                  <div><div className="text-xs uppercase text-navy/60">Port</div><div className="font-semibold">{trackResult.data.port}</div></div>
                  <div><div className="text-xs uppercase text-navy/60">Latest update</div><div className="font-semibold">{trackResult.data.tracking_status || "—"}</div></div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="bg-white">
        <div className="container-x py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="label-eyebrow" data-testid="industries-eyebrow">What we clear</p>
              <h2 className="font-heading text-3xl sm:text-4xl text-navy mt-2">Specialists where it matters</h2>
            </div>
            <p className="text-navy/60 max-w-md text-sm">
              Three industries, one obsession: getting your cargo out of port before demurrage starts ticking.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {industries.map((i) => (
              <div key={i.title} className="card-flat overflow-hidden hover:shadow-xl hover:-translate-y-1" data-testid={`industry-card-${i.title}`}>
                <div className="aspect-[4/3] overflow-hidden bg-navy-50">
                  <img src={i.img} alt={i.title} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold">
                      <i.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading text-xl text-navy">{i.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-navy/75">
                    {i.points.map((p) => (
                      <li key={p} className="flex gap-2"><span className="text-gold mt-0.5">▸</span>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAST TRACK */}
      <section className="bg-[#F8F9FA]">
        <div className="container-x py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="label-eyebrow" data-testid="fasttrack-eyebrow">Fast Track Process</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-navy mt-2">5 steps. No surprises.</h2>
            <p className="text-navy/70 text-sm mt-4">From documents to delivered — a transparent workflow you can audit at any point.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((s, idx) => (
              <div key={s.title} className="relative card-flat p-6" data-testid={`fasttrack-step-${idx + 1}`}>
                <span className="absolute -top-3 -left-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold text-navy font-heading font-extrabold text-sm">{idx + 1}</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold mb-4">
                  <s.icon className="h-5 w-5" />
                </span>
                <h4 className="font-heading text-base text-navy">{s.title}</h4>
                <p className="text-sm text-navy/65 mt-2 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white">
        <div className="container-x py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-eyebrow">Voices from the field</p>
              <h2 className="font-heading text-3xl sm:text-4xl text-navy mt-2">Trusted at the docks</h2>
            </div>
            <Quote className="h-12 w-12 text-gold/30 hidden md:block" />
          </div>
          <Carousel opts={{ loop: true, align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {testimonials.map((t) => (
                <CarouselItem key={t.testimonial_id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full card-flat p-6 flex flex-col" data-testid={`testimonial-${t.testimonial_id}`}>
                    <Quote className="h-6 w-6 text-gold mb-3" />
                    <p className="text-navy/85 text-sm leading-relaxed">{t.quote}</p>
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <div className="font-heading text-navy text-sm">{t.name}</div>
                        <div className="text-xs text-navy/60">{t.role}{t.company ? ` · ${t.company}` : ""}</div>
                      </div>
                      <div className="flex gap-0.5 text-gold">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold" />)}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious data-testid="testimonials-prev" className="hidden md:flex" />
            <CarouselNext data-testid="testimonials-next" className="hidden md:flex" />
          </Carousel>
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-navy text-white">
        <div className="container-x py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-eyebrow text-gold">Real work · Real ports</p>
              <h2 className="font-heading text-3xl sm:text-4xl mt-2">Boots on the ground</h2>
            </div>
            <Link to="/about" className="hidden md:inline-flex items-center gap-2 text-gold hover:underline text-sm" data-testid="gallery-about-link">
              About our team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(gallery.length ? gallery : fallbackGallery.map((u, i) => ({ gallery_id: `g${i}`, image_base64: null, _url: u, title: "Port operations" }))).map((g, i) => (
              <div key={g.gallery_id || i} className="group relative overflow-hidden rounded-xl border border-white/10 aspect-[4/3]" data-testid={`gallery-item-${i}`}>
                <img
                  src={g.image_base64 ? `data:${g.mime_type || "image/jpeg"};base64,${g.image_base64}` : g._url}
                  alt={g.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-heading text-sm">{g.title}</div>
                  {g.caption && <div className="text-xs text-white/70 mt-1">{g.caption}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="container-x py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="label-eyebrow">Ready when you are</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-navy mt-2">Stop paying demurrage. Start clearing with JDOM.</h2>
            <p className="text-navy/70 mt-4 text-sm leading-relaxed">
              Speak to a customs specialist now — our average response time is under 30 minutes during port hours.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-gold" data-testid="cta-whatsapp-btn">
                WhatsApp our desk
              </a>
              <Link to="/contact" className="btn-outline-navy" data-testid="cta-contact-btn">
                <Phone className="h-4 w-4" /> {COMPANY.phone}
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-navy text-white p-8 border border-gold/30">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.18em]"><MapPin className="h-4 w-4" /> Port presence</div>
            <ul className="mt-6 space-y-4">
              {[
                { p: "Apapa Port Complex", d: "Lagos · General cargo, textiles, PPE" },
                { p: "Tin Can Island", d: "Lagos · Containers, vehicles, machinery" },
                { p: "Onne Port", d: "Rivers · Oil & Gas free zone specialist" },
              ].map((row) => (
                <li key={row.p} className="flex items-start gap-3" data-testid={`cta-port-${row.p}`}>
                  <Anchor className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <div className="font-heading">{row.p}</div>
                    <div className="text-xs text-white/65">{row.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
