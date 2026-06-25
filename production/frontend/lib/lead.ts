// Seguridad anti-bot para el endpoint de leads (Google Apps Script público).
//
// El endpoint es público y sin auth: cualquier bot que descubra la URL puede POSTear
// basura directo (caso real "CSRF_TEST"). Defensa en 2 capas, validadas en el doPost
// del Apps Script (ver snippet entregado):
//
//  1. TOKEN compartido: la web manda `_token` en cada POST. El Apps Script rechaza lo
//     que no lo traiga / no coincida. Frena a los escáneres que no conocen el valor.
//     NO es un secreto fuerte (viaja en el bundle), pero sube muchísimo la barra contra
//     bots automáticos. Para rotarlo: cambiar acá Y en el Apps Script (mismo valor).
//  2. HONEYPOT: un campo oculto (`_hp`) que un humano deja vacío. Si llega con valor,
//     es un bot que rellenó todo → el Apps Script lo rechaza.
//
// IMPORTANTE: este valor debe coincidir EXACTO con LEAD_TOKEN en el Apps Script.
export const LEAD_FORM_TOKEN = 'etp_lead_2026_a7Kq9ZpX3mTvB6';

// Nombre del campo honeypot en el payload (debe coincidir con la validación del Apps Script).
export const LEAD_HONEYPOT_FIELD = '_hp';
