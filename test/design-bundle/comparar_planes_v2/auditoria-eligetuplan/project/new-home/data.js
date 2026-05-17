// Real data from the existing /test/frontend codebase
// Used across header, hero, and homepage sections

window.SITE_DATA = {
  brand: {
    name: 'EligeTuPlan',
    logo: 'logos/mamag.png',  // white wordmark + mint icon — works on dark bg only
    phone: '+56 9 6831 9807',
    phoneClean: '+56968319807',
    whatsappBase: 'https://wa.me/56968319807',
    email: 'contacto@eligetuplan.cl',
  },

  nav: [
    { label: 'Comparar planes', href: '#comparar', primary: false },
    { label: 'Plan ideal con IA', href: '#ia', primary: false },
    { label: 'Cotiza con asesor', href: '#asesor', primary: false },
    { label: 'FAQ', href: '#faq', primary: false },
  ],

  // Hard data from the existing site
  stats: {
    plansTotal: 1854,        // real count from STATS in current page.tsx
    isapres: 7,              // 7 isapres en el mercado
    regiones: 16,            // 16 regiones del país
    ufValueCLP: 39987,       // hardcoded today — should be dynamic
    lastUpdate: '13 may 2026',
  },

  // 7 Isapres del mercado chileno (orden y logos del repo)
  isapres: [
    { slug: 'banmedica',    name: 'Banmédica',           logo: 'logos/banmedica-logo.png',   planCount: 312 },
    { slug: 'consalud',     name: 'Consalud',            logo: 'logos/logo_consalud.png',    planCount: 287 },
    { slug: 'cruzblanca',   name: 'Cruz Blanca',         logo: 'logos/logo_cruzblanca.png',  planCount: 264 },
    { slug: 'nuevamasvida', name: 'Nueva Más Vida',      logo: 'logos/Logo-NMV.png',         planCount: 218 },
    { slug: 'colmena',      name: 'Colmena Golden Cross', logo: 'logos/logos-col.png',       planCount: 301 },
    { slug: 'vidatres',     name: 'Vida Tres',           logo: 'logos/vida-tres.png',        planCount: 188 },
    { slug: 'esencial',     name: 'Esencial',            logo: 'logos/esencial.png',         planCount: 284 },
  ],

  // FAQ — 4 preguntas reales de /faq/page.tsx
  faqs: [
    {
      q: '¿Es realmente 100% gratuito?',
      a: 'Sí, completamente gratis para ti. Recibimos una comisión estándar regulada por ley directamente de las Isapres, lo que no afecta el precio final de tu plan.',
    },
    {
      q: '¿Cómo calculan el puntaje de los planes?',
      a: 'Nuestro algoritmo cruza precio en pesos (calculado según UF del día), cobertura hospitalaria y ambulatoria, tope anual y tus clínicas de preferencia para rankear matemáticamente las mejores opciones.',
    },
    {
      q: '¿Qué pasa con mis preexistencias médicas?',
      a: 'Toda declaración de salud la evalúa la Isapre receptora. Nuestros asesores te orientan sobre la viabilidad de aprobación antes de enviar la solicitud oficial.',
    },
    {
      q: '¿El trámite se hace presencial?',
      a: 'No. Todo el proceso de selección y firma de contratos se hace 100% online con firma electrónica avanzada.',
    },
  ],

  // 3 caminos (con jerarquía nueva — IA es el principal, los otros 2 son secundarios)
  paths: [
    {
      id: 'ia',
      kicker: 'Recomendado',
      title: 'Tu plan ideal con IA',
      desc: 'Cuéntanos sobre tu plan actual en 90 segundos y nuestra IA te muestra el plan que más te conviene: ahorro, cobertura o equilibrio.',
      cta: 'Encontrar mi plan ideal',
      href: '/tu-mejor-plan',
      image: 'images/kine.jpeg',
      primary: true,
    },
    {
      id: 'comparar',
      kicker: 'Explora',
      title: 'Comparar 1.854 planes',
      desc: 'Filtra por precio, cobertura, modalidad y clínicas. Datos en tiempo real desde la Superintendencia de Salud.',
      cta: 'Ver el catálogo',
      href: '/comparar/isapres',
      image: null,
      primary: false,
    },
    {
      id: 'asesor',
      kicker: 'Humano',
      title: 'Habla con un asesor',
      desc: 'Asesores certificados te llaman en menos de 24 horas. Sin costo, sin compromiso, sin llamadas no deseadas.',
      cta: 'Cotizar con asesor',
      href: '/buscar',
      image: null,
      primary: false,
    },
  ],

  // Cómo funciona — 3 pasos de /como-funciona
  steps: [
    { n: '01', t: 'Cuéntanos sobre ti',        d: 'Tu edad, sueldo y cargas. 30 segundos.' },
    { n: '02', t: 'Compara con datos reales',  d: '1.854 planes activos, actualizados mensualmente.' },
    { n: '03', t: 'Cierra con tranquilidad',   d: 'Un asesor certificado te acompaña hasta la firma. Sin costo.' },
  ],
};
