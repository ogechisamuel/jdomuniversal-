import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function Contact() {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="container-x py-20">
          <p className="label-eyebrow text-gold" data-testid="contact-eyebrow">Contact</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mt-3 max-w-2xl">Talk to a clearing specialist.</h1>
          <p className="mt-4 text-white/75 max-w-2xl">Most replies within 30 minutes during port hours. WhatsApp is fastest.</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-x py-20 grid md:grid-cols-3 gap-6">
          {[
            { i: Phone, t: "Call us", v: COMPANY.phone, href: `tel:${COMPANY.phone.replace(/\s/g, "")}`, k: "phone" },
            { i: Mail, t: "Email", v: COMPANY.email, href: `mailto:${COMPANY.email}`, k: "email" },
            { i: MessageCircle, t: "WhatsApp", v: "Tap to chat", href: whatsappLink(), k: "whatsapp" },
          ].map((c) => (
            <a key={c.t} href={c.href} target="_blank" rel="noreferrer" className="card-flat p-7 hover:-translate-y-1 hover:shadow-xl group" data-testid={`contact-card-${c.k}`}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-navy text-gold group-hover:bg-gold group-hover:text-navy transition-colors">
                <c.i className="h-6 w-6" />
              </span>
              <h3 className="font-heading text-xl text-navy mt-4">{c.t}</h3>
              <p className="text-navy/70 mt-1">{c.v}</p>
            </a>
          ))}
        </div>

        <div className="container-x pb-24">
          <div className="card-flat p-8 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="label-eyebrow">Office</p>
              <h3 className="font-heading text-2xl text-navy mt-2">{COMPANY.address}</h3>
              <p className="text-sm text-navy/70 mt-3 leading-relaxed">
                Visits by appointment only. Our brokers are usually at the port — please book ahead.
              </p>
              <div className="mt-5 flex items-center gap-2 text-navy">
                <MapPin className="h-5 w-5 text-gold" /> Apapa, Lagos · Nigeria
              </div>
            </div>
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border">
              <iframe
                title="JDOM Office Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=3.34%2C6.43%2C3.40%2C6.46&layer=mapnik"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
