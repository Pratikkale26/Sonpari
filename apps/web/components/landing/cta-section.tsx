import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
    return (
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 shadow-2xl backdrop-blur-sm md:p-12">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Ready to start saving?
                        </h2>
                        <p className="mb-8 text-lg text-gray-600">
                            Join Sonpari today and start your gold savings journey. Turn your everyday savings into meaningful digital gold.
                        </p>

                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    className="group h-12 w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-8 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40"
                                >
                                    Create Account
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-6 text-sm text-gray-500">
                            No credit card required to sign up.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
