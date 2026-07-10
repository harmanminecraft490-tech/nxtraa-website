"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

const playtimeData = [
  { hours: 40, label: 'Aerobuds NE AP-555', time: 6, color: '#22d3ee', full: 100 },
  { hours: 22, label: 'Typical TWS', time: 4, color: '#666', full: 55 },
  { hours: 15, label: 'Basic Earbuds', time: 3, color: '#333', full: 37 },
];

const powerFeatures = [
  { label: 'Playtime', power: '40H', protocol: 'With Charging Case', color: '#22d3ee' },
  { label: 'Driver', power: '13mm', protocol: 'Deep Bass / ENC', color: '#00d4ff' },
  { label: 'Bluetooth', power: '5.3', protocol: 'Auto-Pair / 50ms', color: '#00ff88' },
];

export default function ChargingComparison() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);
  const { ref: chartRef, inView: chartInView } = useInView(0.15);
  const { ref: portsRef, inView: portsInView } = useInView(0.15);
  const [activePort, setActivePort] = useState(0);

  return (
    <section id="performance" className="relative py-32 md:py-48 bg-nxtraa-black overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Endless Listening
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Playtime That Never Quits
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            Up to 40 hours of music with the charging case. Nearly double a typical pair of earbuds.
          </motion.p>
        </div>

        {/* Charging Time Chart */}
        <div ref={chartRef} className="max-w-3xl mx-auto mb-24">
          <div className="space-y-8">
            {playtimeData.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -40 }}
                animate={chartInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl font-bold" style={{ color: item.color }}>
                      {item.hours}H
                    </span>
                    <span className="text-white/50 text-sm">{item.label}</span>
                  </div>
                  <span className="text-white/40 text-sm font-mono">{item.time}H per charge</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={chartInView ? { width: `${item.full}%` } : {}}
                    transition={{ duration: 1.5, delay: i * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full relative"
                    style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
                  >
                    {i === 0 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-pulse"
                        style={{ background: item.color, boxShadow: `0 0 20px ${item.color}` }}
                      />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Power Distribution */}
        <div ref={portsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {powerFeatures.map((port, i) => (
            <motion.div
              key={port.label}
              initial={{ opacity: 0, y: 40 }}
              animate={portsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              onMouseEnter={() => setActivePort(i)}
              className={`glass rounded-2xl p-8 cursor-default transition-all duration-500 ${
                activePort === i ? 'bg-white/[0.06] scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ background: port.color }} />
                <span className="text-white/60 text-sm uppercase tracking-wider">{port.label}</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{port.power}</div>
              <div className="text-white/30 text-sm font-mono">{port.protocol}</div>

              {/* Animated power indicator */}
              <div className="mt-6 flex gap-1">
                {[...Array(10)].map((_, j) => (
                  <motion.div
                    key={j}
                    animate={activePort === i ? {
                      opacity: [0.2, 1, 0.2],
                      scaleY: [0.5, 1, 0.5],
                    } : { opacity: 0.1 }}
                    transition={{
                      duration: 1,
                      delay: j * 0.08,
                      repeat: activePort === i ? Infinity : 0,
                    }}
                    className="w-full h-8 rounded-sm origin-bottom"
                    style={{ background: port.color }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 glow-line" />
      </div>
    </section>
  );
}