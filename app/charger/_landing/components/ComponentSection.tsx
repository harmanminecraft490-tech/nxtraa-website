"use client";

// Component Section
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

const components = [
  {
    name: '13mm Driver',
    subtitle: 'Dynamic Acoustic Engine',
    description: 'A large 13mm dynamic driver delivers premium sound with deep, resonant bass and crisp, detailed highs across every track.',
    icon: '🎵',
    color: '#22d3ee',
    stat: '13mm',
    statLabel: 'Driver',
  },
  {
    name: 'ENC Mics',
    subtitle: 'Environmental Noise Cancellation',
    description: 'Precision microphones with ENC intelligently suppress background noise, keeping your voice crystal-clear on every call.',
    icon: '🎙️',
    color: '#00d4ff',
    stat: 'ENC',
    statLabel: 'Clear Calls',
  },
  {
    name: 'Bluetooth 5.3 Chip',
    subtitle: 'Instant Wireless Link',
    description: 'Bluetooth 5.3 enables automatic instant pairing and a rock-solid connection to any Windows, Android, or Apple device.',
    icon: '🔗',
    color: '#00ff88',
    stat: '5.3',
    statLabel: 'Bluetooth',
  },
  {
    name: 'Touch Sensor',
    subtitle: 'Intelligent Touch Control',
    description: 'Responsive capacitive sensors let you play, pause, skip tracks, and take calls with a simple, intuitive tap.',
    icon: '👆',
    color: '#ffaa00',
    stat: '50ms',
    statLabel: 'Low Latency',
  },
  {
    name: 'Battery Cell',
    subtitle: 'All-Day Endurance',
    description: 'High-density cells deliver 5-6 hours per charge and up to 40 hours of total playtime with the charging case.',
    icon: '🔋',
    color: '#ff6b6b',
    stat: '40h',
    statLabel: 'Playtime',
  },
  {
    name: 'Charging Case',
    subtitle: 'Type-C Fast Charging',
    description: 'A pocketable case with Type-C fast charging tops up your buds on the go, keeping the music playing all day long.',
    icon: '💧',
    color: '#b87333',
    stat: 'IPX5',
    statLabel: 'Sweat Proof',
  },
];

function ComponentCard({ item, index }: { item: typeof components[0]; index: number }) {
  const { ref, inView } = useInView(0.2);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="glass rounded-2xl p-6 md:p-8 h-full hover:bg-white/[0.06] transition-all duration-500 cursor-default">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${item.color}08, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div className="text-3xl mb-4">{item.icon}</div>

          {/* Stat */}
          <div className="mb-4">
            <span
              className="text-4xl md:text-5xl font-bold"
              style={{ color: item.color }}
            >
              {item.stat}
            </span>
            <span className="text-white/40 text-sm ml-2">{item.statLabel}</span>
          </div>

          {/* Name */}
          <h3 className="text-xl font-semibold text-white mb-1">{item.name}</h3>
          <p className="text-nxtraa-accent/80 text-xs tracking-wider uppercase mb-3">{item.subtitle}</p>

          {/* Description */}
          <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
        </div>

        {/* Accent line */}
        <div
          className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: `linear-gradient(90deg, transparent, ${item.color}40, transparent)` }}
        />
      </div>
    </motion.div>
  );
}

export default function ComponentSection() {
  const { ref: titleRef, inView: titleInView } = useInView(0.2);

  return (
    <section id="technology" className="relative py-32 md:py-48 bg-nxtraa-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Inside the Buds
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Precision Engineering
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-lg max-w-2xl mx-auto"
          >
            Every component is carefully tuned and assembled to deliver
            uncompromising sound in a lightweight, pocketable form factor.
          </motion.p>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {components.map((item, i) => (
            <ComponentCard key={item.name} item={item} index={i} />
          ))}
        </div>

        {/* Divider */}
        <div className="mt-32 glow-line" />
      </div>
    </section>
  );
}