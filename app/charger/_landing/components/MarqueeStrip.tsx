"use client";

import { motion } from 'framer-motion';

const words = [
  'TWS',
  '•',
  'ENC',
  '•',
  'DEEP BASS',
  '•',
  'BLUETOOTH 5.3',
  '•',
  'IPX5',
  '•',
  'TOUCH CONTROL',
  '•',
  '40H PLAYTIME',
  '•',
  'TYPE-C',
  '•',
  'AUTO PAIR',
  '•',
  'LOW LATENCY',
  '•',
];

export default function MarqueeStrip() {
  const text = words.join('   ');

  return (
    <div className="relative py-6 bg-nxtraa-black border-y border-white/5 overflow-hidden">
      <div className="flex">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-0 whitespace-nowrap shrink-0"
        >
          <span className="text-white/10 text-sm tracking-[0.3em] font-light px-4">{text}</span>
          <span className="text-white/10 text-sm tracking-[0.3em] font-light px-4">{text}</span>
          <span className="text-white/10 text-sm tracking-[0.3em] font-light px-4">{text}</span>
          <span className="text-white/10 text-sm tracking-[0.3em] font-light px-4">{text}</span>
        </motion.div>
      </div>
    </div>
  );
}