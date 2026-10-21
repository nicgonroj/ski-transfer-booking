import type { ReservaDB } from '@/lib/supabase/types';
import type { ResultadoLinkPago } from './index';

/**
 * TODO: integrar MercadoPago Checkout Pro.
 * Docs: https://www.mercadopago.cl/developers/es/docs/checkout-pro/landing
 *
 * Pasos sugeridos cuando exista cuenta:
 * 1) crear `preference` con back_urls (success/failure/pending), notification_url (webhook),
 *    external_reference = reserva.codigo
 * 2) devolver { url: preference.init_point, externalId: preference.id }
 * 3) implementar webhook en app/api/webhooks/pago/route.ts que actualice
 *    reserva.estado = 'confirmada' cuando status === 'approved'
 */
export async function crearLinkMercadoPago(_reserva: ReservaDB): Promise<ResultadoLinkPago> {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error(
      'MERCADOPAGO_ACCESS_TOKEN no definido. Completar .env.local o cambiar pagos.proveedor a "link_manual".',
    );
  }
  throw new Error('MercadoPago adapter pendiente de implementación. Ver lib/pagos/mercadopago.ts');
}
