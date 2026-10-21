import { businessConfig } from '@/config/business';
import type { ReservaDB } from '@/lib/supabase/types';
import type { ResultadoLinkPago } from './index';

export async function crearLinkManual(reserva: ReservaDB): Promise<ResultadoLinkPago> {
  const base = businessConfig.pagos.linkManualURL;
  if (!base) {
    throw new Error('linkManualURL no configurada en config/business.ts');
  }
  const sep = base.includes('?') ? '&' : '?';
  return {
    url: `${base}${sep}codigo=${encodeURIComponent(reserva.codigo)}&monto=${reserva.prepago_clp}`,
    externalId: reserva.codigo,
  };
}
