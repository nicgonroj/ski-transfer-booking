import type { ReservaDB } from '@/lib/supabase/types';
import type { ResultadoLinkPago } from './index';

/**
 * TODO: integrar Flow.cl
 * Docs: https://www.flow.cl/docs/api.html
 *
 * Pasos sugeridos cuando exista cuenta:
 * 1) firmar params con HMAC SHA256 usando FLOW_SECRET_KEY
 * 2) POST /payment/create con commerceOrder = reserva.codigo, amount = reserva.prepago_clp
 * 3) devolver { url: response.url + '?token=' + response.token, externalId: response.token }
 * 4) implementar webhook en app/api/webhooks/pago/route.ts
 */
export async function crearLinkFlow(_reserva: ReservaDB): Promise<ResultadoLinkPago> {
  if (!process.env.FLOW_API_KEY || !process.env.FLOW_SECRET_KEY) {
    throw new Error(
      'FLOW_API_KEY / FLOW_SECRET_KEY no definidos. Completar .env.local o cambiar pagos.proveedor a "link_manual".',
    );
  }
  throw new Error('Flow adapter pendiente de implementación. Ver lib/pagos/flow.ts');
}
