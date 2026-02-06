'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            name: name.trim() || null
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already on the waitlist!');
        } else {
          setError('Something went wrong. Please try again.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setEmail('');
      setName('');

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50 py-16 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-200/30 via-transparent to-transparent" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 shadow-2xl backdrop-blur-sm md:p-12">
            <div className="text-center mb-8">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Join the Waitlist
              </h2>
              <p className="text-lg text-gray-600">
                Be the first to try Sonpari and start your gold savings journey
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  You're on the list!
                </h3>
                <p className="text-center text-gray-600">
                  We'll notify you when Sonpari launches. Check your inbox for a confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl border-gray-300 bg-white px-4 text-base transition-all focus:border-amber-500 focus:ring-amber-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="h-12 rounded-xl border-gray-300 bg-white px-4 text-base transition-all focus:border-amber-500 focus:ring-amber-500"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Get Early Access'
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  No spam. We respect your inbox.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
