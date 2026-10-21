-- ──────────────────────────────────────────────────────────────
-- Seed inicial de la tabla `config` (valores FICTICIOS de demo).
-- Este SQL es solo un esqueleto. Para sincronizar con business.ts,
-- copiar los valores actuales del archivo TS al `value jsonb` aquí
-- o usar el panel /admin/configuracion para editarlos en vivo.
--
-- En modo mock (sin Supabase) este archivo es irrelevante: el sitio
-- lee directamente de config/business.ts.
-- ──────────────────────────────────────────────────────────────

insert into public.config (key, value) values
  ('identidad', '{
    "nombreComercial": "Andes Transfer Demo",
    "prefijoCodigo": "AT",
    "razonSocial": "Andes Transfer Demo (empresa ficticia)",
    "rut": "",
    "whatsapp": "+15555550100",
    "instagram": "@andestransfer.demo",
    "email": "reservas@example.com",
    "sitioWeb": "https://example.com"
  }'::jsonb),
  ('pagos', '{
    "proveedor": "link_manual",
    "porcentajePrepago": 50,
    "linkManualURL": "https://example.com/pagar"
  }'::jsonb),
  ('capacidad', '{
    "asientosPorVan": 12,
    "vansPropias": 2,
    "subcontratacionHabilitada": true
  }'::jsonb)
on conflict (key) do nothing;
