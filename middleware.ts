import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  // Match all paths except: API, _next, static files, sitemap, robots
  matcher: ['/((?!api|_next|.*\\..*|sitemap.xml|robots.txt).*)'],
};
