"""
Tablas de normalización para datos oficiales SIS.

El archivo de Planes de Salud usa códigos numéricos para identificar Isapres.
Este módulo mapea esos códigos a nombres canónicos y slugs usados en nuestra BD.
"""

# Mapa: codigo_sis (str) -> (nombre_canónico, slug, logo_filename)
ISAPRE_CODE_MAP: dict[str, tuple[str, str, str]] = {
    "78":  ("Cruz Blanca",        "cruzblanca",   "logo_cruzblanca.png"),
    "67":  ("Colmena Golden Cross","colmena",      "logos-col.png"),
    "80":  ("Banmédica",          "banmedica",    "banmedica-logo.png"),
    "81":  ("Nueva Más Vida",     "nuevamasvida", "Logo-NMV.png"),
    "99":  ("Consalud",           "consalud",     "logo_consalud.png"),
    "107": ("Vida Tres",          "vidatres",     "vida-tres.png"),
    "108": ("Isapre Esencial",    "esencial",     ""),
    "63":  ("San Lorenzo",        "sanlorenzo",   ""),
    "76":  ("BanSalud",           "bansalud",     ""),
    "94":  ("Isapre Colectiva",   "colectiva",    ""),
}

# Normalización de modalidad SIS → valor canónico en nuestra BD
MODALIDAD_MAP: dict[str, str] = {
    "libre elección":      "Libre Elección",
    "libre eleccion":      "Libre Elección",
    "prestador preferente": "Preferente",
    "preferente":          "Preferente",
    "plan cerrado":        "Cerrado",
    "cerrado":             "Cerrado",
}


def normalize_isapre(codigo_sis: str) -> tuple[str, str, str]:
    """
    Devuelve (nombre, slug, logo_filename) para un código de Isapre SIS.
    Si el código no está en el mapa, genera valores a partir del código.
    """
    entry = ISAPRE_CODE_MAP.get(str(codigo_sis).strip())
    if entry:
        return entry
    # Fallback para códigos desconocidos
    slug = f"isapre_{codigo_sis}"
    return (f"Isapre {codigo_sis}", slug, "")


def normalize_modalidad(raw: str) -> str:
    """Normaliza el campo modalidad del SIS a valor canónico."""
    return MODALIDAD_MAP.get(raw.strip().lower(), raw.strip())


# Mapa nombre isapre tu7 → slug de nuestra BD
TU7_ISAPRE_SLUG_MAP: dict[str, str] = {
    "consalud":      "consalud",
    "colmena":       "colmena",
    "banmedica":     "banmedica",
    "cruz blanca":   "cruzblanca",
    "nueva masvida": "nuevamasvida",
    "vidatres":      "vidatres",
    "vida tres":     "vidatres",
    "esencial":      "esencial",
}


def tu7_isapre_slug(nombre_isapre: str) -> str | None:
    """Mapea NOMBRE_ISAPRE de tu7 al slug canónico. None si no se encuentra."""
    return TU7_ISAPRE_SLUG_MAP.get(nombre_isapre.strip().lower())


def is_con_parto(tipo_parto: str) -> bool:
    """
    col[12] del archivo SIS indica el tipo de cobertura de parto.
    'Cobertura general...' = con parto completo = True
    'Cobertura reducida...' = parto reducido o sin parto = False
    """
    return tipo_parto.strip().lower().startswith("cobertura general")
