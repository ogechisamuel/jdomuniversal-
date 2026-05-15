import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Anchor } from "lucide-react";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function Footer() {
  return (
    <footer className="bg-navy text-white" data-testid="site-footer">
      <div className="container-x py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gold text-navy font-heading font-extrabold text-lg">J</span>
            <span className="font-heading font-bold text-xl">JDOM <span className="text-gold">Universal</span></span>
          </div>
          <p className="text-white/70 text-sm max-w-md leading-relaxed">
            Nigeria's specialist customs clearing agency for oil &amp; gas, industrial cargo, textiles and PPE. Zero demurrage, full documentation control across Apapa, Tin Can and Onne.
          </p>
          <div className="flex gap-3 mt-6">
            {COMPANY.ports.map((p) => (
              <span key={p} data-testid={`footer-port-${p.toLowerCase()}`} className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gold border border-gold/30 px-3 py-1 rounded-full">
                <Anchor className="h-3 w-3" /> {p}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading text-gold uppercase text-xs tracking-[0.18em] mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-gold" to="/about" data-testid="footer-link-about">About</Link></li>
            <li><Link className="hover:text-gold" to="/resources" data-testid="footer-link-resources">Resources</Link></li>
            <li><Link className="hover:text-gold" to="/contact" data-testid="footer-link-contact">Contact</Link></li>
            <li><Link className="hover:text-gold" to="/login" data-testid="footer-link-login">Importer Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-gold uppercase text-xs tracking-[0.18em] mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 text-gold mt-0.5" /> {COMPANY.phone}</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 text-gold mt-0.5" /> {COMPANY.email}</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-gold mt-0.5" /> {COMPANY.address}</li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" data-testid="footer-whatsapp-link"
                 className="inline-flex items-center gap-2 text-gold hover:underline">
                WhatsApp Chat
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p>RC No. ████████ · Licensed Customs Agent</p>
        </div>
      </div>
    </footer>
  );
}
