-- ──────────────────────────────────────────────────────────────
-- Trigger: recalcular asientos_vendidos en salidas cuando cambia
-- una reserva. Cuenta reservas con estado 'confirmada' o 'pendiente_pago'.
-- Si no existe la fila de salida correspondiente, se crea con
-- capacidad por defecto = asientosPorVan × vansPropias (se puede ajustar
-- desde admin después).
-- ──────────────────────────────────────────────────────────────

create or replace function public.recalcular_asientos(p_fecha date, p_servicio text, p_hora time)
returns void language plpgsql as $$
declare
  v_vendidos int;
begin
  select coalesce(sum(pax_adultos + pax_ninos), 0) into v_vendidos
  from public.reservas
  where fecha = p_fecha
    and servicio_slug = p_servicio
    and salida_hora = p_hora
    and estado in ('confirmada','pendiente_pago');

  -- Upsert sobre salidas. Capacidad default: 24 (= 12 asientos × 2 vans de la config demo; se ajusta desde admin).
  insert into public.salidas (fecha, servicio_slug, hora, capacidad_total, asientos_vendidos)
  values (p_fecha, p_servicio, p_hora, 24, v_vendidos)
  on conflict (fecha, servicio_slug, hora)
  do update set asientos_vendidos = v_vendidos;
end $$;

create or replace function public.tg_reservas_salidas()
returns trigger language plpgsql as $$
begin
  if tg_op in ('INSERT','UPDATE') then
    perform public.recalcular_asientos(new.fecha, new.servicio_slug, new.salida_hora);
  end if;
  if tg_op in ('UPDATE','DELETE') then
    -- Si cambió la fecha/servicio/hora también hay que actualizar la salida anterior.
    if tg_op = 'UPDATE' and (old.fecha <> new.fecha
                          or old.servicio_slug <> new.servicio_slug
                          or old.salida_hora <> new.salida_hora) then
      perform public.recalcular_asientos(old.fecha, old.servicio_slug, old.salida_hora);
    end if;
    if tg_op = 'DELETE' then
      perform public.recalcular_asientos(old.fecha, old.servicio_slug, old.salida_hora);
    end if;
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists reservas_salidas_sync on public.reservas;
create trigger reservas_salidas_sync
  after insert or update or delete on public.reservas
  for each row execute function public.tg_reservas_salidas();
