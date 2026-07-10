"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StatsStrip from './components/StatsStrip';
import ComponentSection from './components/ComponentSection';
import ChargingComparison from './components/ChargingComparison';
import MarqueeStrip from './components/MarqueeStrip';
import DeviceCompatibility from './components/DeviceCompatibility';
import HeatDissipation from './components/HeatDissipation';
import SafetyFeatures from './components/SafetyFeatures';
import ChargingAnimation from './components/ChargingAnimation';
import LifestyleSection from './components/LifestyleSection';
import SpecsSection from './components/SpecsSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + Math.random() * 18 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-nxtraa-black flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.svg"
          alt="Nxtraa"
          width={160}
          height={32}
          className="h-8 w-auto object-contain mx-auto mb-6"
        />
        <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-12">Sound Redefined</p>

        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-nxtraa-accent to-nxtraa-glow rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-white/20 text-xs mt-4 font-mono">
          {Math.min(Math.floor(progress), 100)}%
        </p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Persistent Shop CTA docked to the bottom on phones. Appears once the user
 * scrolls past the hero so a tap-to-buy is always one thumb away → maximises
 * conversion into the official store. Hidden on desktop (navbar covers it).
 */
function MobileShopBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 md:hidden"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,10,0.96), rgba(10,10,10,0.6) 70%, transparent)',
          }}
        >
          <a
            href="https://nxtraa.online"
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-nxtraa-accent to-nxtraa-glow px-8 py-4 text-base font-bold uppercase tracking-wide text-nxtraa-black shadow-[0_12px_40px_-8px_rgba(34,211,238,0.7)] active:scale-[0.97] transition-transform"
          >
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/30 [animation:shimmer_2.8s_ease-in-out_infinite]" />
            </span>
            <span className="relative">Shop Now</span>
            <ArrowRight size={18} strokeWidth={2.5} className="relative" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const handleComplete = useCallback(() => setLoading(false), []);

  // Tag <body> so global app chrome (white mobile tab bar + its padding) is
  // suppressed and the launch page reads as a full-bleed dark reveal.
  useEffect(() => {
    document.body.classList.add('charger-page');
    return () => document.body.classList.remove('charger-page');
  }, []);

  return (
    <div className="bg-nxtraa-black text-nxtraa-white">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={handleComplete} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Navbar />
          <main>
            <HeroSection />
            <StatsStrip />
            <ComponentSection />
            <ChargingComparison />
            <MarqueeStrip />
            <DeviceCompatibility />
            <HeatDissipation />
            <SafetyFeatures />
            <ChargingAnimation />
            <LifestyleSection />
            <SpecsSection />
            <FAQSection />
          </main>
          <Footer />
          <MobileShopBar />
        </motion.div>
      )}
    </div>
  );
}
