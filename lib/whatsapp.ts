import { businessConfig, getServicio, getPickup, destinoLabel, type Locale } from '@/config/business';
import { formatCLP } from './pricing';

export interface PayloadWhatsApp {
  codigo?: string;
  servicioSlug: string;
  destino: string;
  fecha: string;
  paxAdultos: number;
  paxNinos: number;
  pickupId: string;
  pickupDireccion?: string;
  contactoNombre: string;
  totalCLP: number;
  upsellsIds: string[];
  locale: Locale;
}

function encabezado(locale: Locale): string {
  const marca = businessConfig.identidad.nombreComercial;
  const textos: Record<Locale, string> = {
    es: `Hola! Quiero confirmar mi reserva con ${marca}.`,
    pt: `Olá! Quero confirmar minha reserva com ${marca}.`,
    en: `Hi! I want to confirm my booking with ${marca}.`,
  };
  return textos[locale];
}

const ETIQUETAS: Record<Locale, Record<string, string>> = {
  es: {
    codigo: 'Código',
    servicio: 'Servicio',
    destino: 'Destino',
    fecha: 'Fecha',
    pax: 'Pasajeros',
    adultos: 'adultos',
    ninos: 'niños',
    pickup: 'Punto de pickup',
    direccion: 'Dirección',
    nombre: 'Nombre',
    total: 'Total',
    extras: 'Extras',
  },
  pt: {
    codigo: 'Código',
    servicio: 'Serviço',
    destino: 'Destino',
    fecha: 'Data',
    pax: 'Passageiros',
    adultos: 'adultos',
    ninos: 'crianças',
    pickup: 'Ponto de pickup',
    direccion: 'Endereço',
    nombre: 'Nome',
    total: 'Total',
    extras: 'Extras',
  },
  en: {
    codigo: 'Code',
    servicio: 'Service',
    destino: 'Destination',
    fecha: 'Date',
    pax: 'Passengers',
    adultos: 'adults',
    ninos: 'children',
    pickup: 'Pickup point',
    direccion: 'Address',
    nombre: 'Name',
    total: 'Total',
    extras: 'Extras',
  },
};

export function construirMensajeReserva(p: PayloadWhatsApp): string {
  const L = ETIQUETAS[p.locale];
  const servicio = getServicio(p.servicioSlug);
  const pickup = getPickup(p.pickupId);
  const lines = [
    encabezado(p.locale),
    '',
  ];

  if (p.codigo) lines.push(`*${L.codigo}:* ${p.codigo}`);
  if (servicio) lines.push(`*${L.servicio}:* ${servicio.nombre[p.locale]}`);
  lines.push(`*${L.destino}:* ${p.destino}`);
  lines.push(`*${L.fecha}:* ${p.fecha}`);
  lines.push(
    `*${L.pax}:* ${p.paxAdultos} ${L.adultos}` +
      (p.paxNinos > 0 ? ` + ${p.paxNinos} ${L.ninos}` : ''),
  );
  if (pickup) {
    const direccionExtra = pickup.requiereDireccion && p.pickupDireccion
      ? ` (${L.direccion}: ${p.pickupDireccion})`
      : '';
    lines.push(`*${L.pickup}:* ${pickup.nombre}${direccionExtra}`);
  }
  if (p.upsellsIds.length > 0) {
    lines.push(`*${L.extras}:* ${p.upsellsIds.join(', ')}`);
  }
  lines.push(`*${L.nombre}:* ${p.contactoNombre}`);
  // Solo incluimos total si hay un precio real (>0). Si no, el operador cotiza por WhatsApp.
  if (p.totalCLP > 0) lines.push(`*${L.total}:* ${formatCLP(p.totalCLP, p.locale)}`);

  return lines.join('\n');
}

const WHATSAPP_SEND_URL = 'https://api.whatsapp.com/send';

/**
 * Construye el deep link "click to chat" de WhatsApp hacia un número cualquiera.
 * Quita signos del número (E.164 → solo dígitos), como requiere la API.
 */
export function deepLinkWhatsAppA(numeroE164: string, mensaje: string): string {
  const numero = numeroE164.replace(/[^\d]/g, '');
  return `${WHATSAPP_SEND_URL}?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
}

/** Deep link hacia el WhatsApp del operador (identidad.whatsapp). */
export function deepLinkWhatsApp(mensaje: string): string {
  return deepLinkWhatsAppA(businessConfig.identidad.whatsapp, mensaje);
}

/** Versión genérica para botones (sin payload de reserva). */
export function deepLinkWhatsAppLibre(locale: Locale): string {
  const mensajes: Record<Locale, string> = {
    es: 'Hola! Tengo una consulta sobre sus traslados a la nieve.',
    pt: 'Olá! Tenho uma dúvida sobre seus traslados à neve.',
    en: 'Hi! I have a question about your snow transfers.',
  };
  return deepLinkWhatsApp(mensajes[locale]);
}

// Re-export para conveniencia en componentes
export { destinoLabel };
