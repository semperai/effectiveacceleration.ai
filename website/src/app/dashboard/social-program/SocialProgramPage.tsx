'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { 
  PiSparkle, 
  PiTrendUp, 
  PiUsers, 
  PiCoins,
  PiCalendarBlank,
  PiChartLine,
  PiRocket,
  PiHandshake,
  PiMegaphone,
} from 'react-icons/pi';
import { 
  Target,
  Users,
  Zap,
  Trophy,
  Gift,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { WeeklyDistributionData } from './types';
import { WeeklyDistribution } from './WeeklyDistribution';
import { StatsCard } from './StatsCard';
import { mockWeeklyData } from './mockData';

export default function SocialProgramPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([mockWeeklyData[0]?.weekNumber]));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of hero images
  const heroImages = [
    '/social-hero-1.webp',
    '/social-hero-2.webp',
    '/social-hero-3.webp',
    '/social-hero-4.webp',
    '/social-hero-5.webp',
  ];

  // Auto-transition images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalDistributed = mockWeeklyData.reduce((sum, week) => sum + week.totalDistributed, 0);
    const totalContributors = new Set(
      mockWeeklyData.flatMap(week => week.contributors.map(c => c.address))
    ).size;
    const weeksCompleted = mockWeeklyData.length;
    const weeksRemaining = 52 - weeksCompleted;

    return {
      totalDistributed,
      totalContributors,
      weeksCompleted,
      weeksRemaining,
      weeklyAverage: totalDistributed / weeksCompleted
    };
  }, []);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full width like welcome page */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute right-20 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left side - Content */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 backdrop-blur-sm">
                <PiSparkle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  10% of Total Supply Allocated
                </span>
              </div>
              
              <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl dark:text-gray-100">
                Social Growth
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
                  Program
                </span>
              </h1>
              
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Rewarding the builders, creators, and evangelists who grow the Effective Acceleration ecosystem. 
                Every week, EACC tokens are distributed to top contributors based on their measurable impact.
              </p>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Program Progress</span>
                  <span className="text-blue-600 dark:text-blue-400">{totals.weeksCompleted} of 52 weeks</span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden"
                    style={{ width: `${(totals.weeksCompleted / 52) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200/50 bg-white/50 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30 flex-shrink-0">
                      <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
                        {totals.totalDistributed.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">EACC Distributed</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200/50 bg-white/50 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30 flex-shrink-0">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {totals.totalContributors}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contributors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Visual with Image Carousel */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] lg:aspect-square relative">
                  {/* Image Carousel */}
                  {heroImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image 
                        src={image}
                        alt={`Social Growth Program - ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                        quality={90}
                      />
                    </div>
                  ))}
                  
                  {/* Gradient Overlays - Multiple layers for depth */}
                  {/* Base gradient for overall tint */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-pink-600/40" />
                  
                  {/* Directional gradients for edge darkening */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
                  
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                  
                  {/* Optional: Mesh gradient for more organic look */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500/30 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/30 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-pink-500/30 blur-2xl" />
                  </div>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'w-8 bg-white' 
                            : 'w-2 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -left-2 sm:-left-4 top-4 sm:top-8 rounded-lg bg-white/95 backdrop-blur-sm p-2 sm:p-3 shadow-lg dark:bg-gray-800/95 border border-white/20">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Top Contributor</span>
                </div>
              </div>
              
              <div className="absolute -right-2 sm:-right-4 bottom-4 sm:bottom-8 rounded-lg bg-white/95 backdrop-blur-sm p-2 sm:p-3 shadow-lg dark:bg-gray-800/95 border border-white/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Weekly Rewards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            How It Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <PiMegaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                1. Create & Share
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Produce content, build tools, or grow the community. Every contribution matters - from tweets to tutorials, 
                from code to collaborations.
              </p>
            </div>
            
            <div className="rounded-xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                2. AI Evaluation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our proprietary AI system evaluates contributions based on quality, reach, engagement, and overall impact 
                on ecosystem growth.
              </p>
            </div>
            
            <div className="rounded-xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50">
              <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                3. Earn Rewards
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Top contributors receive EACC tokens every week. All distributions are transparent and recorded on-chain 
                for complete accountability.
              </p>
            </div>
          </div>
        </div>

        {/* Contribution Categories */}
        <div className="mb-12 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Contribution Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <PiSparkle className="h-5 w-5" />, title: 'Content Creation', desc: 'Articles, videos, tutorials' },
              { icon: <PiUsers className="h-5 w-5" />, title: 'Community Building', desc: 'Events, moderation, support' },
              { icon: <PiRocket className="h-5 w-5" />, title: 'Open Source', desc: 'Agents, tools, integrations' },
              { icon: <PiHandshake className="h-5 w-5" />, title: 'Partnerships', desc: 'Collaborations, outreach' },
            ].map((category, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="rounded-lg bg-white/50 p-2 dark:bg-gray-800/50">
                  <div className="text-blue-500">{category.icon}</div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{category.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{category.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12 grid gap-4 rounded-2xl border border-gray-200/50 bg-white/50 p-8 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Transparent & Fair</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All distributions are public and verifiable on-chain
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Merit-Based</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rewards based on actual impact, not popularity
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Weekly Payouts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consistent rewards every week for 52 weeks
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatsCard
            icon={<PiCoins className="h-5 w-5" />}
            title="Total Distributed"
            value={`${totals.totalDistributed.toLocaleString()} EACC`}
            subtitle="Across all weeks"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            icon={<PiUsers className="h-5 w-5" />}
            title="Total Contributors"
            value={totals.totalContributors.toString()}
            subtitle="Unique participants"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            icon={<PiCalendarBlank className="h-5 w-5" />}
            title="Weeks Remaining"
            value={totals.weeksRemaining.toString()}
            subtitle={`${totals.weeksCompleted} completed`}
          />
          <StatsCard
            icon={<PiChartLine className="h-5 w-5" />}
            title="Weekly Average"
            value={`${Math.round(totals.weeklyAverage).toLocaleString()} EACC`}
            subtitle="Per week distribution"
          />
        </div>

        {/* Section Header for Distributions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Weekly Distributions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track token distributions to community contributors each week
          </p>
        </div>

        {/* Weekly Distributions */}
        <div className="space-y-4">
          {mockWeeklyData
            .sort((a, b) => b.weekNumber - a.weekNumber)
            .map((week) => (
              <WeeklyDistribution
                key={week.weekNumber}
                weekData={week}
                isExpanded={expandedWeeks.has(week.weekNumber)}
                onToggle={() => toggleWeek(week.weekNumber)}
              />
            ))}
        </div>

        {/* Empty state */}
        {mockWeeklyData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No distributions yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
