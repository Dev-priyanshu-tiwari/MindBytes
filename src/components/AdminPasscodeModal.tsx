import { ArrowLeft, KeyRound, Lock, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';

interface AdminPasscodeModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const VALID_PASSCODES = ['knowvia2026', 'knowvia', 'admin123', 'ietrmlau'];

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();

    if (VALID_PASSCODES.includes(clean)) {
      onSuccess();
    } else {
      setError('Invalid organizer security passkey. Access denied.');
      setPasscode('');
    }
  };

  return (
    <div className="bg-[#0d152e]/95 border border-[rgba(110,165,255,0.25)] rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl max-w-md mx-auto text-center">
      <div className="inline-flex p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#3de8ff] mb-4">
        <Lock className="w-7 h-7" />
      </div>

      <h2 className="text-2xl font-bold font-head text-[#e9effd]">
        Organizer Access Only
      </h2>
      <p className="text-xs sm:text-sm text-[#8e9fc6] mt-2 leading-relaxed">
        This area is restricted to KNOWVIA club coordinators and administrators. Students are not authorized to view or edit result sheets.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="text-left">
          <label
            htmlFor="admin-passkey"
            className="block text-xs font-mono font-semibold tracking-wider text-[#3de8ff] mb-2 uppercase"
          >
            &gt; ENTER ORGANIZER PASSKEY
          </label>
          <div className="relative">
            <input
              id="admin-passkey"
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••••••"
              autoFocus
              required
              className="w-full px-4 py-3 rounded-xl bg-[#040816] border border-[rgba(110,165,255,0.3)] text-[#e9effd] font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00b4ff] focus:ring-2 focus:ring-[#00b4ff]/30 transition-all pr-10"
            />
            <KeyRound className="w-4 h-4 text-[#8e9fc6] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}


        <button
          type="submit"
          disabled={!passcode.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-head font-bold text-sm text-[#04101f] bg-gradient-to-r from-[#3de8ff] via-[#00b4ff] to-[#8b5cf6] hover:shadow-[0_8px_25px_rgba(0,180,255,0.35)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Verify &amp; Open Admin Panel
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 px-4 rounded-xl text-xs text-[#8e9fc6] hover:text-[#e9effd] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Student Result Portal</span>
        </button>
      </form>
    </div>
  );
};
