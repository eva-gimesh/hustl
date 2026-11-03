import React from 'react';
import { Hero } from '../components/home/Hero';
import { IntroductionSection } from '../components/home/IntroductionSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { FeaturedOpportunitiesSection } from '../components/home/FeaturedOpportunitiesSection';
import { TalentDiscoverySection } from '../components/home/TalentDiscoverySection';
import { WhyHustlSection } from '../components/home/WhyHustlSection';
import { FinalCtaSection } from '../components/home/FinalCtaSection';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {/* 1. Hero Section: Split-screen with custom asymmetric ecosystem HUD */}
      <Hero />

      {/* 2. Introduction Section: What is HUSTL? One Place. Three Ways to Move Forward. */}
      <IntroductionSection />

      {/* 3. The Process: From Ambition to Action (01, 02, 03) */}
      <HowItWorksSection />

      {/* 4. Opportunity Board: There's Something Out There For You */}
      <FeaturedOpportunitiesSection />

      {/* 5. Meet The Talent: The Next Big Thing Could Be Built By Someone Here */}
      <TalentDiscoverySection />

      {/* 6. Why HUSTL: Not Just Another Opportunity Platform */}
      <WhyHustlSection />

      {/* 7. Final Call to Action: You Have The Skills. Now Make Your Move. */}
      <FinalCtaSection />
    </div>
  );
};
