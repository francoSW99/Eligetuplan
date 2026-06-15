export type GuideIcon =
  | "compare"
  | "family"
  | "pregnancy"
  | "independent"
  | "young"
  | "senior"
  | "switch"
  | "fonasa";

export type SeoGuideCard = {
  title: string;
  shortTitle: string;
  href: string;
  kicker: string;
  description: string;
  cta: string;
  icon: GuideIcon;
  intent: "principal" | "perfil" | "decision";
};

export type ProfileLanding = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  cta: string;
  icon: GuideIcon;
  audience: string;
  whatsappMessage: string;
  planQuery: {
    label: string;
    description: string;
    compareHref: string;
    params: {
      con_parto?: boolean;
      precio_max_clp?: number;
      cobertura_hosp_min?: number;
      cobertura_amb_min?: number;
      modalidad?: string;
      sort?: string;
    };
  };
  bullets: string[];
  comparePoints: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

export const HOME_SEO_GUIDES: SeoGuideCard[] = [
  {
    title: "Comparar planes de Isapre",
    shortTitle: "Comparar planes",
    href: "/comparar-planes-isapre",
    kicker: "Alta intención",
    description: "Una entrada directa para revisar precios, coberturas, redes y alternativas antes de cotizar.",
    cta: "Comparar ahora",
    icon: "compare",
    intent: "principal",
  },
  {
    title: "Planes de Isapre para familias",
    shortTitle: "Familias",
    href: "/planes-isapre/familia",
    kicker: "Perfil familiar",
    description: "Pensado para quienes cotizan con cargas, hijos o pareja y necesitan equilibrar precio y cobertura.",
    cta: "Ver guía familiar",
    icon: "family",
    intent: "perfil",
  },
  {
    title: "Planes de Isapre para embarazo",
    shortTitle: "Embarazo",
    href: "/planes-isapre/embarazada",
    kicker: "Maternidad",
    description: "Qué revisar si estás planificando embarazo o quieres entender coberturas de maternidad.",
    cta: "Ver guía",
    icon: "pregnancy",
    intent: "perfil",
  },
  {
    title: "Planes para independientes",
    shortTitle: "Independientes",
    href: "/planes-isapre/independiente",
    kicker: "Cotización flexible",
    description: "Cómo mirar tu 7%, presupuesto mensual y continuidad de cobertura si boleteas o trabajas por cuenta propia.",
    cta: "Revisar opciones",
    icon: "independent",
    intent: "perfil",
  },
  {
    title: "Cambiarse de Isapre",
    shortTitle: "Cambiar Isapre",
    href: "/cambiar-isapre",
    kicker: "Decisión",
    description: "Guía para evaluar si te conviene cambiar tu plan actual sin perder cobertura importante.",
    cta: "Ver proceso",
    icon: "switch",
    intent: "decision",
  },
  {
    title: "Pasar de Fonasa a Isapre",
    shortTitle: "Fonasa a Isapre",
    href: "/pasar-fonasa-a-isapre",
    kicker: "Evaluación",
    description: "Compara si tu 7% alcanza para una alternativa privada que tenga sentido para tu caso.",
    cta: "Evaluar mi caso",
    icon: "fonasa",
    intent: "decision",
  },
];

export const SECONDARY_SEO_GUIDES: SeoGuideCard[] = [
  {
    title: "Planes de Isapre para jóvenes",
    shortTitle: "Jóvenes",
    href: "/planes-isapre/joven",
    kicker: "Primera Isapre",
    description: "Opciones para quienes buscan precio bajo, buena red ambulatoria y cobertura suficiente sin sobredimensionar el plan.",
    cta: "Ver guía joven",
    icon: "young",
    intent: "perfil",
  },
  {
    title: "Planes de Isapre para adultos mayores",
    shortTitle: "Adultos mayores",
    href: "/planes-isapre/adulto-mayor",
    kicker: "Revisión cuidadosa",
    description: "Qué mirar en precio, topes, red y continuidad de atención antes de tomar una decisión.",
    cta: "Ver guía",
    icon: "senior",
    intent: "perfil",
  },
];

export const ALL_SEO_GUIDES = [...HOME_SEO_GUIDES, ...SECONDARY_SEO_GUIDES];

