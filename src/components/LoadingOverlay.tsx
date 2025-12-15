import React, { useState, useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';

interface Props { dataReady: boolean; onComplete: () => void; }

export const LoadingOverlay: React.FC<Props> = ({ dataReady, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (progress < 100) {
      const speed = dataReady ? 20 : 150; 
      interval = setInterval(() => {
        setProgress((prev) => {
          if (!dataReady && prev >= 85) return prev;
          if (prev >= 99 && dataReady) return 100;
          return prev + 1;
        });
      }, speed);
    } else {
       setTimeout(onComplete, 500);
    }
    return () => clearInterval(interval);
  }, [progress, dataReady, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white">
      <div className="w-full max-w-md px-8 text-center">
        <BrainCircuit size={80} className="text-blue-500 mx-auto mb-8 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">Generating Content...</h2>
        <div className="text-7xl font-black font-mono mb-8">{progress}%</div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-blue-600 transition-all duration-75 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Powered by Gemini AI</p>
      </div>
    </div>
  );
};

