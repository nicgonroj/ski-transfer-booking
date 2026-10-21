import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { WhatsAppFab } from '@/components/landing/WhatsAppFab';
import type { AppLocale } from '@/lib/i18n';

interface Props {
  params: { locale: string; codigo: string };
}

export default async function ConfirmacionPage({ params }: Props) {
  const locale = params.locale as AppLocale;
  const t = await getTranslations({ locale, namespace: 'confirmacion' });

  return (
    <>
      <Header />
      <main className="flex-1 bg-brand-snow py-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="mb-6 text-6xl">✅</div>
          <h1 className="text-3xl font-extrabold text-brand-ink">{t('titulo')}</h1>
          <p className="mt-2 text-slate-600">{t('subtitulo')}</p>
          <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-primary bg-white p-6">
            <p className="text-sm text-slate-500">{t('codigo')}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-wider text-brand-primary">
              {params.codigo}
            </p>
          </div>
          <Link href={`/${locale}`} className="btn-primary mt-8 inline-flex">
            {t('volverInicio')}
          </Link>
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
