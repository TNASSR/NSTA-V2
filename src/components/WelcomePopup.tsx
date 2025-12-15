import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface Props { onStart: () => void; isResume: boolean; }

export const WelcomePopup: React.FC<Props> = ({ onStart, isResume }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4">
       <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <div className="bg-blue-600 p-8 text-center relative">
             <div className="bg-white p-4 rounded-2xl shadow-lg inline-block mb-4"><BrainCircuit size={48} className="text-blue-600" /></div>
             <h1 className="text-3xl font-extrabold text-white mb-1">NST</h1>
             <p className="text-blue-100 text-xs uppercase tracking-widest">My Personal Assistant</p>
          </div>
          <div className="p-8 text-center space-y-6">
             <h2 className="text-xl font-bold text-slate-800">{isResume ? "Welcome Back!" : "AI Smart Study"}</h2>
             <p className="text-slate-500 text-sm">AI ke saath padhai kare smart tarike se. Book jaisa faltu kahaniyo se bache, AI tumko bas jaruri topics hi dega!</p>
             <button onClick={onStart} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">{isResume ? "Resume Learning" : "Get Started"}</button>
             <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">Developed by Nadim Anwar</p>
             </div>
          </div>
       </div>
    </div>
  );
};

