import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { WhatsAppFab } from '@/components/landing/WhatsAppFab';
import { businessConfig, destinoLabel, getServicio } from '@/config/business';
import type { AppLocale } from '@/lib/i18n';
import { formatCLP } from '@/lib/pricing';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateStaticParams() {
  const slugs = businessConfig.servicios.map((s) => s.slug);
  const locales = ['es', 'pt', 'en'];
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function ServicioDetalle({ params }: Props) {
  const locale = params.locale as AppLocale;
  const servicio = getServicio(params.slug);
  if (!servicio) notFound();

  const t = await getTranslations({ locale, namespace: 'servicios' });
  const common = await getTranslations({ locale, namespace: 'common' });

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-brand-primary to-brand-primaryDark py-12 text-white">
          <div className="mx-auto max-w-5xl px-4">
            <Link href={`/${locale}`} className="text-sm opacity-80 hover:opacity-100">
              ← {common('volver')}
            </Link>
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{servicio.nombre[locale]}</h1>
            <p className="mt-3 max-w-2xl text-white/90">{servicio.descripcionLarga[locale]}</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-brand-ink">{t('incluye')}</h2>
                <ul className="mt-3 space-y-2 text-slate-700">
                  {servicio.incluye.map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-600">✓</span> {it[locale]}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-ink">{t('noIncluye')}</h2>
                <ul className="mt-3 space-y-2 text-slate-700">
                  {servicio.noIncluye.map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">×</span> {it[locale]}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-ink">{t('destinos')}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {servicio.destinos.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-semibold text-brand-primary"
                    >
                      {destinoLabel(d)[locale]}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-ink">{t('horarios')}</h2>
                <ul className="mt-3 space-y-1 text-slate-700">
                  {(businessConfig.horariosPorServicio[servicio.slug] ?? []).map((h, i) => (
                    <li key={i}>
                      {common('desde')} {h.salidaHora} — retorno {h.retornoHora}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="card h-fit">
              {businessConfig.flags.mostrarPrecios ? (
                <>
                  <p className="text-sm text-slate-500">{common('desde')}</p>
                  <p className="text-3xl font-extrabold text-brand-primary">
                    {formatCLP(servicio.precioBaseCLP, locale)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {servicio.slug === 'privado' ? common('por_van') : common('por_persona')}
                  </p>

                  {servicio.tramosPrivado && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-brand-ink">Tramos</p>
                      <ul className="mt-1 space-y-1 text-slate-600">
                        {servicio.tramosPrivado.map((tr, i) => (
                          <li key={i}>
                            {tr.desdePax}-{tr.hastaPax} pax: {formatCLP(tr.precioCLP, locale)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl bg-brand-primary/5 p-4 text-center">
                  <p className="text-lg font-bold text-brand-primary">
                    {common('consultarPrecio')}
                  </p>
                </div>
              )}

              <Link
                href={`/${locale}/reservar?servicio=${servicio.slug}`}
                className="btn-primary mt-5 w-full"
              >
                {common('reservar')}
              </Link>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
