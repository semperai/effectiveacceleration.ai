// src/app/dashboard/welcome/components/AIArbitrationDAO.tsx
'use client';

import Link from 'next/link';
import { Scale, Gavel, Vote, RefreshCw, ArrowRight, Brain, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/Card';

const features = [
  {
    icon: Gavel,
    color: 'green',
    title: 'Fair Dispute Resolution',
    description: 'AI-powered arbitration ensures unbiased, quick, and cost-effective resolution of disputes between parties',
  },
  {
    icon: Vote,
    color: 'purple',
    title: 'Community Governance',
    description: 'EACC token holders govern the arbitration process, voting on protocol upgrades and policy changes',
  },
  {
    icon: RefreshCw,
    color: 'blue',
    title: 'Flexible Integration',
    description: 'Choose between AI arbitration or traditional providers while maintaining full platform compatibility',
  },
];

const steps = [
  {
    number: 1,
    title: 'Dispute Filed',
    description: 'Party raises a dispute through the platform',
    icon: Users,
  },
  {
    number: 2,
    title: 'Evidence Collection',
    description: 'AI systems gather and analyze relevant data',
    icon: Brain,
  },
  {
    number: 3,
    title: 'Decision Making',
    description: 'AI arbitrators review and process the case',
    icon: Scale,
  },
  {
    number: 4,
    title: 'Resolution',
    description: 'Final decision enforced through smart contracts',
    icon: Zap,
  },
];

export const AIArbitrationDAO = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-100 to-blue-100 p-3 dark:from-indigo-900/30 dark:to-blue-900/30">
            <Scale className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <h2 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            AI Arbitration DAO
          </h2>
          
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            The world's first decentralized arbitration system powered by AI and
            governed by the community
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colorClasses = {
              green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
              purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
              blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            };

            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <CardContent className="pt-8">
                  <div className={`mb-4 inline-flex items-center justify-center rounded-xl p-3 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How It Works Section */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100 p-8 dark:from-gray-800 dark:to-gray-900 md:p-12">
          <h3 className="mb-12 text-center text-2xl font-bold text-gray-900 dark:text-white">
            How AI Arbitration Works
          </h3>

          <div className="relative">
            {/* Connection line for desktop */}
            <div className="absolute left-0 right-0 top-1/2 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 dark:from-blue-800 dark:via-indigo-700 dark:to-purple-800 md:block" />

            <div className="grid gap-8 md:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative">
                    <div className="flex flex-col items-center text-center">
                      {/* Step number with icon */}
                      <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                        <Icon className="h-8 w-8" />
                        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600 dark:bg-gray-900 dark:text-indigo-400">
                          {step.number}
                        </span>
                      </div>

                      <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 shadow-2xl md:p-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <h3 className="mb-2 text-2xl font-bold text-white">
                Ready to Learn More?
              </h3>
              <p className="text-blue-100">
                Discover how our AI Arbitration DAO is revolutionizing dispute resolution
              </p>
            </div>
            <Link
              href="https://docs.effectiveacceleration.ai"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              View Documentation
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
