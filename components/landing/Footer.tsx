import { useTranslations } from 'next-intl';
import { businessConfig } from '@/config/business';

export function Footer() {
  const t = useTranslations('footer');
  const { identidad } = businessConfig;
  const year = 2026;
  return (
    <footer className="bg-brand-ink py-10 text-sm text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">{identidad.nombreComercial}</p>
          <p className="mt-2 text-slate-400">{identidad.sitioWeb}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Contacto</p>
          <p className="mt-2">WhatsApp: {identidad.whatsapp}</p>
          {identidad.email && <p>Email: {identidad.email}</p>}
          <p>Instagram: {identidad.instagram}</p>
        </div>
        <div>
          <p className="font-semibold text-white">{t('razonSocial')}</p>
          <p className="mt-2">{identidad.razonSocial}</p>
          {identidad.rut && (
            <p>
              {t('rut')}: {identidad.rut}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-slate-500">
        © {year} {identidad.nombreComercial}. {t('derechos')}.
      </div>
    </footer>
  );
}
