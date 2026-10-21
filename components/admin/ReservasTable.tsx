'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ReservaDB } from '@/lib/supabase/types';
import type { AppLocale } from '@/lib/i18n';
import { formatCLP } from '@/lib/pricing';
import { construirMensajeReserva, deepLinkWhatsAppA } from '@/lib/whatsapp';
import { destinoLabel, type Destino } from '@/config/business';

const ESTADOS = [
  'pendiente_pago',
  'pendiente_whatsapp',
  'confirmada',
  'cancelada',
  'completada',
] as const;

const COLORES_ESTADO: Record<string, string> = {
  pendiente_pago: 'bg-amber-100 text-amber-800',
  pendiente_whatsapp: 'bg-sky-100 text-sky-800',
  confirmada: 'bg-emerald-100 text-emerald-800',
  cancelada: 'bg-slate-200 text-slate-700',
  completada: 'bg-indigo-100 text-indigo-800',
};

interface Props {
  reservas: ReservaDB[];
  locale: AppLocale;
}

export function ReservasTable({ reservas: initial, locale }: Props) {
  const t = useTranslations('admin.reservas');
  const [reservas, setReservas] = useState(initial);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroFecha, setFiltroFecha] = useState<string>('');

  const filtered = useMemo(() => {
    return reservas.filter((r) => {
      if (filtroEstado && r.estado !== filtroEstado) return false;
      if (filtroFecha && r.fecha !== filtroFecha) return false;
      return true;
    });
  }, [reservas, filtroEstado, filtroFecha]);

  async function cambiarEstado(r: ReservaDB, nuevo: ReservaDB['estado']) {
    setReservas((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, estado: nuevo } : x)),
    );
    await fetch('/api/reservas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: r.id, estado: nuevo }),
    });
  }

  function whatsappLink(r: ReservaDB) {
    const mensaje = construirMensajeReserva({
      codigo: r.codigo,
      servicioSlug: r.servicio_slug,
      destino: destinoLabel(r.destino as Destino)[locale],
      fecha: r.fecha,
      paxAdultos: r.pax_adultos,
      paxNinos: r.pax_ninos,
      pickupId: r.pickup_id,
      pickupDireccion: r.pickup_direccion ?? undefined,
      contactoNombre: r.contacto.nombre,
      totalCLP: r.total_clp,
      upsellsIds: r.upsells,
      locale,
    });
    return deepLinkWhatsAppA(r.contacto.whatsapp, mensaje);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="input max-w-xs"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input max-w-xs"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
        {(filtroEstado || filtroFecha) && (
          <button
            type="button"
            onClick={() => {
              setFiltroEstado('');
              setFiltroFecha('');
            }}
            className="text-sm text-slate-500 hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">{t('fecha')}</th>
              <th className="px-3 py-2">{t('codigo')}</th>
              <th className="px-3 py-2">{t('servicio')}</th>
              <th className="px-3 py-2">{t('destino')}</th>
              <th className="px-3 py-2">{t('pax')}</th>
              <th className="px-3 py-2">{t('total')}</th>
              <th className="px-3 py-2">{t('estado')}</th>
              <th className="px-3 py-2">{t('contacto')}</th>
              <th className="px-3 py-2">{t('acciones')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                  Sin reservas para mostrar.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{r.fecha}</td>
                <td className="px-3 py-2 font-mono font-semibold">{r.codigo}</td>
                <td className="px-3 py-2">{r.servicio_slug}</td>
                <td className="px-3 py-2">{r.destino}</td>
                <td className="px-3 py-2">
                  {r.pax_adultos}+{r.pax_ninos}
                </td>
                <td className="px-3 py-2 font-semibold">{formatCLP(r.total_clp, locale)}</td>
                <td className="px-3 py-2">
                  <select
                    value={r.estado}
                    onChange={(e) => cambiarEstado(r, e.target.value as ReservaDB['estado'])}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      COLORES_ESTADO[r.estado] ?? 'bg-slate-100'
                    }`}
                  >
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div>{r.contacto.nombre}</div>
                  <div className="text-xs text-slate-500">{r.contacto.whatsapp}</div>
                </td>
                <td className="px-3 py-2">
                  <a
                    href={whatsappLink(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    {t('abrirWhatsApp')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
