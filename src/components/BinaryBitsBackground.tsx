import React, { useEffect, useState } from 'react';

interface BitParticle {
  id: number;
  char: string;
  left: number;
  fontSize: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const BinaryBitsBackground: React.FC = () => {
  const [bits, setBits] = useState<BitParticle[]>([]);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const list: BitParticle[] = [];
    for (let i = 0; i < 28; i++) {
      list.push({
        id: i,
        char: Math.random() < 0.5 ? '0' : '1',
        left: Math.random() * 100,
        fontSize: 11 + Math.random() * 13,
        duration: 14 + Math.random() * 16,
        delay: -Math.random() * 20,
        opacity: 0.15 + Math.random() * 0.18,
      });
    }
    setBits(list);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className="absolute font-mono text-[#3de8ff] animate-rise select-none"
          style={{
            left: `${b.left}%`,
            bottom: '-40px',
            fontSize: `${b.fontSize}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity,
          }}
        >
          {b.char}
        </span>
      ))}
    </div>
  );
};
