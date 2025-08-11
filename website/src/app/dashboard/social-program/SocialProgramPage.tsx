// src/app/dashboard/social-program/SocialProgramPage.tsx
'use client';

import React, { useState, useMemo } from 'react';
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

            {/* Right side - Visual */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Placeholder for image - you can replace this with an actual image */}
                <div className="aspect-[4/3] lg:aspect-square bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1">
                  <div className="h-full w-full rounded-xl bg-gray-900 p-6 sm:p-8 flex items-center justify-center">
                    <div className="text-center">
                      {/* Animated graphic placeholder */}
                      <div className="relative mx-auto h-32 w-32 sm:h-48 sm:w-48">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse" />
                        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 animate-pulse animation-delay-200" />
                        <div className="absolute inset-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-40 animate-pulse animation-delay-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PiRocket className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
                        </div>
                      </div>
                      <p className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-white">Build. Create. Earn.</p>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">Contribute to the ecosystem</p>
                    </div>
                  </div>
                </div>
                {/* To use an actual image, replace the above div with:
                <img 
                  src="/path-to-your-image.jpg" 
                  alt="Social Growth Program" 
                  className="w-full h-full object-cover"
                />
                */}
              </div>
              
              {/* Floating badges */}
              <div className="absolute -left-2 sm:-left-4 top-4 sm:top-8 rounded-lg bg-white p-2 sm:p-3 shadow-lg dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Top Contributor</span>
                </div>
              </div>
              
              <div className="absolute -right-2 sm:-right-4 bottom-4 sm:bottom-8 rounded-lg bg-white p-2 sm:p-3 shadow-lg dark:bg-gray-800">
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
