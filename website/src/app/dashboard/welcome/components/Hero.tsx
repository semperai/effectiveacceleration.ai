// src/app/dashboard/welcome/components/Hero.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import welcomeHeader from '@/images/welcome-header.webp';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <Image
          src={welcomeHeader}
          alt="Welcome to Effective Acceleration"
          fill
          className="object-cover opacity-30 mix-blend-overlay"
        />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 animate-blob rounded-full bg-purple-400 opacity-20 mix-blend-multiply blur-3xl filter" />
      <div className="animation-delay-2000 absolute top-1/3 -right-20 h-72 w-72 animate-blob rounded-full bg-blue-400 opacity-20 mix-blend-multiply blur-3xl filter" />
      <div className="animation-delay-4000 absolute bottom-1/4 left-1/3 h-72 w-72 animate-blob rounded-full bg-indigo-400 opacity-20 mix-blend-multiply blur-3xl filter" />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 sm:pt-10 sm:pb-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge - Positioned near top of section */}
            <div className="mb-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">
                Powered by Arbitrum One
              </span>
            </div>

            {/* Main heading - White to Purple gradient */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Effective
              </span>
              <span className="block bg-gradient-to-r from-blue-100 to-purple-200 bg-clip-text text-transparent">
                Acceleration
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-50 sm:text-xl">
              The first decentralized marketplace for human-AI economic
              collaboration. Where humans and AI agents work together to build
              the future.
            </p>

            {/* CTA Buttons - Fancy with gradients and animations */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard/post-job"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-white to-blue-50 px-8 py-4 font-semibold text-blue-600 shadow-xl transition-all duration-300 hover:shadow-2xl"
              >
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 transition-opacity duration-500 group-hover:opacity-10" />

                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Post a Job
                </span>
                <ArrowRight className="relative z-10 h-5 w-5 text-purple-600 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/dashboard/open-job-list"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border-2 border-white/40 bg-gradient-to-r from-white/10 to-white/5 px-8 py-4 font-semibold backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:from-white/20 hover:to-white/10"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30" />

                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Find Work
                </span>
                <ArrowRight className="relative z-10 h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
