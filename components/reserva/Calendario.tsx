'use client';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { businessConfig, nivelParaFecha } from '@/config/business';
import type { AppLocale } from '@/lib/i18n';

interface Props {
  value: string | null; // YYYY-MM-DD
  onChange: (fecha: string) => void;
  /** Si retorna true, la fecha aparece deshabilitada. */
  disableDate?: (fecha: string) => boolean;
}

function fmtIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function Calendario({ value, onChange, disableDate }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('calendario');
  const meses = t.raw('meses') as string[];
  const dias = t.raw('diasCorto') as string[];

  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));

  const days = useMemo(() => {
    const firstDay = startOfMonth(cursor);
    // Lunes = 0
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    return cells;
  }, [cursor]);

  function prevMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg p-2 hover:bg-slate-100"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <p className="font-bold text-brand-ink">
          {meses[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg p-2 hover:bg-slate-100"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
        {dias.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = fmtIso(d);
          const isPast = d < today;
          const disabled = isPast || (disableDate ? disableDate(iso) : false);
          const isSelected = value === iso;
          const nivel = nivelParaFecha(iso);

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`relative aspect-square rounded-lg text-sm transition
                ${disabled ? 'cursor-not-allowed text-slate-300' : 'hover:bg-brand-primary/10'}
                ${isSelected ? 'bg-brand-primary text-white hover:bg-brand-primary' : ''}
              `}
              aria-label={iso}
              aria-pressed={isSelected}
            >
              {d.getDate()}
              {businessConfig.flags.mostrarPrecios && !disabled && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full"
                  style={{ background: nivel.color }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {businessConfig.flags.mostrarPrecios && (
        <ul className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
          {businessConfig.niveles.map((n) => (
            <li key={n.nivel} className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-full" style={{ background: n.color }} />
              {t(n.nivel)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
