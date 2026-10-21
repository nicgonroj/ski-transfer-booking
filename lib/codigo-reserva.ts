import { businessConfig } from '@/config/business';

/**
 * Genera un código de reserva corto y memorable: <PREFIJO>-MMDD-XXX
 * - MM = mes de salida (no de creación) — más útil para el operador
 * - DD = día de salida
 * - XXX = 3 caracteres alfanuméricos sin caracteres ambiguos (sin 0,O,1,I,L)
 *
 * El prefijo sale de `identidad.prefijoCodigo` en config/business.ts.
 *
 * Ejemplo: AT-0728-A3F
 */

const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generarCodigoReserva(fechaSalida: string): string {
  // fechaSalida en formato YYYY-MM-DD
  const [, mm, dd] = fechaSalida.split('-');
  let sufijo = '';
  for (let i = 0; i < 3; i++) {
    sufijo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return `${businessConfig.identidad.prefijoCodigo}-${mm}${dd}-${sufijo}`;
}
