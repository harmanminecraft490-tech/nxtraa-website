"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

const specCategories = [
  {
    category: 'Audio',
    icon: '🎧',
    specs: [
      { label: 'Driver', value: '13mm Dynamic' },
      { label: 'Sound Signature', value: 'Premium Deep Bass' },
      { label: 'Microphone', value: 'ENC Noise Cancellation' },
      { label: 'Latency', value: 'Ultra-Low ~50ms' },
      { label: 'Controls', value: 'Intelligent Touch' },
    ],
  },
  {
    category: 'Connectivity',
    icon: '🔵',
    specs: [
      { label: 'Bluetooth', value: '5.3' },
      { label: 'Pairing', value: 'Automatic / Instant' },
      { label: 'Apple Support', value: 'iOS full compatibility' },
      { label: 'Android Support', value: 'Android & Windows' },
      { label: 'Auto Connect', value: 'Connects to any device' },
    ],
  },
  {
    category: 'Battery',
    icon: '🔋',
    specs: [
      { label: 'Total Playtime', value: 'Up to 40H (with case)' },
      { label: 'Per Charge', value: '5–6 Hours' },
      { label: 'Charging Port', value: 'Type-C Fast Charge' },
      { label: 'Charging Case', value: 'Included' },
      { label: 'Colours', value: 'Black & White' },
    ],
  },
  {
    category: 'Durability',
    icon: '🛡️',
    specs: [
      { label: 'Water Resistance', value: 'IPX5 Sweat / Splash' },
      { label: 'In the Box', value: 'FREE Silicone Case' },
      { label: 'Warranty', value: '1 Year' },
      { label: 'MRP', value: '₹1499' },
      { label: 'Model', value: 'Aerobuds NE AP-555' },
    ],
  },
];

function SpecCategory({ category, index }: { category: typeof specCategories[0]; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const { ref, inView } = useInView(0.1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 md:px-8 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{category.icon}</span>
          <span className="text-white font-medium text-lg">{category.category}</span>
          <span className="text-white/20 text-sm">{category.specs.length} specs</span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white/40 text-xl"
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-6">
              <div className="border-t border-white/5 pt-4 space-y-3">
                {category.specs.map((spec, i) => (
                  <motion.div
                    key={spec.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-white/40 text-sm">{spec.label}</span>
                    <span className="text-white/80 text-sm font-mono text-right">{spec.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SpecsSection() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);

  return (
    <section id="specs" className="relative py-32 md:py-48 bg-nxtraa-black">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Technical Details
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Specifications
          </motion.h2>
        </div>

        {/* Spec Categories */}
        <div className="space-y-3">
          {specCategories.map((cat, i) => (
            <SpecCategory key={cat.category} category={cat} index={i} />
          ))}
        </div>

        <div className="mt-32 glow-line" />
      </div>
    </section>
  );
}