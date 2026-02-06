import { Coins, Flame, Gift } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Coins,
      step: '1',
      title: 'Save Small, Daily',
      description: 'Start with as little as ₹50/day. Buy tiny fractions of gold automatically or manually.'
    },
    {
      icon: Flame,
      step: '2',
      title: 'Build Streaks Together',
      description: 'Save with family or friends. Track daily streaks. Compete, encourage, and grow together.'
    },
    {
      icon: Gift,
      step: '3',
      title: 'Gift on Special Days',
      description: 'Accumulate gold over time. Gift it on birthdays, festivals, weddings, or any celebration.'
    }
  ];

  return (
    <section className="bg-gradient-to-b from-white via-amber-50/30 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            How Sonpari Works
          </h2>
          <p className="text-lg text-gray-600">
            Three simple steps to make gold savings a habit
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center gap-6 md:flex-row md:items-start"
              >
                <div className="relative flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-2xl font-bold text-white shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-110 md:h-20 md:w-20">
                    {step.step}
                  </div>

                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-full hidden h-12 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-300 to-transparent md:block" />
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="mb-3 inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm md:mb-4">
                    <step.icon className="h-5 w-5 text-amber-600" />
                    <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-base text-gray-600 leading-relaxed md:text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