export const PROFILE_LANDINGS: Record<string, ProfileLanding> = {
  familia: {
    slug: "familia",
    title: "Planes de Isapre para familias",
    shortTitle: "Familias",
    eyebrow: "Cobertura para tu grupo familiar",
    description:
      "Compara planes pensando en cargas, hijos, pareja, clínicas preferidas y presupuesto mensual. La idea no es solo pagar menos, sino cubrir bien a quienes dependen del plan.",
    metaTitle: "Planes de Isapre para Familias | Compara Coberturas",
    metaDescription:
      "Compara planes de Isapre para familias con hijos o cargas. Revisa precio, cobertura, clínicas y solicita asesoría gratuita.",
    cta: "Comparar planes familiares",
    icon: "family",
    audience: "Familias con hijos, cargas o pareja que buscan equilibrar precio y cobertura.",
    whatsappMessage: "Hola, quiero comparar planes de Isapre para mi familia.",
    planQuery: {
      label: "planes con cobertura robusta",
      description:
        "Muestra inicial de planes con al menos 70% hospitalario y 60% ambulatorio. No reemplaza una cotización familiar con edades y cargas.",
      compareHref: "/comparar/isapres?cobertura_hosp_min=70&cobertura_amb_min=60",
      params: { cobertura_hosp_min: 70, cobertura_amb_min: 60, sort: "precio_asc" },
    },
    bullets: [
      "Cuántas cargas tendrá el contrato y sus edades.",
      "Cobertura hospitalaria y ambulatoria para el grupo completo.",
      "Clínicas y centros médicos donde la familia realmente se atiende.",
      "Precio final considerando tu 7% y adicional mensual.",
    ],
    comparePoints: [
      {
        title: "Cargas y edad",
        description: "El costo puede cambiar mucho según la composición familiar. Conviene comparar con datos reales antes de contratar.",
      },
      {
        title: "Red de atención",
        description: "No sirve un buen porcentaje si la red no calza con las clínicas o especialistas que usa tu familia.",
      },
      {
        title: "Topes y cobertura",
        description: "Revisa topes anuales, hospitalización, urgencias y prestaciones frecuentes para evitar sorpresas.",
      },
    ],
    faqs: [
      {
        question: "¿Qué plan de Isapre conviene para una familia?",
        answer:
          "Depende de la edad de los integrantes, cantidad de cargas, clínicas preferidas y presupuesto. Lo correcto es comparar varias Isapres con el mismo perfil familiar.",
      },
      {
        question: "¿Agregar cargas encarece el plan?",
        answer:
          "Sí, normalmente el precio cambia al agregar cargas. Por eso conviene recalcular el valor final antes de firmar o cambiar de plan.",
      },
      {
        question: "¿Puedo cotizar gratis un plan familiar?",
        answer:
          "Sí. En EligeTuPlan puedes comparar alternativas y pedir asesoría gratuita para revisar qué plan calza con tu familia.",
      },
    ],
  },
  embarazada: {
    slug: "embarazada",
    title: "Planes de Isapre para embarazo y maternidad",
    shortTitle: "Embarazo",
    eyebrow: "Maternidad con información clara",
    description:
      "Una guía para revisar cobertura de maternidad, clínicas, topes, declaración de salud y costos antes de elegir o cambiar un plan.",
    metaTitle: "Planes de Isapre para Embarazo | Cobertura Maternidad",
    metaDescription:
      "Compara planes de Isapre para embarazo y maternidad. Revisa cobertura, clínicas, topes y solicita asesoría gratuita.",
    cta: "Comparar planes para embarazo",
    icon: "pregnancy",
    audience: "Personas que están planificando embarazo o quieren revisar cobertura de maternidad.",
    whatsappMessage: "Hola, quiero revisar planes de Isapre pensando en embarazo o maternidad.",
    planQuery: {
      label: "planes con parto",
      description:
        "Muestra de planes marcados con parto en la base del comparador. La cobertura final debe confirmarse en el contrato y documentos oficiales.",
      compareHref: "/comparar/isapres?con_parto=true",
      params: { con_parto: true, sort: "precio_asc" },
    },
    bullets: [
      "Cobertura hospitalaria para parto y maternidad.",
      "Clínicas disponibles según el plan y la Isapre.",
      "Topes, copagos y condiciones específicas del contrato.",
      "Evaluación de declaración de salud según la normativa vigente.",
    ],
    comparePoints: [
      {
        title: "Maternidad",
        description: "Revisa cómo cubre parto, hospitalización y prestaciones relacionadas, siempre validando condiciones oficiales.",
      },
      {
        title: "Clínicas",
        description: "La cobertura práctica depende mucho de la clínica donde quieras atenderte.",
      },
      {
        title: "Timing",
        description: "Si estás planificando, conviene evaluar antes de cambiar para entender restricciones y declaración de salud.",
      },
    ],
    faqs: [
      {
        question: "¿Puedo cambiarme de Isapre estando embarazada?",
        answer:
          "La nueva Isapre evalúa la declaración de salud y las condiciones del contrato. Conviene revisar tu caso con asesoría antes de tomar una decisión.",
      },
      {
        question: "¿Todos los planes cubren maternidad igual?",
        answer:
          "No. Coberturas, topes, redes y copagos pueden variar entre planes e Isapres.",
      },
      {
        question: "¿La guía reemplaza información oficial de la Isapre?",
        answer:
          "No. Esta guía te ayuda a comparar, pero siempre debes validar condiciones finales con la Isapre correspondiente.",
      },
    ],
  },
  independiente: {
    slug: "independiente",
    title: "Planes de Isapre para independientes",
    shortTitle: "Independientes",
    eyebrow: "Salud privada si trabajas por cuenta propia",
    description:
      "Si boleteas, emprendes o tienes ingresos variables, compara planes considerando tu 7%, flujo mensual y continuidad de cobertura.",
    metaTitle: "Planes de Isapre para Independientes | Cotiza Gratis",
    metaDescription:
      "Compara planes de Isapre para trabajadores independientes. Revisa precio, 7%, cobertura y solicita asesoría gratuita.",
    cta: "Comparar planes para independientes",
    icon: "independent",
    audience: "Trabajadores independientes, freelancers, emprendedores y personas con ingresos variables.",
    whatsappMessage: "Hola, soy independiente y quiero comparar planes de Isapre.",
    planQuery: {
      label: "planes de menor precio inicial",
      description:
        "Muestra ordenada por precio base para revisar alternativas sostenibles si tus ingresos son variables.",
      compareHref: "/comparar/isapres?sort=precio_asc",
      params: { sort: "precio_asc" },
    },
    bullets: [
      "Presupuesto mensual realista, no solo el valor base del plan.",
      "Cómo calza tu 7% con el adicional de salud.",
      "Cobertura ambulatoria para controles, exámenes y consultas frecuentes.",
      "Flexibilidad si tus ingresos cambian durante el año.",
    ],
    comparePoints: [
      {
        title: "Precio sostenible",
        description: "Un plan bueno en papel puede ser mala idea si no calza con tu flujo mensual.",
      },
      {
        title: "Uso frecuente",
        description: "Para independientes suele importar mucho la cobertura ambulatoria y la red cercana.",
      },
      {
        title: "Cotización",
        description: "Revisa cómo pagas, actualizas datos y mantienes continuidad para evitar lagunas.",
      },
    ],
    faqs: [
      {
        question: "¿Puedo tener Isapre si soy independiente?",
        answer:
          "Sí, pero debes revisar requisitos de cotización, pago y documentación según tu situación. Un asesor puede ayudarte a ordenar ese punto.",
      },
      {
        question: "¿Qué pasa si mis ingresos varían?",
        answer:
          "Conviene elegir un plan cuyo valor mensual puedas sostener incluso en meses más bajos.",
      },
      {
        question: "¿El comparador calcula el 7%?",
        answer:
          "El comparador te ayuda a revisar precios y alternativas. Para un cálculo fino según ingresos, puedes pedir asesoría gratuita.",
      },
    ],
  },
  joven: {
    slug: "joven",
    title: "Planes de Isapre para jóvenes",
    shortTitle: "Jóvenes",
    eyebrow: "Primera cobertura privada",
    description:
      "Una ruta para personas jóvenes que buscan una primera Isapre, pagar lo justo y mantener buena cobertura para consultas, urgencias y exámenes.",
    metaTitle: "Planes de Isapre para Jóvenes | Compara Precios",
    metaDescription:
      "Compara planes de Isapre para jóvenes. Revisa precio, cobertura ambulatoria, urgencias y alternativas de bajo costo.",
    cta: "Comparar planes para jóvenes",
    icon: "young",
    audience: "Personas jóvenes que cotizan por primera vez o quieren bajar su costo mensual.",
    whatsappMessage: "Hola, quiero comparar planes de Isapre para una persona joven.",
    planQuery: {
      label: "planes bajo $90.000 aprox.",
      description:
        "Muestra inicial de planes bajo $90.000 aproximadamente, pensada para revisar alternativas de entrada al sistema privado.",
      compareHref: "/comparar/isapres?precio_max_clp=90000",
      params: { precio_max_clp: 90000, sort: "precio_asc" },
    },
    bullets: [
      "Precio base y adicional mensual.",
      "Urgencias y atención ambulatoria.",
      "Convenios con clínicas o centros donde realmente te atenderías.",
      "Evitar pagar por coberturas que no usarás.",
    ],
    comparePoints: [
      {
        title: "Precio",
        description: "En una primera Isapre suele convenir partir por un valor sostenible y revisar cobertura esencial.",
      },
      {
        title: "Uso real",
        description: "Consulta, exámenes, urgencias y telemedicina pueden pesar más que grandes redes que no usarás.",
      },
      {
        title: "Escalabilidad",
        description: "Elige una alternativa que puedas ajustar cuando cambien tus ingresos o etapa de vida.",
      },
    ],
    faqs: [
      {
        question: "¿Cuál es la Isapre más barata para jóvenes?",
        answer:
          "Depende del sueldo, edad, comuna y cobertura buscada. Lo más razonable es comparar planes filtrados por precio y red.",
      },
      {
        question: "¿Conviene Isapre si casi no uso el sistema de salud?",
        answer:
          "Puede convenir si valoras acceso privado o urgencias, pero no siempre. Hay que revisar el costo mensual versus el uso esperado.",
      },
      {
        question: "¿Puedo cambiar mi plan después?",
        answer:
          "Sí, sujeto a condiciones contractuales y evaluación de la Isapre. Conviene revisar alternativas periódicamente.",
      },
    ],
  },
  "adulto-mayor": {
    slug: "adulto-mayor",
    title: "Planes de Isapre para adultos mayores",
    shortTitle: "Adultos mayores",
    eyebrow: "Decisión que requiere cuidado",
    description:
      "Una guía para revisar precio, continuidad, red, topes y coberturas relevantes antes de contratar, mantener o cambiar un plan.",
    metaTitle: "Planes de Isapre para Adultos Mayores | Guía de Comparación",
    metaDescription:
      "Compara planes de Isapre para adultos mayores con foco en red, topes, precio, continuidad y asesoría gratuita.",
    cta: "Revisar alternativas",
    icon: "senior",
    audience: "Personas mayores o familias que ayudan a revisar la continuidad de cobertura.",
    whatsappMessage: "Hola, quiero revisar alternativas de Isapre para un adulto mayor.",
    planQuery: {
      label: "planes con cobertura robusta",
      description:
        "Muestra inicial con cobertura hospitalaria y ambulatoria reforzada. En adultos mayores, la continuidad y evaluación de salud son clave.",
      compareHref: "/comparar/isapres?cobertura_hosp_min=70&cobertura_amb_min=60",
      params: { cobertura_hosp_min: 70, cobertura_amb_min: 60, sort: "precio_asc" },
    },
    bullets: [
      "Precio mensual total y variación esperada.",
      "Red de clínicas y especialistas ya utilizados.",
      "Topes, hospitalización y medicamentos o prestaciones frecuentes.",
      "Continuidad de atención antes de cualquier cambio.",
    ],
    comparePoints: [
      {
        title: "Continuidad",
        description: "Antes de cambiar, hay que entender qué se mantiene, qué se pierde y qué evalúa la nueva Isapre.",
      },
      {
        title: "Red actual",
        description: "La red donde ya existe historial médico puede ser más importante que un descuento puntual.",
      },
      {
        title: "Costo total",
        description: "Mira prima, copagos, topes y uso frecuente, no solo el precio base.",
      },
    ],
    faqs: [
      {
        question: "¿Conviene cambiar de Isapre en adulto mayor?",
        answer:
          "No siempre. Puede convenir revisar opciones, pero la decisión debe cuidar continuidad, preexistencias, red y costo total.",
      },
      {
        question: "¿La Isapre puede evaluar mi salud?",
        answer:
          "Sí, en procesos de contratación o cambio pueden existir declaraciones y evaluaciones según normativa y políticas de la Isapre.",
      },
      {
        question: "¿La asesoría tiene costo?",
        answer:
          "No. Puedes pedir una revisión gratuita para entender si realmente existe una alternativa conveniente.",
      },
    ],
  },
};

export const PROFILE_LANDING_SLUGS = Object.keys(PROFILE_LANDINGS);

export function getProfileLanding(slug: string) {
  return PROFILE_LANDINGS[slug] ?? null;
}
