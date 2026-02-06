import { Gift, TrendingDown, MapPin } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      icon: Gift,
      title: 'Gold is for gifting',
      description: 'We gift gold on Diwali, weddings, birthdays, and celebrations. It\'s a tradition that matters.'
    },
    {
      icon: TrendingDown,
      title: 'Buying at once is hard',
      description: 'Saving ₹10,000-₹50,000 at once for gold jewelry feels impossible with daily expenses.'
    },
    {
      icon: MapPin,
      title: 'Stores don\'t help',
      description: 'Offline jewellers don\'t allow small, frequent purchases. You either buy big or not at all.'
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            The Gold Gifting Problem
          </h2>
          <p className="text-lg text-gray-600">
            Traditional gold buying doesn't fit modern life
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-amber-300 hover:shadow-lg md:p-8"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                  <problem.icon className="h-6 w-6" />
                </div>

                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {problem.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {problem.description}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
