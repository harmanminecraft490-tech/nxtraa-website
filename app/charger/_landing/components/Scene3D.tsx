"use client";

import { Suspense, useRef, useMemo, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Float,
  Environment,
  Lightformer,
  AdaptiveDpr,
  PerformanceMonitor,
} from '@react-three/drei';
import * as THREE from 'three';
import AirpodsModel from './AirpodsModel';

interface Scene3DProps {
  progressRef: RefObject<number>;
  mouseRef: RefObject<{ x: number; y: number }>;
  quality: 'low' | 'high';
  className?: string;
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** Lightweight floating particles. Skipped entirely on low quality. */
function AnimatedParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (seededNoise(i + 1) - 0.5) * 12;
      arr[i * 3 + 1] = (seededNoise(i + 101) - 0.5) * 12;
      arr[i * 3 + 2] = (seededNoise(i + 201) - 0.5) * 12;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    // Rotate the whole cloud — far cheaper than per-point CPU updates.
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#22d3ee"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene3D({ progressRef, mouseRef, quality, className = '' }: Scene3DProps) {
  const isHigh = quality === 'high';
  // dpr is capped harder on phones; AdaptiveDpr drops it further under load.
  const dprMax = isHigh ? 1.75 : 1.15;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.3, 6.2], fov: 32 }}
        dpr={[1, dprMax]}
        shadows={isHigh}
        gl={{
          antialias: isHigh,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{ background: 'transparent' }}
      >
        {/* Under sustained load, AdaptiveDpr steps the resolution down (and back
            up when it recovers) so phones stay at a smooth frame rate. */}
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />

        <Suspense fallback={null}>
          {/* Studio lighting */}
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[5, 6, 5]}
            intensity={1.4}
            castShadow={isHigh}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#22d3ee" />
          <spotLight position={[0, 6, 1]} intensity={0.8} angle={0.4} penumbra={0.9} color="#ffffff" />
          <pointLight position={[-2, -1, 3]} intensity={0.5} color="#22d3ee" distance={9} />

          {/* Procedural reflections for the glossy plastic — NO network fetch,
              unlike Environment preset="studio" which downloads an HDR. */}
          <Environment resolution={isHigh ? 256 : 128}>
            <Lightformer intensity={2} position={[0, 3, 2]} scale={[6, 3, 1]} color="#ffffff" />
            <Lightformer intensity={1.1} position={[-3, 1, 2]} scale={[3, 3, 1]} color="#bfe9ff" />
            <Lightformer intensity={0.8} position={[3, -1, 2]} scale={[3, 3, 1]} color="#22d3ee" />
            <Lightformer intensity={0.6} position={[0, -3, 1]} scale={[6, 2, 1]} color="#334155" />
          </Environment>

          <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.22}>
            <AirpodsModel progressRef={progressRef} mouseRef={mouseRef} quality={quality} />
          </Float>

          {isHigh && (
            <ContactShadows
              position={[0, -1.35, 0]}
              opacity={0.55}
              scale={6}
              blur={2.6}
              far={4}
              color="#000"
            />
          )}

          {isHigh && <AnimatedParticles count={60} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
