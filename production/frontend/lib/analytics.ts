import { sendGAEvent } from "@next/third-parties/google";

export type LeadSource =
  | "header"
  | "hero_cta"
  | "calc_results"
  | "comparar"
  | "tu_mejor_plan"
  | "buscar"
  | "faq"
  | "footer"
  | "fab"
  | "asesor_isapre"
  | "cambiar_isapre"
  | "fonasa_isapre";

export type SeoLandingSource =
  | "seo_landing"
  | "guide_landing"
  | "seo_hub"
  | "profile_landing"
  | "isapre_landing"
  | "seo_panel";

type SeoLandingClickParams = {
  source: SeoLandingSource;
  target: string;
  label: string;
  eventCallback?: () => void;
};

type GtagEventParams = {
  source?: string;
  target?: string;
  label?: string;
  transport_type?: "beacon";
  event_callback?: () => void;
  event_timeout?: number;
};

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: GtagEventParams) => void;
  }
}

function sendSeoLandingClick({ source, target, label, eventCallback }: SeoLandingClickParams) {
  const params = { source, target, label };

  if (typeof window === "undefined") {
    sendGAEvent("event", "seo_landing_click", params);
    eventCallback?.();
    return;
  }

  if (typeof window.gtag === "function") {
    let completed = false;
    const done = () => {
      if (completed) return;
      completed = true;
      eventCallback?.();
    };

    window.gtag("event", "seo_landing_click", {
      ...params,
      transport_type: "beacon",
      event_callback: done,
      event_timeout: 500,
    });

    if (eventCallback) window.setTimeout(done, 700);
    return;
  }

  sendGAEvent("event", "seo_landing_click", params);
  if (eventCallback) window.setTimeout(eventCallback, 250);
}

export const track = {
  whatsappClick: (source: LeadSource) =>
    sendGAEvent("event", "whatsapp_click", { source, lead_value: 1 }),

  asesorClick: (source: LeadSource) =>
    sendGAEvent("event", "asesor_click", { source }),

  leadFormOpen: (source: LeadSource) =>
    sendGAEvent("event", "lead_form_open", { source }),

  leadFormClose: (source: LeadSource) =>
    sendGAEvent("event", "lead_form_close", { source }),

  calcUsed: (sueldoBruto: number, planesDisponibles: number) =>
    sendGAEvent("event", "calc_7_used", {
      sueldo_bruto_clp: sueldoBruto,
      planes_disponibles: planesDisponibles,
    }),

  iaClick: (source: LeadSource) =>
    sendGAEvent("event", "ia_click", { source }),

  iaRecomendadorStart: () => sendGAEvent("event", "ia_recomendador_start"),

  iaRecomendadorComplete: (planRecomendado: string) =>
    sendGAEvent("event", "ia_recomendador_complete", {
      plan_recomendado: planRecomendado,
    }),

  filtroIsapre: (isapre: string) =>
    sendGAEvent("event", "filtro_isapre", { isapre }),

  comparadorClick: (source: LeadSource) =>
    sendGAEvent("event", "comparador_click", { source }),

  seoLandingClick: sendSeoLandingClick,

  formSubmit: (formType: "asesor" | "buscar" | "newsletter") =>
    sendGAEvent("event", "form_submit", { form_type: formType, lead_value: 1 }),
};
