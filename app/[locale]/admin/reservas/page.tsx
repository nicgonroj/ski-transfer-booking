import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getServerSupabase, supabaseConfigured } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mock-store';
import type { ReservaDB } from '@/lib/supabase/types';
import type { AppLocale } from '@/lib/i18n';
import { ReservasTable } from '@/components/admin/ReservasTable';

async function listarReservas(): Promise<ReservaDB[]> {
  if (supabaseConfigured) {
    const supabase = getServerSupabase();
    if (!supabase) return [];
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .order('fecha', { ascending: false });
    return (data as ReservaDB[]) ?? [];
  }
  return mockStore.listReservas();
}

async function requireAuth(locale: string) {
  if (supabaseConfigured) {
    const supabase = getServerSupabase();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/admin/login`);
  } else {
    const cookieStore = cookies();
    if (!cookieStore.get('mock_admin')) redirect(`/${locale}/admin/login`);
  }
}

export default async function AdminReservasPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as AppLocale;
  await requireAuth(params.locale);
  const reservas = await listarReservas();
  const t = await getTranslations({ locale, namespace: 'admin.reservas' });
  return (
    <section>
      <header className="mb-6 flex items-end justify-between">
        <h1 className="text-2xl font-extrabold text-brand-ink">{t('titulo')}</h1>
        <Link
          href={`/${locale}/reservar`}
          className="text-sm text-brand-primary hover:underline"
        >
          + Nueva reserva manual
        </Link>
      </header>
      <ReservasTable reservas={reservas} locale={locale} />
    </section>
  );
}
