'use client';

import { useRef } from 'react';
import { HeroSection } from '@/components/landing/hero-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { UseCases } from '@/components/landing/use-cases';
import { WaitlistSection } from '@/components/landing/waitlist-section';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  const waitlistRef = useRef<HTMLDivElement>(null);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-white">
      <HeroSection onJoinWaitlist={scrollToWaitlist} />
      <ProblemSection />
      <HowItWorks />
      <UseCases />
      <div ref={waitlistRef}>
        <WaitlistSection />
      </div>
      <Footer />
    </main>
  );
}
