'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/lib/i18n';

const labels: Record<string, string> = { es: 'ES', pt: 'PT', en: 'EN' };

export function LangSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(loc: string) {
    if (loc === current) return;
    // Reemplaza el primer segmento (/es/... → /pt/...)
    const parts = pathname.split('/');
    parts[1] = loc;
    router.push(parts.join('/'));
  }

  return (
    <div className="inline-flex rounded-full bg-white/90 p-1 text-sm shadow-soft">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={`rounded-full px-3 py-1 font-semibold transition ${
            l === current ? 'bg-brand-primary text-white' : 'text-brand-ink hover:bg-slate-100'
          }`}
          aria-current={l === current ? 'true' : undefined}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
