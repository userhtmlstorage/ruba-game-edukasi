import React, { useEffect, useRef } from 'react';

interface ConfettiBurstProps {
  triggerKey: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  shape: 'rect' | 'circle';
}

const COLORS = ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FACC15'];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ triggerKey }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggerKey <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const originX = canvas.width * 0.5;
    const originY = canvas.height * 0.42;

    for (let i = 0; i < 65; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 220 + Math.random() * 440;
      particlesRef.current.push({
        x: originX + (Math.random() - 0.5) * 140,
        y: originY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 220,
        size: 7 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 1.5 + Math.random() * 0.8,
        shape: Math.random() > 0.35 ? 'rect' : 'circle',
      });
    }

    if (rafRef.current !== null) return;

    let last = performance.now();
    const loop = (now: number) => {
      const rawDt = (now - last) / 1000;
      const dt = Math.min(rawDt, 0.05);
      last = now;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life += dt;
        if (p.life >= p.maxLife) continue;

        p.vy += 680 * dt; // gravity
        p.vx *= 0.985;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        alive.push(p);
      }

      particlesRef.current = alive;
      if (alive.length > 0) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [triggerKey]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
};
