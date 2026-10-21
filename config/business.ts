/**
 * ──────────────────────────────────────────────────────────────────────────
 * CONFIG-DRIVEN — Única fuente de verdad del negocio.
 *
 * Toda la información operativa del operador vive aquí: identidad, servicios,
 * precios, temporadas, pickups, horarios, capacidad, pagos y políticas.
 * Los componentes del sitio leen SIEMPRE desde este archivo (o desde la tabla
 * `config` de Supabase, que es su espejo editable sin deploy).
 *
 * VERSIÓN DEMO: la marca "Andes Transfer Demo", los contactos, precios,
 * temporadas y pickups son FICTICIOS. Para usar la plataforma con un operador
 * real basta con reemplazar los valores de `businessConfig`.
 * ──────────────────────────────────────────────────────────────────────────
 */

// ──────────────────────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────────────────────

export type Locale = 'es' | 'pt' | 'en';

export type I18nText = Record<Locale, string>;

export type Destino =
  | 'el_colorado'
  | 'farellones'
  | 'la_parva'
  | 'valle_nevado';

export type NivelTarifa = 'baja' | 'peak' | 'super_peak';

export type ProveedorPago = 'mercadopago' | 'flow' | 'link_manual';

export type CanalReserva = 'web' | 'whatsapp' | 'ota' | 'hotel' | 'agencia';

export type EstadoReserva =
  | 'pendiente_pago'
  | 'pendiente_whatsapp'
  | 'confirmada'
  | 'cancelada'
  | 'completada';

export interface Identidad {
  nombreComercial: string;
  /** Prefijo de los códigos de reserva (ej. 'AT' → AT-0728-A3F). */
  prefijoCodigo: string;
  razonSocial: string;
  rut: string;
  whatsapp: string; // formato E.164: +<código país><número>
  instagram: string; // con @
  email: string;
  sitioWeb: string;
  colores: {
    primary: string;
    primaryDark: string;
    snow: string;
    ink: string;
  };
}

export interface Pickup {
  id: string;
  nombre: string;
  comuna: string;
  horaEstimada: string; // HH:MM
  coordenadas?: { lat: number; lng: number };
  /** Si true, el wizard pide al pasajero ingresar dirección. */
  requiereDireccion: boolean;
}

export interface Horario {
  /** 0=domingo, 6=sábado. Vacío = todos los días. */
  diasSemana: number[];
  salidaHora: string; // HH:MM AM (restricción G-21: subida AM)
  retornoHora: string; // HH:MM PM (restricción G-21: bajada PM)
}

export interface TramoPrecioPrivado {
  desdePax: number;
  hastaPax: number;
  precioCLP: number;
}

export interface Upsell {
  id: string;
  nombre: I18nText;
  descripcion: I18nText;
  precioCLP: number;
}

export interface Service {
  slug: 'compartido' | 'privado' | 'experiencia';
  nombre: I18nText;
  descripcionCorta: I18nText;
  descripcionLarga: I18nText;
  incluye: I18nText[];
  noIncluye: I18nText[];
  /** En minutos. Solo informativo. */
  duracionMin: number;
  /** Precio base por persona (compartido/experiencia) o por van (privado base = tramo 1-4). */
  precioBaseCLP: number;
  /** Solo para servicio `privado`: rangos de precio por número de pax. */
  tramosPrivado?: TramoPrecioPrivado[];
  destinos: Destino[];
  upsells: string[]; // ids de Upsell habilitados
  imagenPlaceholder: string; // ruta a /public/placeholders
}

export interface NivelTarifaConfig {
  nivel: NivelTarifa;
  multiplicador: number; // base = 1.0
  /** Rangos de fechas (YYYY-MM-DD inclusive). */
  rangos: { desde: string; hasta: string }[];
  /** Color usado en el calendario del wizard. */
  color: string;
}

export interface Capacidad {
  asientosPorVan: number;
  vansPropias: number;
  /** Si true, se pueden vender salidas más allá de vansPropias × asientosPorVan. */
  subcontratacionHabilitada: boolean;
}

