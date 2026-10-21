'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getBrowserSupabase, supabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const t = useTranslations('admin.login');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!supabaseConfigured) {
      // Modo mock: aceptar cualquier credencial y guardar flag
      document.cookie = 'mock_admin=1; path=/; max-age=86400';
      router.push(`/${locale}/admin/reservas`);
      return;
    }
    const supabase = getBrowserSupabase()!;
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(t('error'));
      setSubmitting(false);
      return;
    }
    router.push(`/${locale}/admin/reservas`);
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <form onSubmit={onSubmit} className="card space-y-4">
        <h1 className="text-2xl font-extrabold text-brand-ink">{t('titulo')}</h1>
        {!supabaseConfigured && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            MODO MOCK — Supabase no configurado. Cualquier email/contraseña te dejará entrar para
            ver las pantallas del admin.
          </p>
        )}
        <div>
          <label className="label">{t('email')}</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">{t('password')}</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {t('entrar')}
        </button>
      </form>
    </div>
  );
}
