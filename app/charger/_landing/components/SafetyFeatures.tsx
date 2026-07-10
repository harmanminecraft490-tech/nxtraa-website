"use client";

import {} from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

const features = [
  {
    icon: '💧',
    title: 'IPX5 Water Resistant',
    description: 'Sweat and splash proof design keeps every workout and rainy commute worry-free.',
    detail: 'IPX5 rated protection',
  },
  {
    icon: '🎙️',
    title: 'ENC Clear Calls',
    description: 'Environmental Noise Cancellation isolates your voice for crystal-clear conversations.',
    detail: 'Dual-mic noise reduction',
  },
  {
    icon: '📶',
    title: 'Auto Pairing',
    description: 'Bluetooth 5.3 instantly reconnects the moment you open the charging case.',
    detail: 'Instant pairing every time',
  },
  {
    icon: '🎧',
    title: 'Secure Fit',
    description: 'Ergonomic silicone tips lock in place for all-day comfort and stability.',
    detail: 'FREE silicone case included',
  },
  {
    icon: '✋',
    title: 'Intelligent Touch',
    description: 'Intuitive touch controls manage music, calls and gaming mode with a single tap.',
    detail: 'Ultra-low latency ~50ms',
  },
  {
    icon: '🛡️',
    title: '1 Year Warranty',
    description: 'Every pair is backed by a full year of brand assurance and dedicated support.',
    detail: '12 months coverage',
  },
];

function ShieldAnimation() {
  const { ref, inView } = useInView(0.2);

  return (
    <div ref={ref} className="relative w-64 h-64 mx-auto">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 rounded-full border border-nxtraa-accent/20"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-6 rounded-full border border-nxtraa-accent/30"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-12 rounded-full border border-nxtraa-accent/40"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nxtraa-accent/20 to-nxtraa-glow/10 border border-nxtraa-accent/30 flex items-center justify-center backdrop-blur-sm">
          <span className="text-4xl">🛡️</span>
        </div>
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full border border-nxtraa-accent/20"
      />
      <div className="absolute inset-0 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(34, 211, 238,0.3), transparent 70%)' }}
      />
    </div>
  );
}

function SafetyCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { ref, inView } = useInView(0.1);

  return (
    <motion.div
      ref={ref}
      key={feature.title}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="glass rounded-2xl p-6 cursor-default hover:bg-white/[0.06] transition-all duration-500"
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl mt-1">{feature.icon}</div>
        <div>
          <h3 className="text-white font-medium mb-2">{feature.title}</h3>
          <p className="text-white/40 text-sm leading-relaxed mb-3">{feature.description}</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-green-400/70 text-xs font-mono">{feature.detail}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SafetyFeatures() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);

  return (
    <section id="safety" className="relative py-32 md:py-48 bg-nxtraa-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Built to Last
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Reliability Without Compromise
          </motion.h2>
        </div>

        <div className="mb-20">
          <ShieldAnimation />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <SafetyCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        <div className="mt-32 glow-line" />
      </div>
    </section>
  );
}