export interface PagosConfig {
  proveedor: ProveedorPago;
  /** % del total que se cobra como prepago en línea (0-100). */
  porcentajePrepago: number;
  /** Solo si proveedor = 'link_manual'. Recibe ?codigo=<CODIGO>&monto=<CLP> en la URL. */
  linkManualURL?: string;
  /** Texto que aparece junto al botón de pago, por idioma. */
  textoPago: I18nText;
}

export interface PoliticaCancelacion {
  textoCorto: I18nText;
  textoLargo: I18nText;
  /** Para mostrar en checkout y respuestas de WhatsApp. */
  horasMinimasParaReembolso: number;
}

/** Banderas globales que controlan qué se muestra/activa en el sitio. */
export interface Flags {
  /** Si false, NO se muestran precios en ningún lado (cards, detalle, wizard).
   *  Poner true cuando los precios estén confirmados. */
  mostrarPrecios: boolean;
  /** Si false, se oculta el botón de pago online; la reserva se cierra por WhatsApp. */
  pagoOnlineHabilitado: boolean;
}

export interface BusinessConfig {
  flags: Flags;
  identidad: Identidad;
  servicios: Service[];
  niveles: NivelTarifaConfig[];
  pickups: Pickup[];
  horariosPorServicio: Record<string, Horario[]>;
  capacidad: Capacidad;
  pagos: PagosConfig;
  upsells: Upsell[];
  politicaCancelacion: PoliticaCancelacion;
}

// ──────────────────────────────────────────────────────────────
// VALORES PLACEHOLDER — ajustar antes de producción
// ──────────────────────────────────────────────────────────────

