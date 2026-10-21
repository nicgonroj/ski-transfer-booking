-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- - config, salidas: SELECT público (cualquiera puede consultar)
-- - reservas: INSERT anónimo (creación pública desde el wizard),
--             SELECT y UPDATE solo authenticated (admin)
-- - config UPDATE solo authenticated
-- ──────────────────────────────────────────────────────────────

alter table public.reservas enable row level security;
alter table public.salidas  enable row level security;
alter table public.config   enable row level security;

-- ─── config ───
drop policy if exists "config public read" on public.config;
create policy "config public read"
  on public.config for select
  using (true);

drop policy if exists "config admin write" on public.config;
create policy "config admin write"
  on public.config for all
  to authenticated
  using (true)
  with check (true);

-- ─── salidas ───
drop policy if exists "salidas public read" on public.salidas;
create policy "salidas public read"
  on public.salidas for select
  using (true);

drop policy if exists "salidas admin write" on public.salidas;
create policy "salidas admin write"
  on public.salidas for all
  to authenticated
  using (true)
  with check (true);

-- ─── reservas ───
drop policy if exists "reservas insert anon" on public.reservas;
create policy "reservas insert anon"
  on public.reservas for insert
  to anon, authenticated
  with check (true);

drop policy if exists "reservas admin read" on public.reservas;
create policy "reservas admin read"
  on public.reservas for select
  to authenticated
  using (true);

drop policy if exists "reservas admin write" on public.reservas;
create policy "reservas admin write"
  on public.reservas for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "reservas admin delete" on public.reservas;
create policy "reservas admin delete"
  on public.reservas for delete
  to authenticated
  using (true);
