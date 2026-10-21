import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook de pagos — stub.
 *
 * Cuando MercadoPago o Flow notifique un pago aprobado, este endpoint debe:
 * 1) verificar la firma del request (HMAC en Flow, IP/topic en MP)
 * 2) extraer external_reference (= código de reserva)
 * 3) actualizar reserva.estado = 'confirmada'
 *
 * Por ahora solo loguea y devuelve 200 para no bloquear configuración del webhook.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  console.log('[webhook/pago] payload recibido (longitud)', body.length);
  // TODO: validar firma y actualizar reserva
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'webhook activo' });
}
