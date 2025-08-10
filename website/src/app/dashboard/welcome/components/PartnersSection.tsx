'use client';
import Image from 'next/image';

const partners = [
  {
    id: 1,
    name: 'Arbius',
    logo: '/partners/arbius.webp',
    website: 'https://arbius.ai',
  },
  {
    id: 2,
    name: 'Unicrow',
    logo: '/partners/unicrow.png',
    website: 'https://unicrow.io',
  },
  {
    id: 3,
    name: 'Arbitrum',
    logo: '/partners/arbitrum.png',
    website: 'https://arbitrum.io',
  },
  {
    id: 4,
    name: 'IPFS',
    logo: '/partners/ipfs.png',
    website: 'https://ipfs.io',
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
        <div className="mt-8 flex items-center justify-center gap-4 md:gap-8">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center rounded-lg p-2 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="relative h-[57px] w-[125px] md:h-[80px] md:w-[175px] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  fill
                  className="object-contain filter dark:brightness-0 dark:invert"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
