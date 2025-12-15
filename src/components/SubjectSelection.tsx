import React from 'react';
import { ClassLevel, Subject, Stream } from '../types';
import { getSubjectsList } from '../constants';
import { Calculator, FlaskConical, Languages, Globe2, BookMarked, History, TrendingUp, Briefcase, Landmark, Palette, Feather, Home, Activity, Cpu, HeartPulse } from 'lucide-react';

interface Props { classLevel: ClassLevel; stream: Stream | null; onSelect: (s: Subject) => void; onBack: () => void; hideBack?: boolean; }

const SubjectIcon: React.FC<{ icon: string, className?: string }> = ({ icon, className }) => {
    const icons: any = { math: Calculator, science: FlaskConical, physics: FlaskConical, chemistry: FlaskConical, biology: HeartPulse, english: Languages, hindi: Languages, sanskrit: Languages, social: Globe2, geography: Globe2, history: History, accounts: TrendingUp, bst: Briefcase, polity: Landmark, sociology: BookMarked, psychology: Feather, home: Home, active: Activity, computer: Cpu };
    const Icon = icons[icon] || BookMarked;
    return <Icon className={className} />;
}

export const SubjectSelection: React.FC<Props> = ({ classLevel, stream, onSelect, onBack, hideBack = false }) => {
  const subjects = getSubjectsList(classLevel, stream);
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      {!hideBack && <div className="flex items-center mb-8"><button onClick={onBack} className="text-slate-500 hover:text-slate-800 mr-4">&larr; Back</button><div><h2 className="text-2xl font-bold">Subjects</h2></div></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => (
          <button key={s.id} onClick={() => onSelect(s)} className="flex items-center p-5 bg-white rounded-xl border hover:shadow-md hover:border-blue-400 transition-all text-left group">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mr-4 ${s.color} group-hover:scale-110 transition-transform`}><SubjectIcon icon={s.icon} className="w-7 h-7" /></div>
            <div><h3 className="font-bold text-lg text-slate-800">{s.name}</h3><p className="text-xs text-slate-400">Explore Syllabus</p></div>
          </button>
        ))}
      </div>
    </div>
  );
};

