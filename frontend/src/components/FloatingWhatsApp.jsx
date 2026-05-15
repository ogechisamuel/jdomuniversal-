import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/company";

export default function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-whatsapp-btn"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-3 pr-4 py-3 shadow-xl shadow-emerald-500/30 hover:scale-105 transition-transform"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
        <MessageCircle className="h-5 w-5" />
      </span>
      <span className="hidden sm:inline text-sm font-semibold">Chat on WhatsApp</span>
    </a>
  );
}
