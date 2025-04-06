'use client';

interface HeroSectionProps {
  apy: string;
  multiplier: string;
  lockupPeriod: number;
}

export const HeroSection = ({ apy, multiplier, lockupPeriod }: HeroSectionProps) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="p-8 md:p-12 text-white relative z-10">
        <h1 className="text-4xl md:text-5xl text-white font-extrabold mb-4">Maximize Your EACC</h1>
        <p className="text-xl md:text-2xl font-medium text-blue-100 mb-6">
          Earn up to 716% more with longer staking periods
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1">
            <p className="text-blue-200 font-medium">Current APY</p>
            <p className="text-3xl font-bold">{apy}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1">
            <p className="text-blue-200 font-medium">Your Multiplier</p>
            <p className="text-3xl font-bold">{parseFloat(multiplier).toFixed(4)}x</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1">
            <p className="text-blue-200 font-medium">Lock Period</p>
            <p className="text-3xl font-bold">{lockupPeriod} weeks</p>
          </div>
        </div>
      </div>

      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`
            }}
          />
        ))}
      </div>
    </div>
  );
};
