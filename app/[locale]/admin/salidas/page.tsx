import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getServerSupabase, supabaseConfigured } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mock-store';
import type { SalidaDB } from '@/lib/supabase/types';
import type { AppLocale } from '@/lib/i18n';

async function listarSalidas(): Promise<SalidaDB[]> {
  if (supabaseConfigured) {
    const supabase = getServerSupabase();
    if (!supabase) return [];
    const { data } = await supabase
      .from('salidas')
      .select('*')
      .order('fecha', { ascending: true });
    return (data as SalidaDB[]) ?? [];
  }
  return mockStore.listSalidas();
}

async function requireAuth(locale: string) {
  if (supabaseConfigured) {
    const supabase = getServerSupabase();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/admin/login`);
  } else {
    const cookieStore = cookies();
    if (!cookieStore.get('mock_admin')) redirect(`/${locale}/admin/login`);
  }
}

export default async function AdminSalidasPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as AppLocale;
  await requireAuth(params.locale);
  const salidas = await listarSalidas();
  const t = await getTranslations({ locale, namespace: 'admin.salidas' });

  return (
    <section>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">{t('titulo')}</h1>

      {salidas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Aún no hay salidas registradas. Las salidas se crean automáticamente al recibir reservas.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {salidas.map((s) => {
            const pct = s.capacidad_total
              ? Math.round((s.asientos_vendidos / s.capacidad_total) * 100)
              : 0;
            const semaforo =
              pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <article key={s.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{s.fecha}</p>
                    <p className="font-bold text-brand-ink">
                      {s.servicio_slug} · {s.hora}
                    </p>
                  </div>
                  <span className={`h-3 w-3 rounded-full ${semaforo}`} aria-hidden="true" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{t('ocupacion')}</span>
                    <span className="font-semibold">
                      {s.asientos_vendidos} / {s.capacidad_total}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${semaforo}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {s.cerrada && (
                  <p className="mt-3 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs">
                    Fecha cerrada
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
