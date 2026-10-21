'use client';
import { useReducer, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { z } from 'zod';
import { Calendario } from './Calendario';
import {
  businessConfig,
  destinoLabel,
  getServicio,
  type Destino,
  type Locale as AppLocale,
} from '@/config/business';
import { calcularPrecio, formatCLP } from '@/lib/pricing';
import { construirMensajeReserva, deepLinkWhatsApp } from '@/lib/whatsapp';

// ─── State ────────────────────────────────────────────────────────────

interface WizardState {
  step: 1 | 2 | 3 | 4;
  servicioSlug: string;
  destino: Destino | '';
  fecha: string;
  paxAdultos: number;
  paxNinos: number;
  pickupId: string;
  pickupDireccion: string;
  contactoNombre: string;
  contactoWhatsapp: string;
  contactoEmail: string;
  contactoNacionalidad: string;
  upsellsIds: string[];
}

type Action =
  | { type: 'set'; field: keyof WizardState; value: string | number }
  | { type: 'toggleUpsell'; id: string }
  | { type: 'goto'; step: 1 | 2 | 3 | 4 };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value } as WizardState;
    case 'toggleUpsell': {
      const set = new Set(state.upsellsIds);
      if (set.has(action.id)) set.delete(action.id);
      else set.add(action.id);
      return { ...state, upsellsIds: Array.from(set) };
    }
    case 'goto':
      return { ...state, step: action.step };
  }
}

const initialState = (initialServicio?: string): WizardState => ({
  step: 1,
  servicioSlug: initialServicio || businessConfig.servicios[0].slug,
  destino: '',
  fecha: '',
  paxAdultos: 1,
  paxNinos: 0,
  pickupId: businessConfig.pickups[0]?.id ?? '',
  pickupDireccion: '',
  contactoNombre: '',
  contactoWhatsapp: '',
  contactoEmail: '',
  contactoNacionalidad: '',
  upsellsIds: [],
});

// ─── Validación por paso ──────────────────────────────────────────────

const emailZ = z.string().email();
const whatsappZ = z.string().regex(/^\+\d{10,15}$/);

function validate(step: WizardState['step'], s: WizardState): string | null {
  if (step >= 1) {
    if (!s.servicioSlug || !s.destino || !s.fecha) return 'step1';
  }
  if (step >= 2) {
    if (s.paxAdultos < 1) return 'pax_min';
    if (!s.pickupId) return 'step2';
    const pickup = businessConfig.pickups.find((p) => p.id === s.pickupId);
    if (pickup?.requiereDireccion && !s.pickupDireccion.trim()) return 'step2';
  }
  if (step >= 3) {
    if (!s.contactoNombre.trim()) return 'campo_requerido';
    if (!whatsappZ.safeParse(s.contactoWhatsapp).success) return 'whatsapp_invalido';
    if (!emailZ.safeParse(s.contactoEmail).success) return 'email_invalido';
  }
  return null;
}

// ─── Componente principal ────────────────────────────────────────────

