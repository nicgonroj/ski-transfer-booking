import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['es', 'pt', 'en'] as const;
export const defaultLocale = 'es' as const;

export type AppLocale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as AppLocale)) notFound();

  return {
    messages: (await import(`@/messages/${locale}.json`)).default,
    timeZone: 'America/Santiago',
  };
});
