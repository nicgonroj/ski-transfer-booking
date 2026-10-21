'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { LangSwitcher } from './LangSwitcher';
import { businessConfig } from '@/config/business';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-brand-primary">
          <span className="text-xl">🏔️</span>
          <span>{businessConfig.identidad.nombreComercial}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href={`/${locale}#servicios`} className="hover:text-brand-primary">
            {t('servicios')}
          </Link>
          <Link href={`/${locale}/reservar`} className="hover:text-brand-primary">
            {t('reservar')}
          </Link>
          <Link href={`/${locale}#faq`} className="hover:text-brand-primary">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitcher />
        </div>
      </div>
    </header>
  );
}
