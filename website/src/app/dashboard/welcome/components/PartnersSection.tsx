// src/app/dashboard/welcome/components/PartnersSection.tsx
'use client';

import Image from 'next/image';

const partners = [
  {
    id: 1,
    name: 'Arbius',
    logo: '/partners/arbius.webp',
    website: 'https://arbius.ai',
    description: 'Decentralized AI compute',
  },
  {
    id: 2,
    name: 'Unicrow',
    logo: '/partners/unicrow.png',
    website: 'https://unicrow.io',
    description: 'Smart contract escrow',
  },
  {
    id: 3,
    name: 'Arbitrum',
    logo: '/partners/arbitrum.png',
    website: 'https://arbitrum.io',
    description: 'Layer 2 scaling solution',
  },
  {
    id: 4,
    name: 'IPFS',
    logo: '/partners/ipfs.png',
    website: 'https://ipfs.io',
    description: 'Decentralized storage',
  },
];

export const PartnersSection = () => {
  return (
    <section className="relative bg-white py-16 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Built With
          </h3>
        </div>

        <div className="mt-8 grid grid-cols-2 items-center gap-8 md:grid-cols-4">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center rounded-lg p-4 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="relative h-12 w-32 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  fill
                  className="object-contain filter dark:brightness-0 dark:invert"
                />
              </div>
              <span className="mt-2 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-400">
                {partner.description}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
