import React from 'react';
import { Stream } from '../types';
import { FlaskConical, TrendingUp, Palette } from 'lucide-react';

interface Props { onSelect: (s: Stream) => void; onBack: () => void; }

export const StreamSelection: React.FC<Props> = ({ onSelect, onBack }) => {
  return (
    <div>
      <div className="flex items-center mb-8"><button onClick={onBack} className="text-slate-500 hover:text-slate-800 mr-4">&larr; Back</button><h2 className="text-2xl font-bold">Select Stream</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[{id:'Science',icon:FlaskConical,color:'blue'},{id:'Commerce',icon:TrendingUp,color:'emerald'},{id:'Arts',icon:Palette,color:'rose'}].map((s:any) => (
            <button key={s.id} onClick={() => onSelect(s.id)} className="flex flex-col items-center p-8 bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`w-16 h-16 rounded-full bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-4`}><s.icon size={32}/></div>
                <h3 className="text-xl font-bold mb-2">{s.id}</h3>
            </button>
        ))}
      </div>
    </div>
  );
};

