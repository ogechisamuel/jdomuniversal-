export const COMPANY = {
  name: "JDOM Universal Concept Ltd",
  short: "JDOM",
  tagline: "Zero-Delay Customs Clearing for Oil & Industrial Cargo",
  phone: "+234 800 000 0000",
  whatsapp: "2348000000000",
  whatsapp_message: "Hello JDOM, I want to clear cargo. Please assist.",
  email: "info@jdomuniversal.live",
  address: "Apapa Port Complex, Lagos, Nigeria",
  ports: ["Apapa", "Tin Can", "Onne"],
};

export const whatsappLink = () =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(COMPANY.whatsapp_message)}`;
