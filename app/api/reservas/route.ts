import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generarCodigoReserva } from '@/lib/codigo-reserva';
import { getServerSupabase, getServiceRoleSupabase, supabaseConfigured } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mock-store';
import { crearLinkPago } from '@/lib/pagos';
import type { NuevaReserva, ReservaDB } from '@/lib/supabase/types';
import { businessConfig, getPickup, getServicio, type Destino } from '@/config/business';
import { calcularPrecio } from '@/lib/pricing';
import { cookies } from 'next/headers';

const ContactoZ = z.object({
  nombre: z.string().min(1),
  whatsapp: z.string().regex(/^\+\d{10,15}$/),
  email: z.string().email(),
  idioma: z.enum(['es', 'pt', 'en']),
  nacionalidad: z.string().optional(),
});

const NuevaReservaZ = z.object({
  servicio_slug: z.string().min(1),
  destino: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pax_adultos: z.number().int().min(1).max(15),
  pax_ninos: z.number().int().min(0).max(15),
  pickup_id: z.string().min(1),
  pickup_direccion: z.string().nullable().optional(),
  contacto: ContactoZ,
  upsells: z.array(z.string()).default([]),
  // Los montos enviados por el cliente se aceptan solo por compatibilidad y se
  // IGNORAN: el servidor recalcula el precio desde config/business.ts.
  total_clp: z.number().int().min(0).optional(),
  prepago_clp: z.number().int().min(0).optional(),
  estado: z.enum(['pendiente_pago', 'pendiente_whatsapp']),
  canal: z.enum(['web', 'whatsapp', 'ota', 'hotel', 'agencia']).default('web'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = NuevaReservaZ.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validación', detalles: parsed.error.format() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // ─── Validación de negocio contra la config (no confiar en el cliente) ───
  const servicio = getServicio(data.servicio_slug);
  if (!servicio) {
    return NextResponse.json({ error: 'Servicio desconocido' }, { status: 400 });
  }
  if (!servicio.destinos.includes(data.destino as Destino)) {
    return NextResponse.json({ error: 'Destino no disponible para el servicio' }, { status: 400 });
  }
  const pickup = getPickup(data.pickup_id);
  if (!pickup) {
    return NextResponse.json({ error: 'Pickup desconocido' }, { status: 400 });
  }
  if (pickup.requiereDireccion && !data.pickup_direccion?.trim()) {
    return NextResponse.json({ error: 'Dirección de pickup requerida' }, { status: 400 });
  }
  const upsellInvalido = data.upsells.find((id) => !servicio.upsells.includes(id));
  if (upsellInvalido) {
    return NextResponse.json({ error: `Extra no disponible: ${upsellInvalido}` }, { status: 400 });
  }

  // ─── Precio calculado en servidor ───
  const precio = calcularPrecio({
    servicioSlug: data.servicio_slug,
    fecha: data.fecha,
    paxAdultos: data.pax_adultos,
    paxNinos: data.pax_ninos,
    upsellsIds: data.upsells,
  });
  const { mostrarPrecios, pagoOnlineHabilitado } = businessConfig.flags;
  // Si los precios no están publicados, se guarda 0 y el operador cotiza por WhatsApp.
  const totalCLP = mostrarPrecios ? precio.totalCLP : 0;
  const prepagoCLP = mostrarPrecios && pagoOnlineHabilitado ? precio.prepagoCLP : 0;
  // Sin pago online, ninguna reserva puede quedar "pendiente_pago".
  const estado = pagoOnlineHabilitado ? data.estado : 'pendiente_whatsapp';

  const codigo = generarCodigoReserva(data.fecha);
  const salida = businessConfig.horariosPorServicio[data.servicio_slug]?.[0]?.salidaHora ?? '07:30';

  const nueva: NuevaReserva = {
    codigo,
    servicio_slug: data.servicio_slug,
    destino: data.destino,
    fecha: data.fecha,
    salida_hora: salida + ':00',
    pax_adultos: data.pax_adultos,
    pax_ninos: data.pax_ninos,
    pickup_id: data.pickup_id,
    pickup_direccion: data.pickup_direccion ?? null,
    contacto: data.contacto,
    upsells: data.upsells,
    total_clp: totalCLP,
    prepago_clp: prepagoCLP,
    estado,
    canal: data.canal,
    notas: null,
  };

  let reserva: ReservaDB;

  if (supabaseConfigured) {
    // Usamos service-role para insertar saltándonos RLS sin exponer al cliente.
    const supabase = getServiceRoleSupabase() ?? getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
    }
    const { data: inserted, error } = await supabase
      .from('reservas')
      .insert(nueva)
      .select('*')
      .single();

    if (error || !inserted) {
      console.error('[api/reservas] insert error', error);
      return NextResponse.json({ error: 'No se pudo crear la reserva' }, { status: 500 });
    }
    reserva = inserted as ReservaDB;
  } else {
    console.warn('[api/reservas] MODO MOCK: persistiendo en memoria del proceso.');
    reserva = await mockStore.insertReserva(nueva);
  }

  // Si el canal es 'web' (pagar online), generar link de pago
  let pagoUrl: string | undefined;
  if (estado === 'pendiente_pago') {
    try {
      const link = await crearLinkPago(reserva);
      pagoUrl = link.url;
    } catch (e) {
      console.warn('[api/reservas] generación de pago falló, devolvemos sin URL', e);
    }
  }

  return NextResponse.json({
    ok: true,
    codigo: reserva.codigo,
    id: reserva.id,
    totalCLP,
    prepagoCLP,
    pagoUrl,
  });
}

const PatchZ = z.object({
  id: z.string().uuid(),
  estado: z.enum([
    'pendiente_pago',
    'pendiente_whatsapp',
    'confirmada',
    'cancelada',
    'completada',
  ]),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = PatchZ.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validación' }, { status: 400 });
  }

  if (supabaseConfigured) {
    const supabase = getServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
    // Verifica auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { error } = await supabase
      .from('reservas')
      .update({ estado: parsed.data.estado })
      .eq('id', parsed.data.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // Modo mock: exige la cookie que deja el login de demo.
    if (!cookies().get('mock_admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    await mockStore.updateReservaEstado(parsed.data.id, parsed.data.estado);
  }
  return NextResponse.json({ ok: true });
}