export const businessConfig: BusinessConfig = {
  flags: {
    mostrarPrecios: true, // en la demo se muestran precios ficticios
    pagoOnlineHabilitado: false, // la reserva se confirma por WhatsApp (sin pago online)
  },
  identidad: {
    nombreComercial: 'Andes Transfer Demo',
    prefijoCodigo: 'AT',
    razonSocial: 'Andes Transfer Demo (empresa ficticia)',
    rut: '', // vacío en la demo; el footer lo oculta
    whatsapp: '+15555550100', // número ficticio (rango 555-01xx reservado para ficción)
    instagram: '@andestransfer.demo',
    email: 'reservas@example.com',
    sitioWeb: 'https://example.com',
    colores: {
      primary: '#1B6CA8',
      primaryDark: '#155080',
      snow: '#F7FAFC',
      ink: '#0F1E2E',
    },
  },

  servicios: [
    {
      slug: 'compartido',
      nombre: {
        es: 'Transfer compartido',
        pt: 'Transfer compartilhado',
        en: 'Shared transfer',
      },
      descripcionCorta: {
        es: 'Viaja a la montaña con otros pasajeros. Salida en horario fijo desde puntos clave de Santiago.',
        pt: 'Suba à neve com outros passageiros. Saída em horário fixo desde pontos-chave de Santiago.',
        en: 'Head to the snow with other passengers. Fixed-schedule departures from key points in Santiago.',
      },
      descripcionLarga: {
        es: 'Servicio ideal para personas y grupos pequeños. Chofer experto en montaña, asistencia con equipo y pickup en hoteles o puntos centrales.',
        pt: 'Serviço ideal para indivíduos e grupos pequenos. Motorista especialista em montanha, ajuda com equipamento e pickup em hotéis ou pontos centrais.',
        en: 'Best for solo travelers and small groups. Mountain-experienced driver, gear assistance and pickup at hotels or central points.',
      },
      incluye: [
        { es: 'Traslado ida y vuelta', pt: 'Translado ida e volta', en: 'Round-trip transfer' },
        { es: 'Chofer con experiencia en montaña', pt: 'Motorista com experiência em montanha', en: 'Mountain-experienced driver' },
        { es: 'Cadenas y seguro vehicular', pt: 'Correntes e seguro veicular', en: 'Snow chains and vehicle insurance' },
      ],
      noIncluye: [
        { es: 'Ticket centro de ski', pt: 'Ticket centro de esqui', en: 'Ski center pass' },
        { es: 'Arriendo de equipo', pt: 'Aluguel de equipamento', en: 'Gear rental' },
        { es: 'Alimentación', pt: 'Alimentação', en: 'Food and beverages' },
      ],
      duracionMin: 540,
      precioBaseCLP: 20000, // DEMO: precio ficticio por persona
      destinos: ['el_colorado', 'farellones', 'la_parva', 'valle_nevado'],
      upsells: ['equipo_nieve', 'ticket_centro', 'asiento_delantero'],
      imagenPlaceholder: '/placeholders/servicio-compartido.svg',
    },
    {
      slug: 'privado',
      nombre: {
        es: 'Van privada',
        pt: 'Van privativa',
        en: 'Private van',
      },
      descripcionCorta: {
        es: 'Van exclusiva para tu grupo. Horario flexible y pickup donde lo necesites.',
        pt: 'Van exclusiva para seu grupo. Horário flexível e pickup onde precisar.',
        en: 'Exclusive van for your group. Flexible schedule and pickup wherever you need.',
      },
      descripcionLarga: {
        es: 'La opción más cómoda para grupos. Sin compartir con desconocidos, paradas a tu medida y horario coordinado contigo.',
        pt: 'A opção mais confortável para grupos. Sem compartilhar com desconhecidos, paradas sob medida e horário coordenado com você.',
        en: 'The most comfortable choice for groups. No sharing with strangers, custom stops and schedule coordinated with you.',
      },
      incluye: [
        { es: 'Van privada hasta 12 pax', pt: 'Van privativa até 12 pax', en: 'Private van up to 12 pax' },
        { es: 'Pickup y dejada en dirección elegida', pt: 'Pickup e drop-off no endereço escolhido', en: 'Pickup and drop-off at chosen address' },
        { es: 'Chofer dedicado todo el día', pt: 'Motorista dedicado o dia todo', en: 'Dedicated driver all day' },
      ],
      noIncluye: [
        { es: 'Ticket centro de ski', pt: 'Ticket centro de esqui', en: 'Ski center pass' },
        { es: 'Arriendo de equipo', pt: 'Aluguel de equipamento', en: 'Gear rental' },
      ],
      duracionMin: 540,
      precioBaseCLP: 100000, // DEMO: valor ficticio tramo 1-4 pax
      tramosPrivado: [
        { desdePax: 1, hastaPax: 4, precioCLP: 100000 }, // DEMO
        { desdePax: 5, hastaPax: 8, precioCLP: 150000 }, // DEMO
        { desdePax: 9, hastaPax: 12, precioCLP: 200000 }, // DEMO
      ],
      destinos: ['el_colorado', 'farellones', 'la_parva', 'valle_nevado'],
      upsells: ['equipo_nieve', 'ticket_centro'],
      imagenPlaceholder: '/placeholders/servicio-privado.svg',
    },
    {
      slug: 'experiencia',
      nombre: {
        es: 'Experiencia full day',
        pt: 'Experiência full day',
        en: 'Full-day experience',
      },
      descripcionCorta: {
        es: 'Transfer + parada en rental + día en el centro de ski. Todo coordinado para que solo te preocupes de disfrutar.',
        pt: 'Transfer + parada no rental + dia no centro de esqui. Tudo coordenado para você só curtir.',
        en: 'Transfer + rental stop + day at the ski center. Fully coordinated so you just enjoy.',
      },
      descripcionLarga: {
        es: 'Producto tipo tour: te buscamos, paramos en una tienda de arriendo asociada, te llevamos al centro de ski elegido y te traemos de vuelta a Santiago al final del día.',
        pt: 'Produto tipo tour: buscamos você, paramos numa loja de aluguel parceira, levamos você ao centro de esqui escolhido e trazemos de volta a Santiago no fim do dia.',
        en: 'Tour-style product: we pick you up, stop at a partner rental shop, take you to your chosen ski center and bring you back to Santiago at day end.',
      },
      incluye: [
        { es: 'Traslado ida y vuelta', pt: 'Translado ida e volta', en: 'Round-trip transfer' },
        { es: 'Parada coordinada en tienda de arriendo', pt: 'Parada coordenada em loja de aluguel', en: 'Coordinated stop at rental shop' },
        { es: 'Asistencia bilingüe', pt: 'Assistência bilíngue', en: 'Bilingual assistance' },
      ],
      noIncluye: [
        { es: 'Ticket centro de ski', pt: 'Ticket centro de esqui', en: 'Ski center pass' },
        { es: 'Arriendo de equipo (cotizable aparte)', pt: 'Aluguel de equipamento (cotação separada)', en: 'Gear rental (quoted separately)' },
      ],
      duracionMin: 600,
      precioBaseCLP: 30000, // DEMO: precio ficticio por persona
      destinos: ['el_colorado', 'valle_nevado'],
      upsells: ['equipo_nieve', 'ticket_centro', 'asiento_delantero'],
      imagenPlaceholder: '/placeholders/servicio-experiencia.svg',
    },
  ],

  niveles: [
    // DEMO: temporadas y multiplicadores ficticios. Fuera de rango aplica 'baja'.
    {
      nivel: 'baja',
      multiplicador: 1.0,
      rangos: [
        { desde: '2027-06-01', hasta: '2027-06-30' },
        { desde: '2027-08-16', hasta: '2027-09-30' },
      ],
      color: '#86EFAC', // verde
    },
    {
      nivel: 'peak',
      multiplicador: 1.15,
      rangos: [
        { desde: '2027-07-01', hasta: '2027-07-09' },
        { desde: '2027-07-26', hasta: '2027-08-15' },
      ],
      color: '#FBBF24', // ámbar
    },
    {
      nivel: 'super_peak',
      multiplicador: 1.3,
      rangos: [
        // Semanas de vacaciones de invierno (fechas ilustrativas)
        { desde: '2027-07-10', hasta: '2027-07-25' },
      ],
      color: '#F87171', // rojo
    },
  ],

  pickups: [
    // DEMO: puntos de encuentro genéricos
    {
      id: 'punto_a',
      nombre: 'Punto de encuentro A (demo)',
      comuna: 'Santiago',
      horaEstimada: '07:30',
      requiereDireccion: false,
    },
    {
      id: 'punto_b',
      nombre: 'Punto de encuentro B (demo)',
      comuna: 'Santiago',
      horaEstimada: '07:45',
      requiereDireccion: false,
    },
    {
      id: 'particular',
      nombre: 'Hotel / dirección particular',
      comuna: 'A coordinar',
      horaEstimada: '07:30',
      requiereDireccion: true,
    },
  ],

  horariosPorServicio: {
    // Restricción típica del camino de montaña: subida sólo AM, bajada sólo PM
    compartido: [
      { diasSemana: [], salidaHora: '07:30', retornoHora: '17:00' },
    ],
    privado: [
      { diasSemana: [], salidaHora: '07:30', retornoHora: '17:00' },
    ],
    experiencia: [
      { diasSemana: [], salidaHora: '07:30', retornoHora: '17:30' },
    ],
  },

  capacidad: {
    asientosPorVan: 12, // DEMO
    vansPropias: 2, // DEMO
    subcontratacionHabilitada: true,
  },

  pagos: {
    proveedor: 'link_manual', // pago online deshabilitado en la demo (ver flags.pagoOnlineHabilitado)
    porcentajePrepago: 50,
    linkManualURL: 'https://example.com/pagar', // DEMO: URL ficticia
    textoPago: {
      es: 'Pagar 50% para asegurar tu reserva',
      pt: 'Pagar 50% para garantir sua reserva',
      en: 'Pay 50% to secure your booking',
    },
  },

  upsells: [
    {
      id: 'equipo_nieve',
      nombre: {
        es: 'Equipo de nieve (pantalón + chaqueta)',
        pt: 'Equipamento de neve (calça + jaqueta)',
        en: 'Snow gear (pants + jacket)',
      },
      descripcion: {
        es: 'Arriendo de pantalón y chaqueta impermeables para el día.',
        pt: 'Aluguel de calça e jaqueta impermeáveis para o dia.',
        en: 'Daily rental of waterproof pants and jacket.',
      },
      precioCLP: 10000, // DEMO
    },
    {
      id: 'ticket_centro',
      nombre: {
        es: 'Ticket andariveles centro de ski',
        pt: 'Ticket teleféricos centro de esqui',
        en: 'Ski center lift ticket',
      },
      descripcion: {
        es: 'Pase de día para andariveles. Sujeto a disponibilidad del centro.',
        pt: 'Passe diário para teleféricos. Sujeito à disponibilidade do centro.',
        en: 'Day pass for ski lifts. Subject to resort availability.',
      },
      precioCLP: 40000, // DEMO: en la práctica depende del centro
    },
    {
      id: 'asiento_delantero',
      nombre: {
        es: 'Asiento delantero garantizado',
        pt: 'Assento dianteiro garantido',
        en: 'Guaranteed front seat',
      },
      descripcion: {
        es: 'Para quienes se marean o quieren la mejor vista al subir.',
        pt: 'Para quem enjoa ou quer a melhor vista na subida.',
        en: 'For those who get carsick or want the best view going up.',
      },
      precioCLP: 5000, // DEMO
    },
  ],

  politicaCancelacion: {
    textoCorto: {
      es: 'Cancelación gratis hasta 48h antes de la salida.',
      pt: 'Cancelamento grátis até 48h antes da saída.',
      en: 'Free cancellation up to 48h before departure.',
    },
    textoLargo: {
      es: 'Cancelaciones con más de 48 horas de anticipación reciben reembolso del 100% del prepago. Entre 48h y 24h antes, reembolso del 50%. Menos de 24h o no-show, sin reembolso. En caso de cierre del camino por autoridades, reembolso del 100% o reagendamiento sin costo.', // DEMO: política de ejemplo
      pt: 'Cancelamentos com mais de 48 horas de antecedência recebem reembolso de 100% do pré-pagamento. Entre 48h e 24h antes, reembolso de 50%. Menos de 24h ou no-show, sem reembolso. Em caso de fechamento da estrada pelas autoridades, reembolso de 100% ou reagendamento sem custo.',
      en: 'Cancellations more than 48 hours in advance receive a 100% refund of the prepayment. Between 48h and 24h before, 50% refund. Less than 24h or no-show, no refund. If the road is closed by authorities, 100% refund or free rescheduling.',
    },
    horasMinimasParaReembolso: 48,
  },
};

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

