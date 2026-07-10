"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

const faqs = [
  {
    question: 'How long does the battery last on a single charge?',
    answer: 'The Aerobuds deliver around 5-6 hours of playtime per single charge. With the included charging case, you get up to 40 hours of total music and calls — enough for a full week of everyday listening between top-ups.',
  },
  {
    question: 'How is call quality on the AP-555?',
    answer: 'ENC (Environmental Noise Cancellation) intelligently filters out background noise during calls, so your voice comes through crystal-clear even on busy streets. Paired with the 13mm dynamic driver, everything sounds full and natural.',
  },
  {
    question: 'Are the Aerobuds sweat and water resistant?',
    answer: 'Yes. With an IPX5 rating, the earbuds shrug off sweat, splashes, and light rain — making them a perfect companion for intense workouts and outdoor runs. No need to worry on the go.',
  },
  {
    question: 'How do the earbuds pair with my devices?',
    answer: 'Powered by Bluetooth 5.3, the Aerobuds pair automatically and instantly the moment you open the case. They connect seamlessly to any wireless device — Windows, Android, and Apple/iOS — with a rock-solid, low-latency connection ideal for gaming.',
  },
  {
    question: 'What\'s included in the box?',
    answer: 'The box includes the NXTERAA Aerobuds AP-555 earbuds, the charging case, a Type-C fast-charging cable, a FREE silicone protective case, and a quick start guide — all wrapped in our signature premium packaging.',
  },
  {
    question: 'How do the touch controls work?',
    answer: 'Intelligent Touch Control lets you play or pause music, skip tracks, answer calls, and trigger your voice assistant with a simple tap on either earbud. Effortless control without ever reaching for your phone.',
  },
  {
    question: 'What is the price and warranty?',
    answer: 'The Aerobuds AP-555 are priced at MRP ₹1499 and come with a 1 Year Warranty covering manufacturing defects. Available in Black & White, you can shop them now at nxtraa.online.',
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView(0.1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="border-b border-white/5"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-6 flex items-start justify-between gap-4 text-left group"
      >
        <span className="text-white/80 text-base md:text-lg font-light group-hover:text-white transition-colors">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/30 text-2xl flex-shrink-0 leading-none mt-0.5"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-white/40 text-sm md:text-base leading-relaxed pb-6 pr-12">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);

  return (
    <section className="relative py-32 md:py-48 bg-nxtraa-black">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Questions
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white"
          >
            FAQ
          </motion.h2>
        </div>

        {/* FAQ Items */}
        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}