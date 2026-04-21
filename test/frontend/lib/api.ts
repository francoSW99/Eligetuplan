const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Isapre {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  plan_count: number;
  ges_isapre_uf: number | null;
}

export interface Zona {
  id: number;
  nombre: string;
  plan_count: number;
}

export interface Cobertura {
  pct: number;
  clinicas: string[];
}

export interface Plan {
  id: string;
  codigo_plan: string | null;
  name: string;
  isapre_name: string;
  isapre_slug: string | null;
  logo_url: string | null;
  modalidad: string | null;
  price_uf: number;
  base_plan_uf: number | null;
  ges_isapre_uf: number | null;
  price_clp: number | null;
  hospital_coverage: number | null;
  ambulatory_coverage: number | null;
  hospitalaria: Cobertura[];
  ambulatoria: Cobertura[];
  con_parto: boolean | null;
  vigente: boolean;
  comercializable: boolean;
  tu7_activo: boolean;
  tipo_plan: string | null;
  id_zona: number | null;
  zona_nombre: string | null;
  pdf_plan: string | null;
  pdf_url: string | null;
  fecha_emision: string | null;
}

export interface PriceBucket {
  min_clp: number;
  max_clp: number;
  count: number;
}

export interface PlansResponse {
  items: Plan[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  price_min_clp: number | null;
  price_max_clp: number | null;
  price_histogram: PriceBucket[];
}

export interface PlansQuery {
  isapre?: string;
  modalidad?: string;
  zona?: string;
  precio_min_clp?: number;
  precio_max_clp?: number;
  cobertura_hosp_min?: number;
  cobertura_amb_min?: number;
  prestador?: string;
  con_parto?: boolean;
  tu7_activo?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

export async function getIsapres(): Promise<Isapre[]> {
  const res = await fetch(`${API_BASE}/api/v1/isapres`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getZonas(): Promise<Zona[]> {
  const res = await fetch(`${API_BASE}/api/v1/zonas`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getPlanes(q: PlansQuery = {}): Promise<PlansResponse> {
  const params = new URLSearchParams();
  if (q.isapre) params.set("isapre", q.isapre);
  if (q.modalidad) params.set("modalidad", q.modalidad);
  if (q.zona) params.set("zona", q.zona);
  if (q.precio_min_clp != null) params.set("precio_min_clp", String(q.precio_min_clp));
  if (q.precio_max_clp != null) params.set("precio_max_clp", String(q.precio_max_clp));
  if (q.cobertura_hosp_min != null) params.set("cobertura_hosp_min", String(q.cobertura_hosp_min));
  if (q.cobertura_amb_min != null) params.set("cobertura_amb_min", String(q.cobertura_amb_min));
  if (q.prestador) params.set("prestador", q.prestador);
  if (q.con_parto != null) params.set("con_parto", String(q.con_parto));
  if (q.tu7_activo != null) params.set("tu7_activo", String(q.tu7_activo));
  if (q.search) params.set("search", q.search);
  if (q.page) params.set("page", String(q.page));
  if (q.limit) params.set("limit", String(q.limit));
  if (q.sort) params.set("sort", q.sort);

  const res = await fetch(`${API_BASE}/api/v1/planes?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  return res.json();
}

export async function getPrestadores(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/v1/prestadores`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getPlan(id: string): Promise<Plan> {
  const res = await fetch(`${API_BASE}/api/v1/planes/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── Utils ────────────────────────────────────────────────────────────────────

export function formatCLP(n: number | null | undefined): string {
  if (n == null) return "—";
  return "$" + n.toLocaleString("es-CL");
}

export function formatUF(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("es-CL", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
