import type { MetadataRoute } from 'next';
import { businessConfig } from '@/config/business';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || businessConfig.identidad.sitioWeb).replace(
    /\/$/,
    '',
  );
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
