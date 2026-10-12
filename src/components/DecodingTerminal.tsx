import React from 'react';

interface DecodingTerminalProps {
  logs: { text: string; status?: 'normal' | 'ok' | 'bad' }[];
}

export const DecodingTerminal: React.FC<DecodingTerminalProps> = ({ logs }) => {
  return (
    <div className="bg-[#040816] border border-[#00b4ff]/40 rounded-2xl p-6 sm:p-8 font-mono text-sm sm:text-base text-[#3de8ff] min-h-[220px] shadow-[0_0_40px_rgba(0,180,255,0.15)] flex flex-col justify-center">
      <div className="space-y-2.5">
        {logs.map((log, index) => {
          let colorClass = 'text-[#3de8ff]';
          if (log.status === 'ok') colorClass = 'text-[#37e6a0] font-semibold';
          if (log.status === 'bad') colorClass = 'text-[#ff5d7a] font-semibold';

          return (
            <div key={index} className={`flex items-center gap-2 ${colorClass}`}>
              <span>{log.text}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1 text-[#3de8ff]">
          <span className="inline-block w-2.5 h-4 bg-[#3de8ff] animate-pulse" />
        </div>
      </div>
    </div>
  );
};
