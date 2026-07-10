"use client";

import { useRef, useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural NXTERAA Aerobuds (NE AP-555) — AirPods-Pro-style TWS earbuds that
 * ASSEMBLE into their charging case as the user scrolls.
 *
 * White colourway + Nxtraa cyan accents. Smooth "pebble" case (rounded on every
 * axis, not a box), refined glossy plastic, on-product NXTERAA / NE branding.
 *
 * Perf: driven entirely by plain refs read inside useFrame — no React renders on
 * the scroll/mouse hot path. Geometry is low-poly + memoised → lag-free on phones.
 */

interface AirpodsModelProps {
  progressRef: RefObject<number>;
  mouseRef: RefObject<{ x: number; y: number }>;
  quality?: 'low' | 'high';
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** Build a crisp text texture (used for on-product NXTERAA / NE branding). */
function makeTextTexture(
  text: string,
  opts: { w?: number; h?: number; font?: string; color?: string; spacing?: number } = {},
) {
  const { w = 512, h = 128, font = '800 66px Inter, Arial, sans-serif', color = '#8a8f96', spacing = 8 } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = text.split('');
  const widths = chars.map((c) => ctx.measureText(c).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let x = w / 2 - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x + widths[i] / 2 - spacing / 2, h / 2);
    x += widths[i];
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Glossy-white "AirPods" plastic. */
const WHITE_GLOSS = {
  color: '#f4f5f7',
  roughness: 0.2,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.4,
} as const;

/** Case shell material (subtle satin white). */
const SHELL = {
  color: '#eef0f3',
  roughness: 0.3,
  metalness: 0.05,
  clearcoat: 0.9,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.25,
} as const;

/** A single AirPods-Pro-style earbud, built stem-down at local origin. */
function EarBud({ seg, logo }: { seg: number; logo: THREE.Texture }) {
  return (
    <group>
      {/* Pebble body — squashed, slightly egg-shaped */}
      <mesh castShadow scale={[1.04, 1.12, 0.9]}>
        <sphereGeometry args={[0.16, seg, seg]} />
        <meshPhysicalMaterial {...WHITE_GLOSS} />
      </mesh>

      {/* NE logo on the outer face of the bud */}
      <mesh position={[0, 0.05, 0.151]} scale={[0.5, 0.5, 1]}>
        <planeGeometry args={[0.16, 0.05]} />
        <meshBasicMaterial map={logo} transparent opacity={0.9} depthWrite={false} />
      </mesh>

      {/* Silicone ear tip — soft translucent oval, angled slightly out */}
      <group position={[0.02, 0.16, 0.03]} rotation={[0.25, 0, -0.12]}>
        <mesh castShadow scale={[1, 1.25, 1]}>
          <sphereGeometry args={[0.078, seg, seg]} />
          <meshPhysicalMaterial
            color="#ececed"
            roughness={0.7}
            metalness={0}
            transmission={0.18}
            thickness={0.1}
            clearcoat={0.4}
          />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.032, 0.05, 0.05, seg]} />
          <meshStandardMaterial color="#17171b" roughness={0.6} />
        </mesh>
      </group>

      {/* Metallic mesh grille on the inner face */}
      <mesh position={[-0.02, 0.03, 0.13]} rotation={[Math.PI / 2.2, 0, 0]}>
        <circleGeometry args={[0.05, seg]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.5} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* SHORT flat stem (AirPods Pro style) */}
      <mesh position={[0, -0.24, 0.04]} scale={[1, 1, 0.62]} castShadow>
        <capsuleGeometry args={[0.06, 0.2, 4, seg]} />
        <meshPhysicalMaterial {...WHITE_GLOSS} />
      </mesh>

      {/* Force-sensor flat on the stem front */}
      <mesh position={[0, -0.26, 0.093]}>
        <boxGeometry args={[0.075, 0.13, 0.006]} />
        <meshStandardMaterial color="#e2e2e6" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Mic + charging contact at stem bottom */}
      <mesh position={[0, -0.37, 0.04]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.058, 0.05, 0.045, seg]} />
        <meshStandardMaterial color="#0e0e12" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.4, 0.04]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.05, 0.042, 0.03, seg]} />
        <meshStandardMaterial color="#c9ccd2" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
}

