import React from 'react';
import { Board } from '../types';
import { Landmark, Building2, ArrowLeft } from 'lucide-react';

interface Props { onSelect: (b: Board) => void; onBack?: () => void; }

export const BoardSelection: React.FC<Props> = ({ onSelect, onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center mb-8">
        {onBack && <button onClick={onBack} className="text-slate-500 hover:text-slate-800 mr-4 flex items-center gap-1 font-medium"><ArrowLeft size={18} /> Back</button>}
      </div>
      <div className="text-center mb-10"><h2 className="text-3xl font-bold text-slate-800 mb-3">Select Your Board</h2><p className="text-slate-600">Choose your education board</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto px-4">
        <button onClick={() => onSelect('CBSE')} className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:-translate-y-1 transition-all text-left">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6"><Landmark size={40} /></div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">CBSE Board</h3><p className="text-slate-500">Central Board of Secondary Education</p>
        </button>
        <button onClick={() => onSelect('BSEB')} className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-500 hover:-translate-y-1 transition-all text-left">
            <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-6"><Building2 size={40} /></div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Bihar Board (BSEB)</h3><p className="text-slate-500">Bihar School Examination Board</p>
        </button>
      </div>
    </div>
  );
};
