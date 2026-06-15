export type IsapreLandingInfo = {
  slug: string;
  name: string;
  logo: string;
  officialUrl: string;
  officialLabel: string;
  description: string;
};

export const ISAPRE_LANDING_INFO: Record<string, IsapreLandingInfo> = {
  banmedica: {
    slug: "banmedica",
    name: "Banmédica",
    logo: "/logos/banmedica-logo.png",
    officialUrl: "https://www.banmedica.cl/",
    officialLabel: "banmedica.cl",
    description:
      "Compara planes Banmédica vigentes por precio, cobertura, modalidad y clínicas asociadas.",
  },
  consalud: {
    slug: "consalud",
    name: "Consalud",
    logo: "/logos/logo_consalud.png",
    officialUrl: "https://www.consalud.cl/index.html",
    officialLabel: "consalud.cl",
    description:
      "Compara planes Consalud vigentes por precio en UF, cobertura hospitalaria y ambulatoria, modalidad y clínicas.",
  },
  cruzblanca: {
    slug: "cruzblanca",
    name: "Cruz Blanca",
    logo: "/logos/logo_cruzblanca.png",
    officialUrl: "https://www.cruzblanca.cl/",
    officialLabel: "cruzblanca.cl",
    description:
      "Compara planes Cruz Blanca vigentes y revisa precios, coberturas y alternativas según tu perfil.",
  },
  nuevamasvida: {
    slug: "nuevamasvida",
    name: "Nueva Más Vida",
    logo: "/logos/Logo-NMV.png",
    officialUrl: "https://www.nuevamasvida.cl/",
    officialLabel: "nuevamasvida.cl",
    description:
      "Compara planes Nueva Más Vida por precio, cobertura y modalidad antes de cotizar.",
  },
  colmena: {
    slug: "colmena",
    name: "Colmena Golden Cross",
    logo: "/logos/logos-col.png",
    officialUrl: "https://www.colmena.cl/",
    officialLabel: "colmena.cl",
    description:
      "Compara planes Colmena Golden Cross vigentes con datos de precio, cobertura y clínicas.",
  },
  vidatres: {
    slug: "vidatres",
    name: "Vida Tres",
    logo: "/logos/vida-tres.png",
    officialUrl: "https://www.vidatres.cl/",
    officialLabel: "vidatres.cl",
    description:
      "Compara planes Vida Tres vigentes por precio base, cobertura y red de atención.",
  },
  esencial: {
    slug: "esencial",
    name: "Esencial",
    logo: "/logos/esencial.png",
    officialUrl: "https://www.somosesencial.cl/",
    officialLabel: "somosesencial.cl",
    description:
      "Compara planes Esencial vigentes y revisa si calzan con tu presupuesto de salud.",
  },
};

export const ISAPRE_LANDING_SLUGS = Object.keys(ISAPRE_LANDING_INFO);
