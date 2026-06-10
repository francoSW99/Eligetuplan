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

export const track = {
  whatsappClick: (source: LeadSource) =>
    sendGAEvent("event", "whatsapp_click", { source, lead_value: 1 }),

  asesorClick: (source: LeadSource) =>
    sendGAEvent("event", "asesor_click", { source }),

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

  formSubmit: (formType: "asesor" | "buscar" | "newsletter") =>
    sendGAEvent("event", "form_submit", { form_type: formType, lead_value: 1 }),
};
