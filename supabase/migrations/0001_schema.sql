-- ──────────────────────────────────────────────────────────────
-- Ski Transfer Booking — Schema inicial
-- Correr en orden: 0001 → 0002 → 0003 → 0004
-- ──────────────────────────────────────────────────────────────

-- gen_random_uuid() es nativo de Postgres 13+ (no requiere extensión).

-- ─── reservas ──────────────────────────────────────────────
create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  servicio_slug text not null,
  destino text not null,
  fecha date not null,
  salida_hora time not null,
  pax_adultos int not null check (pax_adultos >= 0),
  pax_ninos int not null default 0 check (pax_ninos >= 0),
  pickup_id text not null,
  pickup_direccion text,
  contacto jsonb not null,
  upsells jsonb not null default '[]'::jsonb,
  total_clp int not null check (total_clp >= 0),
  prepago_clp int not null check (prepago_clp >= 0),
  estado text not null default 'pendiente_pago'
    check (estado in ('pendiente_pago','pendiente_whatsapp','confirmada','cancelada','completada')),
  canal text not null default 'web'
    check (canal in ('web','whatsapp','ota','hotel','agencia')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Al menos un adulto por reserva
  constraint reservas_min_adultos check (pax_adultos >= 1)
);

create index if not exists reservas_fecha_idx on public.reservas (fecha);
create index if not exists reservas_estado_idx on public.reservas (estado);
create index if not exists reservas_canal_idx on public.reservas (canal);
create index if not exists reservas_codigo_idx on public.reservas (codigo);

-- ─── salidas ───────────────────────────────────────────────
create table if not exists public.salidas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  servicio_slug text not null,
  hora time not null,
  capacidad_total int not null check (capacidad_total >= 0),
  asientos_vendidos int not null default 0 check (asientos_vendidos >= 0),
  cerrada boolean not null default false,
  created_at timestamptz not null default now(),
  unique (fecha, servicio_slug, hora)
);

create index if not exists salidas_fecha_idx on public.salidas (fecha);

-- ─── config (espejo editable de business.ts) ───────────────
create table if not exists public.config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- updated_at trigger helper
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists reservas_set_updated_at on public.reservas;
create trigger reservas_set_updated_at
  before update on public.reservas
  for each row execute function public.tg_set_updated_at();

drop trigger if exists config_set_updated_at on public.config;
create trigger config_set_updated_at
  before update on public.config
  for each row execute function public.tg_set_updated_at();
