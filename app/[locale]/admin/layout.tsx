import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { businessConfig } from '@/config/business';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function AdminNav() {
  const t = useTranslations('admin');
  const locale = useLocale();
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${locale}/admin/reservas`} className="font-bold text-brand-primary">
          {businessConfig.identidad.nombreComercial} · admin
        </Link>
        <div className="flex gap-4 text-sm font-semibold">
          <Link href={`/${locale}/admin/reservas`} className="hover:text-brand-primary">
            {t('reservas.titulo')}
          </Link>
          <Link href={`/${locale}/admin/salidas`} className="hover:text-brand-primary">
            {t('salidas.titulo')}
          </Link>
          <Link href={`/${locale}/admin/configuracion`} className="hover:text-brand-primary">
            {t('config.titulo')}
          </Link>
          <Link href={`/${locale}`} className="text-slate-500 hover:text-brand-primary">
            ↗ Sitio
          </Link>
        </div>
      </div>
    </nav>
  );
}
