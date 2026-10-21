import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getServerSupabase, supabaseConfigured } from '@/lib/supabase/server';
import { businessConfig } from '@/config/business';
import type { AppLocale } from '@/lib/i18n';

async function requireAuth(locale: string) {
  if (supabaseConfigured) {
    const supabase = getServerSupabase();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/admin/login`);
  } else {
    const cookieStore = cookies();
    if (!cookieStore.get('mock_admin')) redirect(`/${locale}/admin/login`);
  }
}

export default async function AdminConfigPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as AppLocale;
  await requireAuth(params.locale);
  const t = await getTranslations({ locale, namespace: 'admin.config' });

  return (
    <section>
      <h1 className="mb-2 text-2xl font-extrabold text-brand-ink">{t('titulo')}</h1>
      <p className="mb-6 text-sm text-slate-600">
        La configuración actual vive en <code className="rounded bg-slate-200 px-1.5 py-0.5">config/business.ts</code>.
        Para editar precios, pickups o tarifas en producción sin redeploy, sincronizar a la tabla
        <code className="mx-1 rounded bg-slate-200 px-1.5 py-0.5">config</code> de Supabase y editar allí.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card titulo="Identidad">
          <Row k="Marca" v={businessConfig.identidad.nombreComercial} />
          <Row k="WhatsApp" v={businessConfig.identidad.whatsapp} />
          <Row k="Email" v={businessConfig.identidad.email} />
          <Row k="Instagram" v={businessConfig.identidad.instagram} />
          <Row k="Sitio web" v={businessConfig.identidad.sitioWeb} />
        </Card>

        <Card titulo="Pagos">
          <Row k="Proveedor" v={businessConfig.pagos.proveedor} />
          <Row k="% Prepago" v={`${businessConfig.pagos.porcentajePrepago}%`} />
          <Row k="Link manual" v={businessConfig.pagos.linkManualURL ?? '—'} />
        </Card>

        <Card titulo="Capacidad">
          <Row k="Asientos por van" v={String(businessConfig.capacidad.asientosPorVan)} />
          <Row k="Vans propias" v={String(businessConfig.capacidad.vansPropias)} />
          <Row
            k="Subcontratación"
            v={businessConfig.capacidad.subcontratacionHabilitada ? 'Sí' : 'No'}
          />
        </Card>

        <Card titulo="Servicios">
          {businessConfig.servicios.map((s) => (
            <Row
              key={s.slug}
              k={s.nombre.es}
              v={`Desde $${s.precioBaseCLP.toLocaleString('es-CL')}`}
            />
          ))}
        </Card>

        <Card titulo="Niveles de tarifa">
          {businessConfig.niveles.map((n) => (
            <Row key={n.nivel} k={n.nivel} v={`×${n.multiplicador}`} />
          ))}
        </Card>

        <Card titulo="Puntos de pickup">
          {businessConfig.pickups.map((p) => (
            <Row key={p.id} k={p.nombre} v={p.horaEstimada} />
          ))}
        </Card>
      </div>
    </section>
  );
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="mb-3 font-bold text-brand-ink">{titulo}</h2>
      <dl className="space-y-1.5 text-sm">{children}</dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-1">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-semibold text-right text-brand-ink">{v}</dd>
    </div>
  );
}
