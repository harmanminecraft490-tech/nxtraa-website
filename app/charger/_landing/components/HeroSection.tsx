"use client";

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// WebGL canvas is client-only — skip SSR and code-split three.js out of the
// initial bundle so the hero text paints instantly while the 3D scene streams in.
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

// Earbud feature call-outs shown as the buds float out of the case.
const LABELS = [
  { label: '13mm Driver', sub: 'Deep Bass', x: '16%', y: '20%' },
  { label: 'ENC Mic', sub: 'Noise Cancelling', x: '12%', y: '42%' },
  { label: 'Touch Control', sub: 'Intelligent', x: '15%', y: '64%' },
  { label: 'IPX5', sub: 'Sweat Proof', x: '72%', y: '22%' },
  { label: 'Bluetooth 5.3', sub: 'Auto Connect', x: '76%', y: '46%' },
  { label: 'Type-C', sub: 'Fast Charge', x: '70%', y: '68%' },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  // Hot-path values live in refs so scroll/mouse NEVER trigger React renders.
  const progressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Quality is decided once on the client before the Canvas mounts.
  const [quality, setQuality] = useState<'low' | 'high' | null>(null);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const smallOrWeak =
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false);
    const nextQuality = coarse || smallOrWeak ? 'low' : 'high';
    const frame = window.requestAnimationFrame(() => setQuality(nextQuality));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrolled = -rect.top;
      const startPx = sectionHeight * 0.06;
      const endPx = sectionHeight * 0.72;
      const raw = (scrolled - startPx) / (endPx - startPx);
      const p = Math.min(Math.max(raw, 0), 1);
      // easeInOut
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      progressRef.current = eased;

      // Drive overlays directly (no setState) to keep scrolling jank-free.
      if (textRef.current) textRef.current.style.opacity = String(Math.max(1 - eased * 3.2, 0));
      if (labelsRef.current) {
        const lo = eased > 0.18 ? Math.min((eased - 0.18) * 2.6, 1) : 0;
        labelsRef.current.style.opacity = String(lo);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      if (orb1Ref.current)
        orb1Ref.current.style.transform = `translate(${x * 25}px, ${y * 25}px)`;
      if (orb2Ref.current)
        orb2Ref.current.style.transform = `translate(${x * -18}px, ${y * -18}px)`;
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[200vh] md:min-h-[260vh] bg-nxtraa-black"
    >
      {/* Sticky 3D Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            ref={orb1Ref}
            className="absolute w-[700px] h-[700px] rounded-full will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238,0.08), transparent 70%)',
              top: '10%',
              right: '-10%',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <div
            ref={orb2Ref}
            className="absolute w-[500px] h-[500px] rounded-full will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(8, 145, 178,0.06), transparent 70%)',
              bottom: '0%',
              left: '10%',
              transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* 3D Scene (mounts once quality is known) */}
        {quality && (
          <Scene3D
            className="absolute inset-0 z-10"
            progressRef={progressRef}
            mouseRef={mouseRef}
            quality={quality}
          />
        )}

        {/* Hero Text Overlay */}
        <div
          ref={textRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.4 }}
            className="text-center px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-nxtraa-accent/80 text-xs sm:text-sm tracking-[0.4em] uppercase mb-6 font-medium"
            >
              Introducing · NE AP-555
            </motion.p>

            <div className="overflow-hidden mb-1">
              <motion.h1
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter text-white leading-none"
              >
                Aerobuds
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-8">
              <motion.h2
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight tracking-tight text-white/50 leading-tight"
              >
                True Wireless Stereo
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="text-white/30 text-base sm:text-lg md:text-xl max-w-lg mx-auto mb-12 font-light leading-relaxed"
            >
              40 hours of music. Zero wires.
              <br />
              Engineered for the way you move.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.7 }}
              className="flex items-center justify-center gap-6"
            >
              <motion.a
                href="https://nxtraa.online"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-full text-sm hover:bg-white/90 transition-colors pointer-events-auto shadow-2xl shadow-white/5"
              >
                Shop Now
                <ArrowRight size={15} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
              </motion.a>
              <motion.button
                type="button"
                onClick={() =>
                  window.scrollTo({ top: window.innerHeight * 2.6, behavior: 'smooth' })
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 border border-white/15 text-white/70 font-light rounded-full text-sm hover:bg-white/5 transition-all pointer-events-auto"
              >
                Explore
              </motion.button>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.3 }}
              className="mt-16 flex flex-col items-center gap-2"
            >
              <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-0.5 h-1.5 rounded-full bg-white/40"
                />
              </div>
              <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">Scroll to assemble</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Assembly feature labels */}
        <div
          ref={labelsRef}
          className="absolute inset-0 z-20 pointer-events-none hidden md:block"
          style={{ opacity: 0 }}
        >
          {LABELS.map((item, i) => (
            <div
              key={i}
              className="absolute flex items-center gap-2"
              style={{ left: item.x, top: item.y }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-nxtraa-accent/70 shadow-sm shadow-nxtraa-accent/50" />
              <div className="h-px w-6 bg-gradient-to-r from-nxtraa-accent/50 to-transparent" />
              <div>
                <span className="text-white/80 text-[11px] tracking-wider uppercase font-medium block leading-tight">
                  {item.label}
                </span>
                <span className="text-white/30 text-[9px] tracking-wider uppercase font-light">
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-nxtraa-black to-transparent z-30 pointer-events-none" />
        {/* Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-nxtraa-black/50 to-transparent z-5 pointer-events-none" />
      </div>
    </section>
  );
}
