import React from 'react';
import { fmt } from '../crypto';
import { QuizMetadata } from '../types';

interface StatsBarProps {
  meta: QuizMetadata;
}

export const StatsBar: React.FC<StatsBarProps> = ({ meta }) => {
  return (
    <div className="flex justify-center gap-3 sm:gap-4 flex-wrap my-6">
      <div className="min-w-[120px] px-4 py-2.5 rounded-xl border border-[rgba(110,165,255,0.2)] bg-[#0a1026]/70 backdrop-blur-md text-center transition-all hover:border-cyan-400/40">
        <b className="block text-2xl font-bold font-head text-[#e9effd]">
          {meta.participants}
        </b>
        <span className="text-xs uppercase tracking-wider text-[#8e9fc6] font-medium">
          Participants
        </span>
      </div>

      <div className="min-w-[120px] px-4 py-2.5 rounded-xl border border-[rgba(110,165,255,0.2)] bg-[#0a1026]/70 backdrop-blur-md text-center transition-all hover:border-cyan-400/40">
        <b className="block text-2xl font-bold font-head text-[#3de8ff]">
          {fmt(meta.highest)}
        </b>
        <span className="text-xs uppercase tracking-wider text-[#8e9fc6] font-medium">
          Top Score
        </span>
      </div>

      <div className="min-w-[120px] px-4 py-2.5 rounded-xl border border-[rgba(110,165,255,0.2)] bg-[#0a1026]/70 backdrop-blur-md text-center transition-all hover:border-cyan-400/40">
        <b className="block text-2xl font-bold font-head text-[#ffd875]">
          {fmt(meta.average)}
        </b>
        <span className="text-xs uppercase tracking-wider text-[#8e9fc6] font-medium">
          Class Average
        </span>
      </div>
    </div>
  );
};
