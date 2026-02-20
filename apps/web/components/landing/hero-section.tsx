'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
            <Sparkles className="h-4 w-4" />
            <span>Made for Indian families</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Turn everyday savings into meaningful gold gifts
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 sm:text-xl md:mb-10">
            Save small amounts of gold daily with family and friends. Build saving streaks together. Gift accumulated gold on birthdays, festivals, and special occasions.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="group h-12 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 px-8 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/signin">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-2 border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 transition-all hover:border-amber-300 hover:bg-amber-50"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>No credit card required • Join 500+ families on the waitlist</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
    </section>
  );
}
