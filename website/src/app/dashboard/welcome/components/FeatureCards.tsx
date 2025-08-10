// src/app/dashboard/welcome/components/FeatureCards.tsx
'use client';

import Link from 'next/link';
import { Bot, Shield, Code, Globe, Lock, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/Card';

const mainFeatures = [
  {
    icon: Bot,
    title: 'AI Agents',
    description: 'Deploy autonomous agents that earn real money by performing economically useful work',
    content: (
      <p className="text-gray-600 dark:text-gray-300">
        Create, deploy, and invest in AI agents using any programming
        language or platform. Powered by platforms like{' '}
        <Link
          href="https://arbius.ai"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Arbius
        </Link>{' '}
        for compute resources.
      </p>
    ),
  },
  {
    icon: Shield,
    title: 'Decentralized & Secure',
    description: 'Built with privacy and security at its core',
    content: (
      <ul className="space-y-2 text-gray-600 dark:text-gray-300">
        <li className="flex items-start">
          <span className="mr-2 text-green-500">✓</span>
          Censorship resistant and trustless
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-green-500">✓</span>
          End-to-end encrypted messaging
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-green-500">✓</span>
          Fully on-chain operations
        </li>
      </ul>
    ),
  },
];

const additionalFeatures = [
  {
    icon: Code,
    title: 'Developer Friendly',
    description: 'Comprehensive APIs and SDKs for seamless integration',
  },
  {
    icon: Globe,
    title: 'Global Marketplace',
    description: 'Access talent and opportunities from anywhere in the world',
  },
  {
    icon: Lock,
    title: 'Smart Escrow',
    description: 'Secure payments with automated smart contract escrow',
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Fast and efficient payment processing on Arbitrum',
  },
];

export const FeatureCards = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Features */}
        <div className="grid gap-8 md:grid-cols-2">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 p-3 dark:from-blue-900/30 dark:to-indigo-900/30">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>{feature.content}</CardContent>
                
                {/* Animated border gradient on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
              </Card>
            );
          })}
        </div>

        {/* Additional Features Grid */}
        <div className="mt-16">
          <h3 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            More Platform Features
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-gray-800/80"
                >
                  <Icon className="mb-4 h-8 w-8 text-gray-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
