"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useScrollProgress';

function EnergyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref, inView } = useInView(0.1);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inView) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      color: string;
    }

    const particles: Particle[] = [];
    const caseX = w * 0.3;
    const caseY = h * 0.5;
    const deviceX = w * 0.7;
    const deviceY = h * 0.5;

    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Spawn particles from case
      if (Math.random() < 0.4) {
        const angle = (Math.random() - 0.5) * 0.5;
        particles.push({
          x: caseX + 40,
          y: caseY + (Math.random() - 0.5) * 30,
          vx: 3 + Math.random() * 2,
          vy: angle * 2,
          size: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: 60 + Math.random() * 20,
          color: Math.random() > 0.3 ? '#22d3ee' : '#00aaff',
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Curve toward device
        const dx = deviceX - 40 - p.x;
        const dy = deviceY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
          p.vx += (dx / dist) * 0.15;
          p.vy += (dy / dist) * 0.1;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = 1 - p.life / p.maxLife;

        // Glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grd.addColorStop(0, `rgba(34, 211, 238, ${alpha * 0.3})`);
        grd.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8);

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        if (p.life > p.maxLife) particles.splice(i, 1);
      }

      // Draw case
      ctx.fillStyle = '#1a1a1a';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(caseX - 35, caseY - 45, 70, 90, 8);
      ctx.fill();
      ctx.stroke();

      // Case glow
      const cGlow = ctx.createRadialGradient(caseX, caseY, 0, caseX, caseY, 60);
      cGlow.addColorStop(0, 'rgba(34, 211, 238, 0.1)');
      cGlow.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = cGlow;
      ctx.fillRect(caseX - 60, caseY - 60, 120, 120);

      // Case label
      ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('40H', caseX, caseY + 4);

      // Draw device (any bud)
      ctx.fillStyle = '#1a1a1a';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(deviceX - 25, deviceY - 45, 50, 90, 8);
      ctx.fill();
      ctx.stroke();

      // Device screen
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.roundRect(deviceX - 20, deviceY - 38, 40, 76, 4);
      ctx.fill();

      // Battery indicator on device
      const batteryLevel = (Math.sin(time * 0.5) + 1) * 0.4 + 0.2;
      ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + Math.sin(time * 2) * 0.2})`;
      ctx.beginPath();
      ctx.roundRect(deviceX - 8, deviceY - 5, 16, 20 * batteryLevel, 2);
      ctx.fill();

      // Play glyph on device
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px sans-serif';
      ctx.fillText('♪', deviceX, deviceY + 20);

      // Audio beam center line
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.05 + Math.sin(time * 3) * 0.03})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(caseX + 40, caseY);
      ctx.lineTo(deviceX - 30, deviceY);
      ctx.stroke();
      ctx.setLineDash([]);

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameRef.current);
  }, [inView]);

  return (
    <div ref={ref}>
      <canvas ref={canvasRef} className="w-full h-[300px] md:h-[400px]" />
    </div>
  );
}

export default function ChargingAnimation() {
  const { ref: titleRef, inView: titleInView } = useInView(0.15);

  return (
    <section className="relative py-32 md:py-48 bg-nxtraa-black overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-nxtraa-accent text-sm tracking-[0.3em] uppercase mb-4"
          >
            Bluetooth 5.3
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Sound in Motion
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            Watch every beat flow instantly to your buds. Up to 40 hours of playtime, with ultra-low latency that adapts to any device in real-time.
          </motion.p>
        </div>

        {/* Energy Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={titleInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="glass rounded-2xl p-4 md:p-8"
        >
          <EnergyCanvas />
          <div className="flex items-center justify-center gap-8 mt-6 text-xs text-white/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-nxtraa-accent animate-pulse" />
              <span>Audio Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <span>Instant Pairing</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-32 glow-line" />
      </div>
    </section>
  );
}