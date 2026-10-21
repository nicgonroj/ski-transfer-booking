'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { businessConfig } from '@/config/business';
import { formatCLP } from '@/lib/pricing';
import type { AppLocale } from '@/lib/i18n';

export function ServiceCards() {
  const t = useTranslations('servicios');
  const common = useTranslations('common');
  const locale = useLocale() as AppLocale;

  return (
    <section id="servicios" className="bg-brand-snow py-16">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-brand-ink md:text-4xl">{t('titulo')}</h2>
          <p className="mt-2 text-slate-600">{t('subtitulo')}</p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {businessConfig.servicios.map((s) => (
            <article key={s.slug} className="card flex flex-col">
              <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-brand-primary/10 text-5xl">
                {s.slug === 'compartido' ? '🚐' : s.slug === 'privado' ? '🚙' : '✨'}
              </div>
              <h3 className="text-xl font-bold text-brand-ink">{s.nombre[locale]}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">{s.descripcionCorta[locale]}</p>
              <div className="mt-4">
                {businessConfig.flags.mostrarPrecios ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-slate-500">{common('desde')}</span>
                    <span className="text-2xl font-extrabold text-brand-primary">
                      {formatCLP(s.precioBaseCLP, locale)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {s.slug === 'privado' ? common('por_van') : common('por_persona')}
                    </span>
                  </div>
                ) : (
                  <span className="text-base font-bold text-brand-primary">
                    {common('consultarPrecio')}
                  </span>
                )}
              </div>
              <div className="mt-5 flex gap-2">
                <Link href={`/${locale}/servicios/${s.slug}`} className="btn-secondary flex-1">
                  {t('verDetalle')}
                </Link>
                <Link
                  href={`/${locale}/reservar?servicio=${s.slug}`}
                  className="btn-primary flex-1"
                >
                  {common('reservar')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
