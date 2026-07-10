"use client";

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, Gem, Lock } from 'lucide-react';
import { useInView } from '../hooks/useScrollProgress';

const SHOP_URL = 'https://nxtraa.online';

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: 'Warranty', sub: '2-year cover' },
  { icon: Truck, label: 'Fast Delivery', sub: 'Shipped in 24h' },
  { icon: Gem, label: 'Premium Quality', sub: 'Deep-bass drivers' },
  { icon: Lock, label: 'Secure Shopping', sub: 'Protected checkout' },
];

export default function Footer() {
  const { ref, inView } = useInView(0.1);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-nxtraa-black border-t border-white/5">
      {/* Ambient cyan glow */}
      <div
        className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/3 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.10), transparent 70%)' }}
      />

      {/* Final conversion section */}
      <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-6"
        >
          Available Now
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-5 tracking-tighter"
        >
          Sound Redefined.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/45 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed"
        >
          The Nxtraa Aerobuds NE AP-555. True wireless sound with 40 hours of
          playtime, ENC calls and IPX5 protection — engineered for the way you move.
        </motion.p>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mb-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {HIGHLIGHTS.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="glass rounded-2xl px-4 py-5 flex flex-col items-center text-center transition-colors duration-500 hover:border-nxtraa-accent/30"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-nxtraa-accent/10 text-nxtraa-accent">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <span className="text-white text-sm font-semibold tracking-tight">{label}</span>
              <span className="mt-1 text-white/35 text-xs">{sub}</span>
            </div>
          ))}
        </motion.div>

        {/* The irresistible SHOP NOW button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-5"
        >
          <a href={SHOP_URL} className="group relative inline-flex">
            {/* Ripple rings */}
            <span className="pointer-events-none absolute inset-0 rounded-full bg-nxtraa-accent/40 opacity-0 [animation:shop-ripple_2.4s_ease-out_infinite] group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-nxtraa-accent/30 opacity-0 [animation:shop-ripple_2.4s_ease-out_infinite_0.8s] group-hover:opacity-100" />

            <motion.span
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="relative z-10 inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-nxtraa-accent to-nxtraa-glow px-12 py-5 text-lg font-bold uppercase tracking-wide text-nxtraa-black shadow-[0_20px_60px_-15px_rgba(34,211,238,0.65)] transition-shadow duration-500 group-hover:shadow-[0_28px_80px_-12px_rgba(34,211,238,0.8)]"
            >
              {/* Shimmer sweep */}
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/30 [animation:shimmer_2.8s_ease-in-out_infinite]" />
              </span>
              <span className="relative">Shop Now</span>
              <ArrowRight
                size={20}
                strokeWidth={2.5}
                className="relative transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </motion.span>
          </a>
          <p className="text-white/30 text-sm">
            Continue on nxtraa.online · Warranty · Fast delivery · Secure checkout
          </p>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <a href={SHOP_URL} className="flex items-center" aria-label="Nxtraa">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-white.svg" alt="Nxtraa" width={104} height={21} className="h-5 w-auto object-contain opacity-70" />
            </a>

            <div className="flex items-center gap-6">
              {['Shop', 'Support', 'Warranty', 'Privacy'].map((link) => (
                <a
                  key={link}
                  href={SHOP_URL}
                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>

            <p className="text-white/20 text-xs">
              © 2026 Nxtraa. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Oversized watermark */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        <span className="text-[20vw] font-bold text-white/[0.015] tracking-tighter">
          NXTRAA
        </span>
      </div>
    </footer>
  );
}
