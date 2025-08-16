import React from 'react';
import { Layout } from '@/components/Dashboard/Layout';

// Import all components
import { Hero } from './welcome/Hero';
import { PartnersSection } from './welcome/PartnersSection';
import { WhitepaperSection } from './welcome/WhitepaperSection';
import { SecurityFeatures } from './welcome/SecurityFeatures';
import { TokenSection } from './welcome/TokenSection';
import { FeatureCards } from './welcome/FeatureCards';
import { AIArbitrationDAO } from './welcome/AIArbitrationDAO';
import { CommunitySection } from './welcome/CommunitySection';
import { DeveloperCTA } from './welcome/DeveloperCTA';
// import { PlatformStats } from './PlatformStats'; // Ready for future use

export default function WelcomePage() {
  return (
    <Layout borderless hiddenSidebar>
      <div className='min-h-screen bg-white dark:bg-gray-900'>
        {/* Hero Section with Partners */}
        <Hero />
        <PartnersSection />

        {/* Main Content Sections */}
        <div className='relative'>
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
