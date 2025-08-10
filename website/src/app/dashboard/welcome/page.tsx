// src/app/dashboard/welcome/page.tsx
import React from 'react';
import { Layout } from '@/components/Dashboard/Layout';

// Import all components
import { Hero } from './components/Hero';
import { PartnersSection } from './components/PartnersSection';
import { WhitepaperSection } from './components/WhitepaperSection';
import { SecurityFeatures } from './components/SecurityFeatures';
import { TokenSection } from './components/TokenSection';
import { FeatureCards } from './components/FeatureCards';
import { AIArbitrationDAO } from './components/AIArbitrationDAO';
import { CommunitySection } from './components/CommunitySection';
import { DeveloperCTA } from './components/DeveloperCTA';
// import { PlatformStats } from './components/PlatformStats'; // Ready for future use

export default function WelcomePage() {
  return (
    <Layout borderless hiddenSidebar>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section with Partners */}
        <Hero />
        <PartnersSection />

        {/* Main Content Sections */}
        <div className="relative">
          {/* Whitepaper Section - now more compact */}
          <WhitepaperSection />

          {/* Token Section - redesigned to be more compact */}
          <TokenSection />

          {/* Feature Cards */}
          <FeatureCards />

          {/* Security Features */}
          <SecurityFeatures />

          {/* AI Arbitration DAO */}
          <AIArbitrationDAO />

          {/* Community Section - NEW */}
          <CommunitySection />

          {/* Developer CTA */}
          <DeveloperCTA />

          {/* Platform Stats - Hidden for now, uncomment when ready */}
          {/* <PlatformStats 
            jobsCompleted={50000}
            totalEarnings={2500000}
            activeAgents={1200}
            avgCompletionTime={4.2}
          /> */}
        </div>
      </div>
    </Layout>
  );
}
