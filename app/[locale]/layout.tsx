import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type AppLocale } from '@/lib/i18n';
import { businessConfig } from '@/config/business';
import '../globals.css';

// El sitio usa cookies para auth admin, calendario dinámico y mock-store
// en memoria. Forzamos dynamic rendering para evitar problemas de SSG con
// next-intl v3 (que requiere setRequestLocale en cada page para SSG).
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B6CA8',
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const marca = businessConfig.identidad.nombreComercial;
  const titulos: Record<string, { title: string; description: string }> = {
    es: {
      title: `${marca} — Transfers Santiago ↔ centros de ski`,
      description:
        'Reserva tu transfer a El Colorado, Farellones, La Parva o Valle Nevado. Chofer experto, cadenas, pickup en hotel y pago online.',
    },
    pt: {
      title: `${marca} — Transfers Santiago ↔ centros de esqui`,
      description:
        'Reserve seu transfer para El Colorado, Farellones, La Parva ou Valle Nevado. Motorista experiente, correntes, pickup em hotel e pagamento online.',
    },
    en: {
      title: `${marca} — Santiago ↔ ski center transfers`,
      description:
        'Book your transfer to El Colorado, Farellones, La Parva or Valle Nevado. Expert driver, chains, hotel pickup and online payment.',
    },
  };
  const meta = titulos[params.locale] ?? titulos.es;
  return {
    metadataBase: new URL(businessConfig.identidad.sitioWeb),
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: params.locale,
      siteName: businessConfig.identidad.nombreComercial,
    },
    alternates: {
      canonical: `/${params.locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as AppLocale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
