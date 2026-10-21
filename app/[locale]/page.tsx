import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { ServiceCards } from '@/components/landing/ServiceCards';
import { Trust } from '@/components/landing/Trust';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { WhatsAppFab } from '@/components/landing/WhatsAppFab';

export default function Landing() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ServiceCards />
        <Trust />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
