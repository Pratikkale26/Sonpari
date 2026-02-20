'use client';

import { HeroSection } from '@/components/landing/hero-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { UseCases } from '@/components/landing/use-cases';
import { CtaSection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <ProblemSection />
      <HowItWorks />
      <UseCases />
      <CtaSection />
      <Footer />
    </main>
  );
}