export function Wizard() {
  const search = useSearchParams();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations('wizard');
  const common = useTranslations('common');
  const errores = useTranslations('wizard.errores');

  const [state, dispatch] = useReducer(reducer, initialState(search.get('servicio') ?? undefined));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const servicio = getServicio(state.servicioSlug);

  const precio = state.fecha
    ? calcularPrecio({
        servicioSlug: state.servicioSlug,
        fecha: state.fecha,
        paxAdultos: state.paxAdultos,
        paxNinos: state.paxNinos,
        upsellsIds: state.upsellsIds,
      })
    : null;

  function next() {
    const err = validate(state.step, state);
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    if (state.step < 4) dispatch({ type: 'goto', step: (state.step + 1) as 1 | 2 | 3 | 4 });
  }
  function prev() {
    if (state.step > 1) dispatch({ type: 'goto', step: (state.step - 1) as 1 | 2 | 3 | 4 });
    setSubmitError(null);
  }

  async function submitReserva(canal: 'web' | 'whatsapp') {
    if (!precio || !servicio) return;
    setSubmitting(true);
    setSubmitError(null);

    // Si los precios no están publicados, no enviamos montos (el operador cotiza por WhatsApp).
    const totalCLP = businessConfig.flags.mostrarPrecios ? precio.totalCLP : 0;
    const prepagoCLP =
      businessConfig.flags.mostrarPrecios && businessConfig.flags.pagoOnlineHabilitado
        ? precio.prepagoCLP
        : 0;
    const estado =
      canal === 'web' && businessConfig.flags.pagoOnlineHabilitado
        ? 'pendiente_pago'
        : 'pendiente_whatsapp';

    const body = {
      servicio_slug: state.servicioSlug,
      destino: state.destino,
      fecha: state.fecha,
      pax_adultos: state.paxAdultos,
      pax_ninos: state.paxNinos,
      pickup_id: state.pickupId,
      pickup_direccion: state.pickupDireccion || null,
      contacto: {
        nombre: state.contactoNombre,
        whatsapp: state.contactoWhatsapp,
        email: state.contactoEmail,
        idioma: locale,
        nacionalidad: state.contactoNacionalidad || undefined,
      },
      upsells: state.upsellsIds,
      total_clp: totalCLP,
      prepago_clp: prepagoCLP,
      estado,
      canal: 'web',
    };

    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const codigo = data.codigo as string;
      // El servidor es la fuente de verdad del monto (recalcula desde la config).
      const totalServidor = typeof data.totalCLP === 'number' ? data.totalCLP : totalCLP;

      if (canal === 'whatsapp') {
        const mensaje = construirMensajeReserva({
          codigo,
          servicioSlug: state.servicioSlug,
          destino: destinoLabel(state.destino as Destino)[locale],
          fecha: state.fecha,
          paxAdultos: state.paxAdultos,
          paxNinos: state.paxNinos,
          pickupId: state.pickupId,
          pickupDireccion: state.pickupDireccion,
          contactoNombre: state.contactoNombre,
          totalCLP: totalServidor,
          upsellsIds: state.upsellsIds,
          locale,
        });
        // Abrir WhatsApp y redirigir a confirmación
        window.open(deepLinkWhatsApp(mensaje), '_blank');
        router.push(`/${locale}/reservar/confirmacion/${codigo}`);
      } else {
        // Pago: si el backend devuelve URL, redirige; si no, confirmación
        if (data.pagoUrl) {
          window.location.href = data.pagoUrl;
        } else {
          router.push(`/${locale}/reservar/confirmacion/${codigo}`);
        }
      }
    } catch (e) {
      console.error(e);
      setSubmitError('campo_requerido');
      setSubmitting(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="mb-6 flex items-center gap-2 text-xs font-semibold">
        {[1, 2, 3, 4].map((n) => (
          <li key={n} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                state.step >= n
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {n}
            </span>
            {n < 4 && (
              <span
                className={`h-0.5 flex-1 ${
                  state.step > n ? 'bg-brand-primary' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="card">
        {state.step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">{t('step1.titulo')}</h2>
              <p className="text-sm text-slate-500">
                {t('paso')} 1 {t('de')} 4
              </p>
            </div>

            <div>
              <label className="label">{t('step1.elegiServicio')}</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {businessConfig.servicios.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => dispatch({ type: 'set', field: 'servicioSlug', value: s.slug })}
                    className={`rounded-xl border p-3 text-left text-sm transition ${
                      state.servicioSlug === s.slug
                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary'
                        : 'border-slate-200 hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="font-bold">{s.nombre[locale]}</div>
                    <div className="text-xs text-slate-500">
                      {businessConfig.flags.mostrarPrecios
                        ? `${common('desde')} ${formatCLP(s.precioBaseCLP, locale)}`
                        : common('consultarPrecio')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">{t('step1.elegiDestino')}</label>
              <select
                className="input"
                value={state.destino}
                onChange={(e) => dispatch({ type: 'set', field: 'destino', value: e.target.value })}
              >
                <option value="">—</option>
                {(servicio?.destinos ?? []).map((d) => (
                  <option key={d} value={d}>
                    {destinoLabel(d)[locale]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">{t('step1.elegiFecha')}</label>
              <Calendario
                value={state.fecha || null}
                onChange={(f) => dispatch({ type: 'set', field: 'fecha', value: f })}
              />
            </div>
          </div>
        )}

        {state.step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">{t('step2.titulo')}</h2>
              <p className="text-sm text-slate-500">
                {t('paso')} 2 {t('de')} 4
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('step2.adultos')}</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  className="input"
                  value={state.paxAdultos}
                  onChange={(e) =>
                    dispatch({ type: 'set', field: 'paxAdultos', value: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="label">{t('step2.ninos')}</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  className="input"
                  value={state.paxNinos}
                  onChange={(e) =>
                    dispatch({ type: 'set', field: 'paxNinos', value: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <label className="label">{t('step2.pickup')}</label>
              <select
                className="input"
                value={state.pickupId}
                onChange={(e) =>
                  dispatch({ type: 'set', field: 'pickupId', value: e.target.value })
                }
              >
                {businessConfig.pickups.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.horaEstimada}
                  </option>
                ))}
              </select>
            </div>

            {businessConfig.pickups.find((p) => p.id === state.pickupId)?.requiereDireccion && (
              <div>
                <label className="label">{t('step2.direccion')}</label>
                <input
                  type="text"
                  className="input"
                  value={state.pickupDireccion}
                  onChange={(e) =>
                    dispatch({ type: 'set', field: 'pickupDireccion', value: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        )}

        {state.step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">{t('step3.titulo')}</h2>
              <p className="text-sm text-slate-500">
                {t('paso')} 3 {t('de')} 4
              </p>
            </div>
            <div>
              <label className="label">{t('step3.nombre')}</label>
              <input
                type="text"
                className="input"
                value={state.contactoNombre}
                onChange={(e) =>
                  dispatch({ type: 'set', field: 'contactoNombre', value: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('step3.whatsapp')}</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+15555550100"
                  value={state.contactoWhatsapp}
                  onChange={(e) =>
                    dispatch({ type: 'set', field: 'contactoWhatsapp', value: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">{t('step3.email')}</label>
                <input
                  type="email"
                  className="input"
                  value={state.contactoEmail}
                  onChange={(e) =>
                    dispatch({ type: 'set', field: 'contactoEmail', value: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">{t('step3.nacionalidad')}</label>
              <input
                type="text"
                className="input"
                value={state.contactoNacionalidad}
                onChange={(e) =>
                  dispatch({ type: 'set', field: 'contactoNacionalidad', value: e.target.value })
                }
              />
            </div>

            {(servicio?.upsells.length ?? 0) > 0 && (
              <div>
                <label className="label">{t('step3.extras')}</label>
                <div className="space-y-2">
                  {servicio!.upsells
                    .map((id) => businessConfig.upsells.find((u) => u.id === id))
                    .filter((u): u is NonNullable<typeof u> => Boolean(u))
                    .map((u) => (
                      <label
                        key={u.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={state.upsellsIds.includes(u.id)}
                          onChange={() => dispatch({ type: 'toggleUpsell', id: u.id })}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-semibold">{u.nombre[locale]}</div>
                          <div className="text-xs text-slate-500">{u.descripcion[locale]}</div>
                        </div>
                        <div className="text-xs font-semibold text-brand-primary">
                          {businessConfig.flags.mostrarPrecios
                            ? formatCLP(u.precioCLP, locale)
                            : common('consultarDisponibilidad')}
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {state.step === 4 && precio && servicio && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">{t('step4.titulo')}</h2>
              <p className="text-sm text-slate-500">
                {t('paso')} 4 {t('de')} 4
              </p>
            </div>

            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                <strong>{servicio.nombre[locale]}</strong> →{' '}
                {state.destino && destinoLabel(state.destino as Destino)[locale]}
              </li>
              <li>📅 {state.fecha}</li>
              <li>
                👥 {state.paxAdultos} + {state.paxNinos}
              </li>
              <li>📍 {businessConfig.pickups.find((p) => p.id === state.pickupId)?.nombre}</li>
              {state.pickupDireccion && <li>🏠 {state.pickupDireccion}</li>}
              {state.upsellsIds.length > 0 && (
                <li>
                  ➕{' '}
                  {state.upsellsIds
                    .map((id) => businessConfig.upsells.find((u) => u.id === id)?.nombre[locale])
                    .filter(Boolean)
                    .join(', ')}
                </li>
              )}
            </ul>

            {businessConfig.flags.mostrarPrecios && (
              <div className="rounded-xl bg-brand-primary/5 p-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCLP(precio.subtotalCLP, locale)}</span>
                </div>
                <div className="mt-2 flex justify-between text-lg font-bold text-brand-ink">
                  <span>{common('total')}</span>
                  <span>{formatCLP(precio.totalCLP, locale)}</span>
                </div>
                {businessConfig.flags.pagoOnlineHabilitado && (
                  <div className="flex justify-between text-sm font-semibold text-brand-primary">
                    <span>
                      {common('prepago')} ({businessConfig.pagos.porcentajePrepago}%)
                    </span>
                    <span>{formatCLP(precio.prepagoCLP, locale)}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-slate-500">{t('step4.aclaracion')}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {businessConfig.flags.pagoOnlineHabilitado && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitReserva('web')}
                  className="btn-primary"
                >
                  {t('step4.pagar')}
                </button>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitReserva('whatsapp')}
                className={
                  businessConfig.flags.pagoOnlineHabilitado
                    ? 'btn-secondary'
                    : 'btn-primary sm:col-span-2'
                }
              >
                {t('step4.whatsapp')}
              </button>
            </div>
          </div>
        )}

        {submitError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {/* Mostrar mensaje conocido si existe, si no, fallback */}
            {(() => {
              const knownKeys = [
                'campo_requerido',
                'whatsapp_invalido',
                'email_invalido',
                'pax_min',
              ];
              return knownKeys.includes(submitError) ? errores(submitError) : submitError;
            })()}
          </p>
        )}

        {state.step < 4 && (
          <div className="mt-6 flex justify-between">
            <button type="button" className="btn-secondary" onClick={prev} disabled={state.step === 1}>
              {common('anterior')}
            </button>
            <button type="button" className="btn-primary" onClick={next}>
              {common('siguiente')}
            </button>
          </div>
        )}
        {state.step === 4 && (
          <div className="mt-4 flex justify-start">
            <button type="button" className="btn-secondary" onClick={prev}>
              {common('anterior')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
