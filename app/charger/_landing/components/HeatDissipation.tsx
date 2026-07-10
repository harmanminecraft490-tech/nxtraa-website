"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

function NoiseMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref, inView } = useInView(0.2);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inView) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 400;
    const h = 300;
    canvas.width = w;
    canvas.height = h;

    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, w, h);

      // Earbud outline
      const cx = w / 2, cy = h / 2;
      const bw = 160, bh = 120;

      // Sound field gradient
      for (let x = cx - bw / 2; x < cx + bw / 2; x += 4) {
        for (let y = cy - bh / 2; y < cy + bh / 2; y += 4) {
          const dx = (x - cx) / (bw / 2);
          const dy = (y - cy) / (bh / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const heat = Math.max(0, 1 - dist) * (0.7 + 0.3 * Math.sin(time + dx * 3 + dy * 2));

          const r = Math.floor(heat * 255);
          const g = Math.floor(heat * 100 * (1 - heat));
          const b = Math.floor((1 - heat) * 200);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${heat * 0.6 + 0.1})`;
          ctx.fillRect(x, y, 4, 4);
        }
      }

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const radius = 12;
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, radius);
      ctx.stroke();

      // Incoming ambient noise arrows
      for (let i = 0; i < 6; i++) {
        const ax = cx - bw / 2 - 30 - Math.sin(time * 2 + i) * 10;
        const ay = cy - bh / 3 + (i * bh) / 5;
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 + Math.sin(time + i) * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 20, ay);
        ctx.lineTo(ax + 16, ay - 4);
        ctx.moveTo(ax + 20, ay);
        ctx.lineTo(ax + 16, ay + 4);
        ctx.stroke();
      }

      // Cancelled noise exhaust
      for (let i = 0; i < 6; i++) {
        const ax = cx + bw / 2 + 10 + Math.sin(time * 2 + i) * 10;
        const ay = cy - bh / 3 + (i * bh) / 5;
        ctx.strokeStyle = `rgba(255, 100, 50, ${0.15 + Math.sin(time + i) * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 20, ay);
        ctx.lineTo(ax + 16, ay - 4);
        ctx.moveTo(ax + 20, ay);
        ctx.lineTo(ax + 16, ay + 4);
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameRef.current);
  }, [inView]);

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full max-w-md"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* dB scale labels */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {['80 dB', '60 dB', '40 dB', '20 dB'].map((t, i) => (
          <div key={t} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                background: `rgb(${255 - i * 60}, ${i * 30}, ${i * 50})`,
              }}
            />
            <span className="text-white/30 text-xs font-mono">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const temps = [
  { label: 'NXTERAA ENC', temp: 42, color: '#22d3ee', max: 100 },
  { label: 'Standard Buds', temp: 68, color: '#ff6b3d', max: 100 },
  { label: 'No-Brand', temp: 85, color: '#ff3333', max: 100 },
];

export default function HeatDissipation() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);
  const { ref: tempRef, inView: tempInView } = useInView(0.15);

  return (
    <section className="relative py-32 md:py-48 bg-nxtraa-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Environmental Noise Cancellation
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Silence the World
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            Intelligent ENC mics filter out up to 40% more background noise for crystal-clear calls.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Noise Map */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-white/60 text-sm uppercase tracking-wider mb-6">Live Noise Map</h3>
            <NoiseMap />
          </motion.div>

          {/* Noise Comparison */}
          <div ref={tempRef} className="space-y-8">
            <h3 className="text-white/60 text-sm uppercase tracking-wider mb-6">Background Noise Comparison</h3>
            {temps.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 40 }}
                animate={tempInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">{item.label}</span>
                  <span className="font-mono font-bold" style={{ color: item.color }}>
                    {item.temp} dB
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={tempInView ? { width: `${item.temp}%` } : {}}
                    transition={{ duration: 1.2, delay: i * 0.15 + 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${item.color}33, ${item.color})`,
                    }}
                  />
                </div>
              </motion.div>
            ))}

            <div className="glass rounded-xl p-6 mt-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎧</span>
                <span className="text-white font-medium">Deep Bass Acoustics</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Precision-tuned 13mm dynamic drivers: dual ENC mics → acoustic chamber → deep-bass diaphragm.
                Delivers premium, immersive sound across every track and call.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 glow-line" />
      </div>
    </section>
  );
}