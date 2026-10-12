import { Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CountdownViewProps {
  targetDate: string;
  onUnlocked: () => void;
}

export const CountdownView: React.FC<CountdownViewProps> = ({
  targetDate,
  onUnlocked,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: string;
    mins: string;
    secs: string;
    totalSeconds: number;
  }>({
    days: 0,
    hours: '00',
    mins: '00',
    secs: '00',
    totalSeconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));

      if (diff <= 0) {
        onUnlocked();
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');

      setTimeLeft({ days, hours, mins, secs, totalSeconds: diff });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onUnlocked]);

  return (
    <div className="bg-[#0d152e]/80 border border-[rgba(110,165,255,0.2)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center">
      <div className="inline-flex p-3 rounded-full bg-[#00b4ff]/10 border border-[#00b4ff]/30 text-[#3de8ff] mb-4">
        <Clock className="w-8 h-8" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold font-head text-[#e9effd]">
        Results Unlock Soon
      </h2>
      <p className="text-sm text-[#8e9fc6] mt-2 max-w-md mx-auto">
        The official results are encrypted and scheduled for release. Check back when the countdown hits zero!
      </p>

      {/* Countdown Digits */}
      <div className="flex justify-center gap-2 sm:gap-4 my-8">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.mins },
          { label: 'Secs', value: timeLeft.secs },
        ].map((unit, idx) => (
          <div
            key={idx}
            className="min-w-[68px] sm:min-w-[80px] p-3.5 sm:p-4 rounded-xl border border-[rgba(110,165,255,0.25)] bg-[#040816]/80 text-center"
          >
            <b className="block text-2xl sm:text-3xl font-mono font-bold text-[#3de8ff]">
              {unit.value}
            </b>
            <span className="text-[10px] sm:text-xs text-[#8e9fc6] uppercase font-mono tracking-widest block mt-1">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#8e9fc6]">
        🔒 Secure release lock active. Access keys will decrypt automatically upon timer completion.
      </p>
    </div>
  );
};
