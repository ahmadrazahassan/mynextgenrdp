// src/app/page.tsx
import HeroSection from '@/components/HeroSection';
import RdpCardsSection from '@/components/RdpCardsSection';
import VpsCardsSection from '@/components/VpsCardsSection';
import FeaturesSection from '@/components/FeaturesSection';
import TeamSection from '@/components/TeamSection';
import MapSection from '@/components/MapSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FaqSection from '@/components/FaqSection';
import CtaSection from '@/components/CtaSection'; // Import CTA Section
import AnimatedCube from '@/components/AnimatedCube'; // Import our 3D Cube component

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="py-12 bg-gradient-to-b from-gray-900 to-gray-950 overflow-visible">
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">Advanced Technology</h2>
          <p className="text-center text-gray-300 max-w-2xl mx-auto mb-6">Powered by cutting-edge infrastructure and premium hardware</p>
          <AnimatedCube />
        </div>
      </div>
      <RdpCardsSection />
      <VpsCardsSection />
      <FeaturesSection />
      <TeamSection />
      <MapSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection /> {/* Add CTA Section Before Footer */}
    </>
  );
}