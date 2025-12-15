import React from 'react';
import { Chapter, ContentType } from '../types';
import { Crown, BookOpen, Lock, X, HelpCircle, FileQuestion } from 'lucide-react';

interface Props { chapter: Chapter; credits: number; isAdmin: boolean; onSelect: (t: ContentType) => void; onClose: () => void; }

export const PremiumModal: React.FC<Props> = ({ chapter, credits, isAdmin, onSelect, onClose }) => {
  const canNote = credits >= 5 || isAdmin;
  const canMcq = credits >= 2 || isAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X size={24} /></button>
            <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{chapter.title}</h3>
                <p className="text-slate-500 text-sm mb-6">Select Content Type</p>
                <div className="space-y-3">
                    <button onClick={() => onSelect('NOTES_SIMPLE')} className="w-full flex items-center p-3 rounded-xl border hover:bg-slate-50">
                        <div className="bg-slate-100 p-3 rounded mr-4"><BookOpen size={20} /></div>
                        <div className="text-left"><div className="font-bold text-sm">Simple Note</div><div className="text-[10px] text-green-600 font-bold">FREE</div></div>
                    </button>
                    <button onClick={() => onSelect('MCQ_SIMPLE')} className="w-full flex items-center p-3 rounded-xl border hover:bg-slate-50">
                        <div className="bg-green-100 p-3 rounded mr-4"><FileQuestion size={20} /></div>
                        <div className="text-left"><div className="font-bold text-sm">Normal Quiz</div><div className="text-[10px] text-green-600 font-bold">FREE</div></div>
                    </button>
                    <button onClick={() => canNote && onSelect('NOTES_PREMIUM')} className={`w-full flex items-center p-3 rounded-xl border ${canNote ? 'hover:bg-blue-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                        <div className="bg-blue-100 p-3 rounded mr-4"><Crown size={20} /></div>
                        <div className="text-left"><div className="font-bold text-sm">Premium Note (PDF)</div><div className="text-[10px] text-blue-600 font-bold">{isAdmin ? 'Free (Admin)' : '5 Credits'}</div></div>
                    </button>
                    <button onClick={() => canMcq && onSelect('MCQ_ANALYSIS')} className={`w-full flex items-center p-3 rounded-xl border ${canMcq ? 'hover:bg-purple-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                        <div className="bg-purple-100 p-3 rounded mr-4"><HelpCircle size={20} /></div>
                        <div className="text-left"><div className="font-bold text-sm">Deep Analysis MCQ</div><div className="text-[10px] text-purple-600 font-bold">{isAdmin ? 'Free (Admin)' : '2 Credits'}</div></div>
                    </button>
                </div>
            </div>
            {!canNote && !isAdmin && <div className="bg-slate-50 p-3 text-center text-[10px] text-slate-500">Need credits? Study for 3 Hours to earn!</div>}
        </div>
    </div>
  );
};