export function getServicio(slug: string): Service | undefined {
  return businessConfig.servicios.find((s) => s.slug === slug);
}

export function getUpsell(id: string): Upsell | undefined {
  return businessConfig.upsells.find((u) => u.id === id);
}

export function getPickup(id: string): Pickup | undefined {
  return businessConfig.pickups.find((p) => p.id === id);
}

export function destinoLabel(destino: Destino): I18nText {
  const map: Record<Destino, I18nText> = {
    el_colorado: { es: 'El Colorado', pt: 'El Colorado', en: 'El Colorado' },
    farellones: { es: 'Farellones', pt: 'Farellones', en: 'Farellones' },
    la_parva: { es: 'La Parva', pt: 'La Parva', en: 'La Parva' },
    valle_nevado: { es: 'Valle Nevado', pt: 'Valle Nevado', en: 'Valle Nevado' },
  };
  return map[destino];
}

/** Determina el nivel de tarifa aplicable a una fecha YYYY-MM-DD. Default: 'baja'. */
export function nivelParaFecha(fecha: string): NivelTarifaConfig {
  for (const nivel of businessConfig.niveles) {
    for (const r of nivel.rangos) {
      if (fecha >= r.desde && fecha <= r.hasta) return nivel;
    }
  }
  return businessConfig.niveles.find((n) => n.nivel === 'baja')!;
}
