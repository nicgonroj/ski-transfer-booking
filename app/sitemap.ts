import type { MetadataRoute } from 'next';
import { businessConfig } from '@/config/business';
import { locales } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || businessConfig.identidad.sitioWeb).replace(
    /\/$/,
    '',
  );
  const rutas = ['', 'reservar', ...businessConfig.servicios.map((s) => `servicios/${s.slug}`)];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const ruta of rutas) {
      entries.push({
        url: `${base}/${locale}${ruta ? `/${ruta}` : ''}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: ruta === '' ? 1.0 : 0.7,
      });
    }
  }
  return entries;
}
