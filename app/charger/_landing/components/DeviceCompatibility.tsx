"use client";

import { motion } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

const devices = [
  { name: 'iPhone', power: 'Instant Pair', icon: '📱', category: 'Apple' },
  { name: 'Android', power: 'Bluetooth 5.3', icon: '📱', category: 'Phone' },
  { name: 'iPad', power: 'Instant Pair', icon: '📲', category: 'Tablet' },
  { name: 'Windows PC', power: 'Bluetooth 5.3', icon: '💻', category: 'Laptop' },
  { name: 'Mac', power: 'Instant Pair', icon: '💻', category: 'Apple' },
  { name: 'Smart TV', power: 'Bluetooth 5.3', icon: '📺', category: 'Home' },
  { name: 'Gaming', power: 'Low Latency', icon: '🎮', category: 'Console' },
  { name: 'Smartwatch', power: 'Bluetooth 5.3', icon: '⌚', category: 'Wearable' },
];

function DeviceCard({ device, index }: { device: typeof devices[0]; index: number }) {
  const { ref, inView } = useInView(0.1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group glass rounded-2xl p-6 text-center cursor-default hover:bg-white/[0.06] transition-colors duration-500"
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">
        {device.icon}
      </div>
      <h3 className="text-white font-medium text-sm mb-1">{device.name}</h3>
      <p className="text-nxtraa-accent text-xs font-mono mb-2">{device.power}</p>
      <span className="text-white/20 text-xs uppercase tracking-wider">{device.category}</span>
    </motion.div>
  );
}

export default function DeviceCompatibility() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);

  return (
    <section id="compatibility" className="relative py-32 md:py-48 bg-nxtraa-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Universal Sound
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            One Pair. Every Device.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            Bluetooth 5.3 connects instantly to any wireless device — Apple, Android, Windows and beyond.
          </motion.p>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {devices.map((device, i) => (
            <DeviceCard key={device.name} device={device} index={i} />
          ))}
        </div>

        {/* Brand logos strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {['Apple', 'Android', 'Windows', 'iOS', 'macOS', 'Smart TV', 'Gaming', 'Wearables'].map((brand) => (
            <span key={brand} className="text-white/15 text-sm uppercase tracking-[0.2em] font-light hover:text-white/30 transition-colors cursor-default">
              {brand}
            </span>
          ))}
        </motion.div>

        <div className="mt-32 glow-line" />
      </div>
    </section>
  );
}