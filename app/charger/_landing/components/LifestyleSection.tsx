"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useInView } from '../hooks/useScrollProgress';

const lifestyleItems = [
  {
    title: 'Every Commute',
    subtitle: 'Tune out the noise',
    description: 'ENC hushes the crowd and the traffic, so your music and calls stay crystal clear.',
    image: 'https://images.pexels.com/photos/15110141/pexels-photo-15110141.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    span: 'md:col-span-2',
  },
  {
    title: 'Every Workout',
    subtitle: 'Sweatproof. Secure.',
    description: 'IPX5 rated to shrug off sweat and rain, mile after mile.',
    image: 'https://images.pexels.com/photos/3944802/pexels-photo-3944802.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    span: 'md:col-span-1',
  },
  {
    title: 'Gaming',
    subtitle: 'Zero lag. All in.',
    description: 'Ultra-low latency keeps every shot and footstep perfectly in sync.',
    image: 'https://images.pexels.com/photos/7698475/pexels-photo-7698475.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    span: 'md:col-span-1',
  },
  {
    title: 'All Day',
    subtitle: '40 hours of play',
    description: 'The pocket-sized charging case tops you up on the go — from morning run to midnight call.',
    image: 'https://images.pexels.com/photos/6969676/pexels-photo-6969676.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    span: 'md:col-span-2',
  },
];

function LifestyleCard({ item, index }: { item: typeof lifestyleItems[0]; index: number }) {
  const { ref, inView } = useInView(0.1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl ${item.span} min-h-[300px] md:min-h-[400px] cursor-default`}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes={item.span === 'md:col-span-2' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
        <p className="text-nxtraa-accent text-xs tracking-[0.2em] uppercase mb-2">{item.subtitle}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{item.title}</h3>
        <p className="text-white/50 text-sm max-w-sm">{item.description}</p>
      </div>

      {/* Hover border */}
      <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/10 transition-colors duration-500" />
    </motion.div>
  );
}

export default function LifestyleSection() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);

  return (
    <section className="relative py-32 md:py-48 bg-nxtraa-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Lifestyle
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Designed for Your World
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lifestyleItems.map((item, i) => (
            <LifestyleCard key={item.title} item={item} index={i} />
          ))}
        </div>

        <div className="mt-32 glow-line" />
      </div>
    </section>
  );
}