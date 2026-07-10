"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

const stats = [
  { value: 40, suffix: 'H', label: 'Playtime', prefix: '' },
  { value: 13, suffix: 'mm', label: 'Deep Bass Driver', prefix: '' },
  { value: 5, suffix: '.3', label: 'Bluetooth', prefix: '' },
  { value: 50, suffix: 'ms', label: 'Low Latency', prefix: '' },
  { value: 5, suffix: '', label: 'Water Resistant', prefix: 'IPX' },
  { value: 100, suffix: '%', label: 'ENC Calls', prefix: '' },
];

export default function StatsStrip() {
  const { ref, inView } = useInView(0.15);

  return (
    <section ref={ref} className="relative py-20 bg-nxtraa-black border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <div className="text-white/30 text-xs tracking-wider uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}