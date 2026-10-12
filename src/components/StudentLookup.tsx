import { ArrowRight, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { EncryptedDataset } from '../types';

interface StudentLookupProps {
  dataset: EncryptedDataset;
  onLookup: (email: string, branch: string) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export const StudentLookup: React.FC<StudentLookupProps> = ({
  dataset,
  onLookup,
  isLoading,
  error,
  onClearError,
}) => {
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');

  const branches = dataset.meta.branches;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !branch) return;
    onLookup(email.trim(), branch);
  };

  return (
    <div className="bg-[#0d152e]/80 border border-[rgba(110,165,255,0.2)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all">
      <div className="mb-5">
        <h2 className="text-2xl font-bold font-head text-[#e9effd]">
          Decode Your Result
        </h2>
        <p className="text-sm text-[#8e9fc6] mt-1">
          Enter the registered email and select your branch to access your encrypted test score.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="student-email"
            className="block text-xs font-mono font-semibold tracking-wider text-[#3de8ff] mb-2 uppercase"
          >
            &gt; EMAIL ADDRESS
          </label>
          <input
            id="student-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) onClearError();
            }}
            placeholder="you@example.com"
            disabled={isLoading}
            required
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full px-4 py-3.5 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.25)] text-[#e9effd] font-body text-base placeholder:text-slate-500 focus:outline-none focus:border-[#00b4ff] focus:ring-2 focus:ring-[#00b4ff]/30 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="student-branch"
            className="block text-xs font-mono font-semibold tracking-wider text-[#3de8ff] mb-2 uppercase"
          >
            &gt; ENGINEERING BRANCH
          </label>
          <select
            id="student-branch"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              if (error) onClearError();
            }}
            disabled={isLoading}
            required
            className="w-full px-4 py-3.5 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.25)] text-[#e9effd] font-body text-base focus:outline-none focus:border-[#00b4ff] focus:ring-2 focus:ring-[#00b4ff]/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <option value="">Select your branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-start gap-2.5">
            <span className="text-red-400 font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim() || !branch}
          className="w-full mt-2 py-4 px-6 rounded-xl font-head font-bold text-base text-[#04101f] bg-gradient-to-r from-[#3de8ff] via-[#00b4ff] to-[#8b5cf6] hover:shadow-[0_10px_30px_rgba(0,180,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Decode My Result</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Zero knowledge encryption note */}
      <div className="mt-5 flex items-center gap-2 text-xs text-[#8e9fc6]">
        <Lock className="w-4 h-4 text-[#37e6a0] shrink-0" />
        <span>
          Every result is encrypted using client-side AES-256-GCM. It can only be unlocked with your registered email and branch credentials.
        </span>
      </div>
    </div>
  );
};
