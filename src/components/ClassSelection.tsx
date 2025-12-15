import React from 'react';
import { ClassLevel, Board } from '../types';
import { GraduationCap, Lock, Clock } from 'lucide-react';

interface Props { selectedBoard: Board | null; allowedClasses?: ClassLevel[]; onSelect: (l: ClassLevel) => void; onBack: () => void; }

export const ClassSelection: React.FC<Props> = ({ allowedClasses, onSelect, onBack }) => {
  const classes: ClassLevel[] = ['6', '7', '8', '9', '10', '11', '12'];
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center mb-6"><button onClick={onBack} className="text-slate-500 hover:text-slate-800 mr-4">&larr; Back</button></div>
      <div className="text-center mb-10"><h2 className="text-3xl font-bold text-slate-800 mb-3">Select Your Class</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
        {classes.map((cls) => {
            const isLocked = allowedClasses && allowedClasses.length > 0 && !allowedClasses.includes(cls);
            return (
              <button key={cls} onClick={() => !isLocked && onSelect(cls)} disabled={isLocked} className={`p-6 rounded-2xl border transition-all text-left ${isLocked ? 'bg-slate-50 opacity-80 cursor-not-allowed' : 'bg-white hover:border-blue-500 hover:-translate-y-1'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isLocked ? 'bg-slate-200' : 'bg-blue-50 text-blue-600'}`}>{isLocked ? <Lock size={24}/> : <GraduationCap size={24}/>}</div>
                <h3 className="text-2xl font-bold text-slate-800">Class {cls}</h3>
                <p className="text-sm text-slate-500">{isLocked ? 'Coming Soon' : 'View Syllabus'}</p>
              </button>
            );
        })}
      </div>
    </div>
  );
};

