import { businessConfig, type ProveedorPago } from '@/config/business';
import type { ReservaDB } from '@/lib/supabase/types';
import { crearLinkManual } from './manual';
import { crearLinkMercadoPago } from './mercadopago';
import { crearLinkFlow } from './flow';

export interface ResultadoLinkPago {
  url: string;
  externalId?: string;
}

export async function crearLinkPago(reserva: ReservaDB): Promise<ResultadoLinkPago> {
  const proveedor: ProveedorPago = businessConfig.pagos.proveedor;
  switch (proveedor) {
    case 'link_manual':
      return crearLinkManual(reserva);
    case 'mercadopago':
      return crearLinkMercadoPago(reserva);
    case 'flow':
      return crearLinkFlow(reserva);
    default:
      throw new Error(`Proveedor de pago no soportado: ${proveedor}`);
  }
}
