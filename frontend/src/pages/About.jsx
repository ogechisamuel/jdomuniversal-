import { Anchor, ShieldCheck, Award, Zap } from "lucide-react";

const VALUES = [
  { i: Zap, t: "Speed first", d: "We measure clearance time in hours, not days. Every workflow is built to compress turnaround." },
  { i: ShieldCheck, t: "Documentation precision", d: "PAAR, BOL, Form M, SONCAP — every field cross-checked by two brokers before submission." },
  { i: Anchor, t: "Port-side veterans", d: "Permanent agents at Apapa, Tin Can and Onne — we know the officers, the lanes, the systems." },
  { i: Award, t: "Oil & gas mandate", d: "Onne free-zone specialists with deep experience on rig spares and high-value industrial cargo." },
];

export default function About() {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="container-x py-20 lg:py-28">
          <p className="label-eyebrow text-gold" data-testid="about-eyebrow">About JDOM UNIVERSAL CONCEPT LTD</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-4 max-w-3xl leading-tight">
            Built by veterans of the <span className="text-gold">Nigerian customs corridor</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-white/75 text-base leading-relaxed">
            JDOM UNIVERSAL CONCEPT LTD is a licensed customs clearing agency headquartered in Lagos, with permanent operations at the three most strategic ports in Nigeria — Apapa, Tin Can Island, and Onne. We specialise in the hard cargo nobody else wants to touch.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-x py-24 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="label-eyebrow">Our mission</p>
            <h2 className="font-heading text-3xl text-navy mt-2">Zero demurrage. Zero surprises.</h2>
            <p className="text-navy/75 mt-4 leading-relaxed text-sm">
              Every day a container sits at port, your margin evaporates. We exist to compress that window — through documentation discipline, port-side relationships, and an obsession with knowing what's happening with your cargo before you ask.
            </p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.t} className="card-flat p-6" data-testid={`about-value-${v.t}`}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold">
                  <v.i className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-lg text-navy mt-4">{v.t}</h3>
                <p className="text-sm text-navy/70 mt-2 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F9FA]">
        <div className="container-x py-24">
          <p className="label-eyebrow">Port presence</p>
          <h2 className="font-heading text-3xl text-navy mt-2 mb-10">Three strategic locations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { p: "Apapa Port", d: "Lagos · The heart of West African shipping. Permanent desk, deep relationships." },
              { p: "Tin Can Island", d: "Lagos · Specialist desk for containerized and ro-ro cargo." },
              { p: "Onne Port", d: "Rivers · Oil & Gas free-zone with full customs-bonded warehousing capability." },
            ].map((row) => (
              <div key={row.p} className="card-flat p-6" data-testid={`about-port-${row.p}`}>
                <div className="flex items-center gap-2 text-gold-700 text-xs uppercase tracking-widest">
                  <Anchor className="h-4 w-4" /> {row.p}
                </div>
                <h3 className="font-heading text-xl text-navy mt-3">{row.p}</h3>
                <p className="text-sm text-navy/70 mt-2 leading-relaxed">{row.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
