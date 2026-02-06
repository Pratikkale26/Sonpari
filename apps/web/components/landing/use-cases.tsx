import { Users, Sparkles, Trophy, Heart } from 'lucide-react';

export function UseCases() {
  const cases = [
    {
      icon: Users,
      title: 'Family Gold Savings',
      description: 'Parents and children save together for weddings, education, or emergency funds.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Sparkles,
      title: 'Festival Gifting',
      description: 'Build gold reserves throughout the year for Diwali, Raksha Bandhan, or Akshaya Tritiya.',
      color: 'from-amber-600 to-yellow-500'
    },
    {
      icon: Trophy,
      title: 'Group Challenges',
      description: 'Friends compete on saving streaks and gift gold to the winner or split it equally.',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: Heart,
      title: 'Milestone Gifts',
      description: 'Save gold for birthdays, anniversaries, graduations, or baby showers.',
      color: 'from-orange-500 to-amber-600'
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Perfect For Every Occasion
          </h2>
          <p className="text-lg text-gray-600">
            From family traditions to friend celebrations
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {cases.map((useCase, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-transparent hover:shadow-2xl"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-5`} />
                </div>

                <div className="relative">
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${useCase.color} text-white shadow-lg`}>
                    <useCase.icon className="h-7 w-7" />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {useCase.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {useCase.description}
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
