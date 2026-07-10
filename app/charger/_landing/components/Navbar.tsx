"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const SHOP_URL = 'https://nxtraa.online';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-black/50 backdrop-blur-2xl border-b border-white/5'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo → back to nxtraa.online */}
        <a
          href={SHOP_URL}
          aria-label="Nxtraa home"
          className="flex items-center group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-white.svg"
            alt="Nxtraa"
            width={132}
            height={26}
            className="h-6 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80 sm:h-7"
          />
        </a>

        {/* Single CTA — Shop → redirect to the official store */}
        <motion.a
          href={SHOP_URL}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="group inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Shop
          <ArrowUpRight
            size={15}
            strokeWidth={2.25}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </motion.a>
      </div>
    </motion.nav>
  );
}