export default function AirpodsModel({ progressRef, mouseRef, quality = 'high' }: AirpodsModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftBud = useRef<THREE.Group>(null);
  const rightBud = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const cur = useRef({ a: 0, rotX: 0, rotY: 0 });

  const seg = quality === 'high' ? 32 : 18;
  const smooth = quality === 'high' ? 6 : 3;

  // On-product branding textures (built once on the client).
  const brandTex = useMemo(() => makeTextTexture('NXTERAA', { color: '#7f858c', spacing: 12 }), []);
  const budTex = useMemo(
    () => makeTextTexture('NE', { w: 256, h: 128, font: '900 88px Inter, Arial, sans-serif', color: '#c2c6cc', spacing: 2 }),
    [],
  );
  useMemo(() => () => { brandTex.dispose(); budTex.dispose(); }, [brandTex, budTex]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.001, delta);

    const targetA = clamp01(progressRef.current ?? 0);
    cur.current.a += (targetA - cur.current.a) * k;
    const a = cur.current.a;

    const m = mouseRef.current ?? { x: 0, y: 0 };
    const baseRotY = t * 0.16;
    cur.current.rotY += (m.x * 0.3 + baseRotY - cur.current.rotY) * k * 0.9;
    cur.current.rotX += (m.y * 0.16 - cur.current.rotX) * k * 0.9;
    groupRef.current.rotation.y = cur.current.rotY;
    groupRef.current.rotation.x = cur.current.rotX;

    const place = (bud: THREE.Group | null, sign: number, phase: number) => {
      if (!bud) return;
      const x = lerp(sign * 0.92, sign * 0.4, a);
      const floatY = 0.72 + Math.sin(t * 1.1 + phase) * 0.05 * (1 - a);
      const y = lerp(floatY, 0.04, a);
      const z = lerp(0.18, 0.06, a);
      bud.position.set(x, y, z);
      const spin = (1 - a) * (t * 0.55 + phase);
      bud.rotation.set(lerp(0.4, 0.05, a), spin, sign * (1 - a) * 0.26);
      bud.scale.setScalar(lerp(1, 0.94, a));
    };
    place(leftBud.current, -1, 0);
    place(rightBud.current, 1, Math.PI);

    if (lidRef.current) {
      const closed = smoothstep(0.62, 1, a);
      lidRef.current.rotation.x = lerp(-1.7, 0, closed);
    }

    const pulse = 0.5 + Math.sin(t * 2.4) * 0.4;
    if (ledRef.current) ledRef.current.emissiveIntensity = (0.4 + a * 0.8) * pulse + 0.3;
    if (glowRef.current) glowRef.current.intensity = a * 0.9 * (0.7 + pulse * 0.3);
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]} scale={0.7}>
      {/* ===== Charging case — smooth pebble (white + cyan accents) ===== */}
      <group position={[0, -0.5, 0]}>
        {/* Case body */}
        <RoundedBox args={[1.42, 0.66, 0.62]} radius={0.29} smoothness={smooth} creaseAngle={0.6} castShadow receiveShadow>
          <meshPhysicalMaterial {...SHELL} />
        </RoundedBox>

        {/* Inner opening lip (thin darker rim just under the seam) */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.02, 10, 48]} />
          <meshStandardMaterial color="#d3d6db" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Two plain recessed wells on the top face */}
        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, 0.29, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.08, 24]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.85} metalness={0} />
          </mesh>
        ))}

        {/* Cyan seam accent line (brand colour) */}
        <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.69, 0.006, 8, 90]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>

        {/* Front NXTERAA logo */}
        <mesh position={[0, -0.05, 0.32]}>
          <planeGeometry args={[0.66, 0.17]} />
          <meshBasicMaterial map={brandTex} transparent opacity={0.92} depthWrite={false} />
        </mesh>

        {/* Charging LED (cyan) + inner glow */}
        <mesh position={[0, 0.12, 0.322]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial ref={ledRef} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
        <pointLight ref={glowRef} position={[0, 0.24, 0.2]} color="#22d3ee" intensity={0} distance={2.2} />

        {/* Back pairing button */}
        <mesh position={[0, -0.05, -0.315]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 20]} />
          <meshStandardMaterial color="#dfe2e6" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Hinge */}
        <mesh position={[0, 0.3, -0.31]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 1.28, 16]} />
          <meshStandardMaterial color="#9aa0a6" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* Lid — hinged at the back, opens/closes with assembly */}
        <group ref={lidRef} position={[0, 0.3, -0.31]}>
          <RoundedBox
            args={[1.42, 0.42, 0.62]}
            radius={0.2}
            smoothness={smooth}
            creaseAngle={0.6}
            position={[0, 0.2, 0.31]}
            castShadow
          >
            <meshPhysicalMaterial {...SHELL} />
          </RoundedBox>
        </group>
      </group>

      {/* ===== Earbuds ===== */}
      <group ref={leftBud}>
        <EarBud seg={seg} logo={budTex} />
      </group>
      <group ref={rightBud}>
        <EarBud seg={seg} logo={budTex} />
      </group>
    </group>
  );
}
