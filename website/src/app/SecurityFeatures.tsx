import { Shield, Lock, Server, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/Card';

const features = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description:
      'All messages and sensitive data are encrypted using industry-standard protocols',
    highlights: ['AES-256 encryption', 'Zero-knowledge architecture'],
  },
  {
    icon: Shield,
    title: 'Smart Contract Audited',
    description:
      'Smart contracts audited by 0xguard for security and reliability',
    highlights: ['Professional audit', 'Bug bounty program'],
  },
  {
    icon: Server,
    title: 'Decentralized Storage',
    description: 'All data is stored on IPFS. EACC is unstoppable.',
    highlights: ['Censorship resistant', 'Always available'],
  },
];

export const SecurityFeatures = () => {
  return (
    <section className='bg-gray-50 py-20 dark:bg-gray-900/50'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center rounded-2xl bg-blue-100 p-3 dark:bg-blue-900/30'>
            <Shield className='h-8 w-8 text-blue-600 dark:text-blue-400' />
          </div>
          <h2 className='mt-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white'>
            Enterprise-Grade Security
          </h2>
          <p className='mt-4 text-lg text-gray-600 dark:text-gray-300'>
            Built from the ground up with security and privacy as core
            principles
          </p>
        </div>

        <div className='mt-12 grid gap-8 md:grid-cols-3'>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className='group relative overflow-hidden border-gray-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'
              >
                <CardContent className='pt-8'>
                  {/* Icon */}
                  <div className='mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 p-3 dark:from-blue-900/30 dark:to-indigo-900/30'>
                    <Icon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>

                  {/* Title */}
                  <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className='mb-4 text-gray-600 dark:text-gray-300'>
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <div className='space-y-2'>
                    {feature.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'
                      >
                        <CheckCircle className='h-4 w-4 text-green-500' />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover effect */}
                  <div className='absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100' />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional security note */}
        <div className='mt-12 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20'>
          <div className='flex flex-col items-center text-center md:flex-row md:text-left'>
            <div className='mb-4 md:mb-0 md:mr-6'>
              <Shield className='h-12 w-12 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex-1'>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                Security First Approach
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Our platform has been professionally audited by 0xguard to
                ensure the highest level of security. We maintain a transparent
                security posture with public audit reports and an active bug
                bounty program for continuous improvement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
