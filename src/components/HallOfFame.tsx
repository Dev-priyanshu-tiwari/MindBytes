import confetti from 'canvas-confetti';
import { Sparkles, Trophy } from 'lucide-react';
import React, { useState } from 'react';
import { fmt } from '../crypto';

interface TopStudent {
  name: string;
  branch: string;
  score: number;
  rank: number;
}

interface HallOfFameProps {
  topStudents: TopStudent[];
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ topStudents }) => {
  const [revealed, setRevealed] = useState(false);
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleReveal = async () => {
    if (isRevealing || revealed) return;
    setIsRevealing(true);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Staggered sequence: 3rd, then 2nd, then 1st
    await sleep(400);
    setRevealedRanks([3]);
    await sleep(750);
    setRevealedRanks([3, 2]);
    await sleep(750);
    setRevealedRanks([3, 2, 1]);
    setRevealed(true);
    setIsRevealing(false);

    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd875', '#e8b84a', '#3de8ff', '#ffffff'],
    });
  };

  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const positionLabels: Record<number, string> = { 1: '1st Place', 2: '2nd Place', 3: '3rd Place' };

  return (
    <div className="bg-[#0d152e]/80 border border-[rgba(110,165,255,0.2)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all mt-8">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-5 h-5 text-[#ffd875]" />
        <h2 className="text-2xl font-bold font-head text-[#e9effd]">
          Hall of Fame
        </h2>
      </div>
      <p className="text-sm text-[#8e9fc6]">
        Recognizing the highest achieving pioneers of MindBytes. Ready to see who made the podium?
      </p>

      {/* Reveal Button if not yet revealed */}
      {!revealed && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleReveal}
            disabled={isRevealing}
            className="px-6 py-3.5 rounded-xl font-head font-bold text-sm sm:text-base text-[#04101f] bg-gradient-to-r from-[#ffd875] via-[#e8b84a] to-[#f59e0b] hover:shadow-[0_0_30px_rgba(232,184,74,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRevealing ? 'Revealing Champions…' : 'Reveal the Top 3 Podium'}</span>
          </button>
        </div>
      )}

      {/* Podium Cards */}
      <div className="space-y-3.5 mt-5">
        {[1, 2, 3].map((rankNum) => {
          if (!revealedRanks.includes(rankNum)) return null;

          const studentsInRank = topStudents.filter((s) => s.rank === rankNum);
          if (!studentsInRank.length) return null;

          return studentsInRank.map((student, idx) => {
            const isFirst = rankNum === 1;

            return (
              <div
                key={`${rankNum}-${idx}`}
                className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all animate-fadeIn ${
                  isFirst
                    ? 'border-[#ffd875]/70 bg-gradient-to-r from-[#ffd875]/15 via-[#040816]/80 to-[#040816]/80 shadow-[0_0_35px_rgba(232,184,74,0.25)]'
                    : 'border-[rgba(110,165,255,0.2)] bg-[#040816]/60'
                }`}
              >
                <span className="text-3xl sm:text-4xl shrink-0" role="img" aria-label={`Rank ${rankNum}`}>
                  {medals[rankNum]}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-lg sm:text-xl font-bold font-head text-[#e9effd] truncate">
                    {student.name}
                  </b>
                  <span className="text-xs sm:text-sm text-[#8e9fc6] block truncate">
                    {student.branch}  ·  <span className={isFirst ? 'text-[#ffd875] font-semibold' : ''}>{positionLabels[rankNum]}</span>
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black font-head text-[#e9effd]">
                    {fmt(student.score)}
                  </div>
                  <small className="block text-xs font-mono text-[#8e9fc6]">marks</small>
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
