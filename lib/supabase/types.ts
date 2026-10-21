import type { CanalReserva, EstadoReserva, Locale } from '@/config/business';

export interface ReservaDB {
  id: string;
  codigo: string;
  servicio_slug: string;
  destino: string;
  fecha: string; // YYYY-MM-DD
  salida_hora: string; // HH:MM:SS
  pax_adultos: number;
  pax_ninos: number;
  pickup_id: string;
  pickup_direccion: string | null;
  contacto: ContactoDB;
  upsells: string[];
  total_clp: number;
  prepago_clp: number;
  estado: EstadoReserva;
  canal: CanalReserva;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactoDB {
  nombre: string;
  whatsapp: string;
  email: string;
  idioma: Locale;
  nacionalidad?: string;
}

export interface SalidaDB {
  id: string;
  fecha: string;
  servicio_slug: string;
  hora: string;
  capacidad_total: number;
  asientos_vendidos: number;
  cerrada: boolean;
  created_at: string;
}

export interface ConfigDB {
  key: string;
  value: unknown;
  updated_at: string;
}

export type NuevaReserva = Omit<ReservaDB, 'id' | 'created_at' | 'updated_at'>;
