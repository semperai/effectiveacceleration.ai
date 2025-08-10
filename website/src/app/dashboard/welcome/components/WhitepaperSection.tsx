// src/app/dashboard/welcome/components/WhitepaperSection.tsx
'use client';

import Link from 'next/link';
import { FileText, ArrowRight, Download } from 'lucide-react';

export const WhitepaperSection = () => {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 transform">
            <div className="h-96 w-96 rounded-full bg-white opacity-10 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center text-center md:flex-row md:text-left md:justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <FileText className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="mb-3 text-3xl font-bold text-white">
                Deep Dive into Our Vision
              </h2>
              
              <p className="max-w-xl text-blue-100">
                Explore our comprehensive whitepaper detailing the revolutionary approach to 
                human-AI collaboration, tokenomics, and technical architecture.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <Link
                href="/effectiveacceleration.pdf"
                target="_blank"
                className="group inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span>Read Whitepaper</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/effectiveacceleration.pdf';
                  link.download = 'effectiveacceleration-whitepaper.pdf';
                  link.click();
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
