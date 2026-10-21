import { useTranslations } from 'next-intl';

export function Trust() {
  const t = useTranslations('trust');
  const items = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6'] as const;
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-extrabold text-brand-ink md:text-4xl">{t('titulo')}</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((k) => (
            <li key={k} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <span className="text-xl text-brand-primary">✓</span>
              <span className="text-sm text-slate-700">{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
