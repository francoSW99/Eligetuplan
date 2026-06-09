export const BRAND = {
  name: "EligeTuPlan",
  logo: "/logos/mamag.png",
  phone: "+56 9 6831 9807",
  phoneClean: "+56968319807",
  whatsappBase: "https://wa.me/56968319807",
  email: "contacto@eligetuplan.cl",
};

export const STATS = {
  plansTotal: 2072,
  isapres: 7,
  regiones: 16,
  ufValueCLP: 40374,
  lastUpdate: "17 may 2026",
};

export const NAV_ITEMS = [
  { label: "Comparar planes", href: "/comparar/isapres" },
  { label: "Plan ideal con IA", href: "/tu-mejor-plan" },
  { label: "Cotiza con asesor", href: "/buscar" },
  { label: "Blog", href: "/blog" },
  { label: "Quiénes somos", href: "/faq" },
];

export type Isapre = {
  slug: string;
  name: string;
  logo: string;
  planCount: number;
};

export const ISAPRES: Isapre[] = [
  { slug: "banmedica",    name: "Banmédica",            logo: "/logos/banmedica-logo.png", planCount: 312 },
  { slug: "consalud",     name: "Consalud",             logo: "/logos/logo_consalud.png",  planCount: 287 },
  { slug: "cruzblanca",   name: "Cruz Blanca",          logo: "/logos/logo_cruzblanca.png", planCount: 264 },
  { slug: "nuevamasvida", name: "Nueva Más Vida",       logo: "/logos/Logo-NMV.png",       planCount: 218 },
  { slug: "colmena",      name: "Colmena Golden Cross", logo: "/logos/logos-col.png",      planCount: 301 },
  { slug: "vidatres",     name: "Vida Tres",            logo: "/logos/vida-tres.png",      planCount: 188 },
  { slug: "esencial",     name: "Esencial",             logo: "/logos/esencial.png",       planCount: 284 },
];

export type PathItem = {
  id: "ia" | "comparar" | "asesor";
  kicker: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  primary: boolean;
};

export const PATHS: PathItem[] = [
  {
    id: "ia",
    kicker: "Recomendado",
    title: "Tu plan ideal con IA",
    desc: "Cuéntanos sobre tu plan actual en 90 segundos y nuestra IA te muestra el plan que más te conviene: ahorro, cobertura o equilibrio.",
    cta: "Encontrar mi plan ideal",
    href: "/tu-mejor-plan",
    primary: true,
  },
  {
    id: "comparar",
    kicker: "Explora",
    title: "Comparar 2.072 planes",
    desc: "Filtra por precio, cobertura, modalidad y clínicas. Datos en tiempo real desde la Superintendencia de Salud.",
    cta: "Ver el catálogo",
    href: "/comparar/isapres",
    primary: false,
  },
  {
    id: "asesor",
    kicker: "Humano",
    title: "Habla con un asesor",
    desc: "Asesores certificados te llaman en menos de 24 horas. Sin costo, sin compromiso, sin llamadas no deseadas.",
    cta: "Cotizar con asesor",
    href: "/buscar",
    primary: false,
  },
];

export const STEPS = [
  { n: "01", t: "Cuéntanos sobre ti",       d: "Tu edad, sueldo y cargas. 30 segundos." },
  { n: "02", t: "Compara con datos reales", d: "2.072 planes activos, actualizados mensualmente." },
  { n: "03", t: "Cierra con tranquilidad",  d: "Un asesor certificado te acompaña hasta la firma. Sin costo." },
];

export const FAQS = [
  {
    q: "¿Es realmente 100% gratuito?",
    a: "Sí, completamente gratis para ti. Recibimos una comisión estándar regulada por ley directamente de las Isapres, lo que no afecta el precio final de tu plan.",
  },
  {
    q: "¿Cómo calculan el puntaje de los planes?",
    a: "Nuestro algoritmo cruza precio en pesos (calculado según UF del día), cobertura hospitalaria y ambulatoria, tope anual y tus clínicas de preferencia para rankear matemáticamente las mejores opciones.",
  },
  {
    q: "¿Qué pasa con mis preexistencias médicas?",
    a: "Toda declaración de salud la evalúa la Isapre receptora. Nuestros asesores te orientan sobre la viabilidad de aprobación antes de enviar la solicitud oficial.",
  },
  {
    q: "¿El trámite se hace presencial?",
    a: "No. Todo el proceso de selección y firma de contratos se hace 100% online con firma electrónica avanzada.",
  },
];
