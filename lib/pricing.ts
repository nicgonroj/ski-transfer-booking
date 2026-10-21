import {
  businessConfig,
  getServicio,
  getUpsell,
  nivelParaFecha,
  type Service,
} from '@/config/business';

export interface ResumenPrecio {
  servicioBaseCLP: number;
  upsellsCLP: number;
  subtotalCLP: number;
  multiplicador: number;
  nivel: string;
  totalCLP: number;
  prepagoCLP: number;
  pendienteCLP: number;
}

export interface InputCalculo {
  servicioSlug: string;
  fecha: string; // YYYY-MM-DD
  paxAdultos: number;
  paxNinos: number;
  upsellsIds: string[];
}

/** Devuelve el precio base del servicio según número de pax. */
function basePorPax(servicio: Service, paxTotal: number): number {
  if (servicio.slug === 'privado' && servicio.tramosPrivado) {
    const tramo = servicio.tramosPrivado.find(
      (t) => paxTotal >= t.desdePax && paxTotal <= t.hastaPax,
    );
    // Si excede el tramo máximo, usar el último (subcontratación cubre el resto).
    return tramo
      ? tramo.precioCLP
      : servicio.tramosPrivado[servicio.tramosPrivado.length - 1].precioCLP;
  }
  // Compartido / experiencia: precio por persona × pax (niños tarifa completa por ahora).
  return servicio.precioBaseCLP * paxTotal;
}

export function calcularPrecio(input: InputCalculo): ResumenPrecio {
  const servicio = getServicio(input.servicioSlug);
  if (!servicio) {
    throw new Error(`Servicio desconocido: ${input.servicioSlug}`);
  }

  const paxTotal = input.paxAdultos + input.paxNinos;
  const servicioBaseCLP = basePorPax(servicio, paxTotal);

  const upsellsCLP = input.upsellsIds.reduce((acc, id) => {
    const up = getUpsell(id);
    if (!up) return acc;
    // Los upsells de equipamento/ticket se cobran por persona; asiento delantero es flat.
    const factor = id === 'asiento_delantero' ? 1 : paxTotal;
    return acc + up.precioCLP * factor;
  }, 0);

  const subtotalCLP = servicioBaseCLP + upsellsCLP;

  const nivel = nivelParaFecha(input.fecha);
  const totalCLP = Math.round(subtotalCLP * nivel.multiplicador);
  const prepagoCLP = Math.round(
    (totalCLP * businessConfig.pagos.porcentajePrepago) / 100,
  );

  return {
    servicioBaseCLP,
    upsellsCLP,
    subtotalCLP,
    multiplicador: nivel.multiplicador,
    nivel: nivel.nivel,
    totalCLP,
    prepagoCLP,
    pendienteCLP: totalCLP - prepagoCLP,
  };
}

export function formatCLP(monto: number, locale: 'es' | 'pt' | 'en' = 'es'): string {
  const lookup = { es: 'es-CL', pt: 'pt-BR', en: 'en-US' } as const;
  return new Intl.NumberFormat(lookup[locale], {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto);
}
