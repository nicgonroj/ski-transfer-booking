/**
 * Store en memoria como fallback cuando Supabase no está configurado.
 * Persiste solo durante el ciclo de vida del proceso de Next.
 * Sirve para QA local sin tener que levantar Supabase.
 */

import { businessConfig } from '@/config/business';
import type { NuevaReserva, ReservaDB, SalidaDB } from './supabase/types';

const reservas: ReservaDB[] = [];
const salidas: SalidaDB[] = [];

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const mockStore = {
  async insertReserva(input: NuevaReserva): Promise<ReservaDB> {
    const reserva: ReservaDB = {
      id: uuid(),
      created_at: nowIso(),
      updated_at: nowIso(),
      ...input,
    };
    reservas.push(reserva);
    this.recalcSalida(input.fecha, input.servicio_slug, input.salida_hora);
    return reserva;
  },
  async getReservaByCodigo(codigo: string): Promise<ReservaDB | null> {
    return reservas.find((r) => r.codigo === codigo) ?? null;
  },
  async listReservas(): Promise<ReservaDB[]> {
    return [...reservas].sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
  },
  async updateReservaEstado(id: string, estado: ReservaDB['estado']): Promise<void> {
    const r = reservas.find((x) => x.id === id);
    if (r) {
      r.estado = estado;
      r.updated_at = nowIso();
      this.recalcSalida(r.fecha, r.servicio_slug, r.salida_hora);
    }
  },
  async listSalidas(): Promise<SalidaDB[]> {
    return [...salidas];
  },
  recalcSalida(fecha: string, servicio: string, hora: string) {
    const vendidos = reservas
      .filter(
        (r) =>
          r.fecha === fecha &&
          r.servicio_slug === servicio &&
          r.salida_hora === hora &&
          (r.estado === 'confirmada' || r.estado === 'pendiente_pago'),
      )
      .reduce((sum, r) => sum + r.pax_adultos + r.pax_ninos, 0);

    let salida = salidas.find(
      (s) => s.fecha === fecha && s.servicio_slug === servicio && s.hora === hora,
    );
    if (!salida) {
      salida = {
        id: uuid(),
        fecha,
        servicio_slug: servicio,
        hora,
        capacidad_total: businessConfig.capacidad.asientosPorVan * businessConfig.capacidad.vansPropias,
        asientos_vendidos: vendidos,
        cerrada: false,
        created_at: nowIso(),
      };
      salidas.push(salida);
    } else {
      salida.asientos_vendidos = vendidos;
    }
  },
};
