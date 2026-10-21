'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { deepLinkWhatsAppLibre } from '@/lib/whatsapp';
import type { AppLocale } from '@/lib/i18n';

export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale() as AppLocale;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primaryDark text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
            {t('tagline')}
          </p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">{t('titulo')}</h1>
          <p className="mt-4 text-lg text-white/90 md:text-xl">{t('subtitulo')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/reservar`} className="btn-primary bg-white !text-brand-primary hover:bg-brand-snow">
              {t('ctaPrimario')}
            </Link>
            <a
              href={deepLinkWhatsAppLibre(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary !border-white !bg-transparent !text-white hover:!bg-white/10"
            >
              {t('ctaSecundario')}
            </a>
          </div>
        </div>
        <div className="relative h-64 md:h-80">
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            {/* Placeholder visual: imagen real va a public/placeholders/hero.svg */}
            <span className="text-8xl">⛷️</span>
          </div>
        </div>
      </div>
    </section>
  );
}
