import { Suspense } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { WhatsAppFab } from '@/components/landing/WhatsAppFab';
import { Wizard } from '@/components/reserva/Wizard';

export default function ReservarPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-brand-snow py-10">
        <div className="mx-auto max-w-3xl px-4">
          <Suspense fallback={<div className="text-center text-slate-500">…</div>}>
            <Wizard />
          </Suspense>
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
