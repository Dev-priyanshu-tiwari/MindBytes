import confetti from 'canvas-confetti';
import { ArrowLeft, Award, CheckCircle2, Download, TrendingUp, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { fmt, tierFor } from '../crypto';
import { DecryptedStudentResult, EncryptedDataset } from '../types';
import { downloadResultCard } from '../utils/generateCard';

interface ResultDisplayProps {
  student: DecryptedStudentResult;
  dataset: EncryptedDataset;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  student,
  dataset,
  onReset,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const total = student.total || dataset.meta.total;
  const pct = total ? (student.score / total) * 100 : 0;
  const tier = tierFor(pct);
  const participants = dataset.meta.participants;
  const average = dataset.meta.average;
  const diff = +(student.score - average).toFixed(2);
  const percentile = Math.max(1, Math.ceil((student.rank / participants) * 100));

  // Circular gauge constant
  const CIRCLE_RADIUS = 94;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~590.62
  const strokeOffset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, pct / 100)));

  // Count up animation & celebration
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setDisplayScore(student.score);
      return;
    }

    const duration = 1600;
    const start = performance.now();
    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(+(student.score * eased).toFixed(1));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(student.score);
      }
    };
    requestAnimationFrame(animate);

    // Confetti celebration
    if (student.rank <= 3) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3de8ff', '#00b4ff', '#8b5cf6', '#e8b84a', '#ffffff'],
      });
    } else if (pct >= 75) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3de8ff', '#00b4ff', '#8b5cf6'],
      });
    }
  }, [student.score, student.rank, pct]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadResultCard(student, dataset);
    } finally {
      setIsDownloading(false);
    }
  };

  // Section breakdown
  const sections = [
    { label: 'Easy Level', score: student.easy, max: dataset.meta.sections.easy },
    { label: 'Medium Level', score: student.medium, max: dataset.meta.sections.medium },
    { label: 'Hard Level', score: student.hard, max: dataset.meta.sections.hard },
  ].filter((s) => s.score !== null && s.score !== undefined && s.max > 0);

  return (
    <div className="bg-[#0d152e]/85 border border-[rgba(110,165,255,0.25)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all">
      {/* Header Result pill */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/50 bg-emerald-950/40 text-[#37e6a0] font-mono text-xs font-semibold tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>RESULT DECODED</span>
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-head text-[#e9effd] mt-3">
          {student.name}
        </h2>
        <p className="text-sm sm:text-base text-[#8e9fc6] mt-1 font-medium">
          {[student.branch, student.year].filter(Boolean).join('  ·  ')}
        </p>
      </div>

      {/* Grid: Circular Gauge + Metrics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6">
        {/* Circular Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg
              width="210"
              height="210"
              viewBox="0 0 210 210"
              className="-rotate-90 transform"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="scoreGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3de8ff" />
                  <stop offset="50%" stopColor="#00b4ff" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                cx="105"
                cy="105"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="14"
              />
              {/* Dynamic Score Bar */}
              <circle
                cx="105"
                cy="105"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="url(#scoreGaugeGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-black font-head text-[#e9effd]">
                {fmt(displayScore)}
              </span>
              <span className="text-xs text-[#8e9fc6] font-medium mt-0.5">
                / {fmt(total)} marks
              </span>
              <span className="text-xs font-mono font-semibold text-[#3de8ff] mt-1.5">
                {pct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Tiles */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-[rgba(110,165,255,0.2)] bg-[#040816]/60">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#8e9fc6] uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-[#ffd875]" />
              <span>Rank</span>
            </div>
            <b className="block text-2xl font-extrabold font-head text-[#e9effd] mt-1">
              #{student.rank} <span className="text-sm font-normal text-[#8e9fc6]">/ {participants}</span>
            </b>
          </div>

          <div className="p-4 rounded-xl border border-[rgba(110,165,255,0.2)] bg-[#040816]/60">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#8e9fc6] uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-[#3de8ff]" />
              <span>Percentile</span>
            </div>
            <b className="block text-2xl font-extrabold font-head text-[#e9effd] mt-1">
              Top {percentile}%
            </b>
          </div>

          <div className="col-span-2 p-4 rounded-xl border border-[rgba(110,165,255,0.25)] bg-gradient-to-r from-[#00b4ff]/15 to-[#8b5cf6]/20 flex items-center gap-3.5">
            <span className="text-3xl shrink-0" role="img" aria-label="tier badge">
              {tier.icon}
            </span>
            <div>
              <span className="text-xs font-mono text-[#8e9fc6] uppercase tracking-wider block">
                AI Competence Tier
              </span>
              <div className="text-lg font-bold font-head text-[#e9effd]">
                {tier.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level-wise Performance (if easy/medium/hard available) */}
      {sections.length > 0 && (
        <div className="mt-7 pt-5 border-t border-[rgba(110,165,255,0.15)]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#3de8ff] font-semibold mb-3">
            Level-Wise Breakdown
          </h3>
          <div className="space-y-3">
            {sections.map((sec, idx) => {
              const secPct = sec.max > 0 ? ((sec.score ?? 0) / sec.max) * 100 : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-[#8e9fc6]">{sec.label}</span>
                    <b className="font-mono text-[#e9effd]">
                      {fmt(sec.score)} / {fmt(sec.max)}
                    </b>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00b4ff] to-[#8b5cf6] transition-all duration-1000"
                      style={{ width: `${Math.min(100, secPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* You vs Class Average */}
      <div className="mt-7 pt-5 border-t border-[rgba(110,165,255,0.15)]">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#3de8ff] font-semibold mb-3">
          Candidate vs Class Average
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5">
              <span className="text-[#ffd875] font-medium">Your Score</span>
              <b className="font-mono text-[#ffd875]">{fmt(student.score)}</b>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ffd875] to-[#e8b84a] transition-all duration-1000"
                style={{ width: `${Math.min(100, total ? (student.score / total) * 100 : 0)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5">
              <span className="text-[#8e9fc6]">Class Average</span>
              <b className="font-mono text-[#8e9fc6]">{fmt(average)}</b>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-500/80 transition-all duration-1000"
                style={{ width: `${Math.min(100, total ? (average / total) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#8e9fc6] mt-3">
          {diff > 0 ? (
            <span>
              You scored <b className="text-emerald-400">+{fmt(diff)} marks</b> above the class average. Outstanding!
            </span>
          ) : diff < 0 ? (
            <span>
              You are <b className="text-[#ff5d7a]">{fmt(Math.abs(diff))} marks</b> below the class average. Keep honing your concepts!
            </span>
          ) : (
            <span>Your score is exactly equal to the class average.</span>
          )}
        </p>
      </div>

      {/* Quote / Remarks */}
      <div className="mt-6 p-4 rounded-xl border-l-4 border-[#00b4ff] bg-[#00b4ff]/10 text-sm sm:text-base text-[#e9effd]">
        <p className="italic">
          "{student.remarks || tier.msg}"
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-head font-bold text-sm sm:text-base text-[#04101f] bg-gradient-to-r from-[#3de8ff] via-[#00b4ff] to-[#8b5cf6] hover:shadow-[0_10px_30px_rgba(0,180,255,0.35)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Generating Card…' : 'Download Result Card'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-head font-bold text-sm sm:text-base text-[#e9effd] border border-[rgba(110,165,255,0.3)] bg-transparent hover:border-[#3de8ff] hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Check Another Result</span>
        </button>
      </div>
    </div>
  );
};
