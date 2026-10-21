import { useTranslations } from 'next-intl';

export function FAQ() {
  const t = useTranslations('faq');
  const items = [
    { q: 'q1', a: 'a1' },
    { q: 'q2', a: 'a2' },
    { q: 'q3', a: 'a3' },
    { q: 'q4', a: 'a4' },
  ] as const;
  return (
    <section id="faq" className="bg-brand-snow py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-extrabold text-brand-ink md:text-4xl">{t('titulo')}</h2>
        <div className="mt-8 space-y-3">
          {items.map((it) => (
            <details key={it.q} className="card group">
              <summary className="cursor-pointer list-none font-bold text-brand-ink marker:hidden">
                <span className="mr-2 text-brand-primary group-open:rotate-45 inline-block transition">+</span>
                {t(it.q)}
              </summary>
              <p className="mt-3 text-sm text-slate-600">{t(it.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
