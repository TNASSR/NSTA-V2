import React from 'react';
import { Chapter, Subject, ClassLevel, User } from '../types';
import { BookOpen, Lock, CheckCircle, PlayCircle } from 'lucide-react';

interface Props {
  chapters: Chapter[]; subject: Subject; classLevel: ClassLevel; loading: boolean; user: User | null;
  onSelect: (chapter: Chapter) => void; onBack: () => void;
}

export const ChapterSelection: React.FC<Props> = ({ chapters, subject, classLevel, loading, user, onSelect, onBack }) => {
  const userProgress = user?.progress?.[subject.id] || { currentChapterIndex: 0, totalMCQsSolved: 0 };
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
       <div className="flex items-center mb-8 sticky top-0 bg-slate-50 py-4 z-10">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 mr-4 font-medium">Back</button>
        <div>
          <div className="text-sm text-slate-500">Class {classLevel} / <span className="font-medium text-slate-700">{subject.name}</span></div>
          <h2 className="text-2xl font-bold text-slate-800">Chapters</h2>
        </div>
      </div>

      {loading ? <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 bg-white rounded-xl animate-pulse"></div>)}</div> : (
        <div className="grid gap-4">
          {chapters.map((chapter, index) => {
            const isLocked = !isAdmin && index > userProgress.currentChapterIndex;
            const isCurrent = index === userProgress.currentChapterIndex;
            return (
              <button key={chapter.id} onClick={() => onSelect(chapter)} disabled={isLocked} className={`w-full p-5 rounded-xl border text-left flex items-center relative overflow-hidden ${isLocked ? 'bg-slate-100 opacity-70' : 'bg-white hover:border-blue-400'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isLocked ? 'bg-slate-300' : isCurrent ? 'bg-blue-600' : 'bg-green-500'}`}></div>
                <div className="mr-5 ml-2"><span className="text-[10px] font-bold text-slate-400 block">CH</span><span className={`text-2xl font-bold ${isCurrent?'text-blue-600':isLocked?'text-slate-400':'text-green-600'}`}>{(index+1).toString().padStart(2,'0')}</span></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">{chapter.title}</h3>
                  {isLocked ? <div className="flex gap-1 text-xs text-slate-500"><Lock size={12}/> <span>Solve 100 MCQs in prev chapter</span></div> : 
                   isCurrent ? <div className="text-xs font-bold text-blue-600">Target: {userProgress.totalMCQsSolved}/100 MCQs</div> : 
                   <div className="text-xs text-green-600 font-bold flex gap-1"><CheckCircle size={12}/> Completed</div>}
                </div>
                {isLocked ? <Lock className="text-slate-300"/> : isCurrent ? <PlayCircle className="text-blue-600"/> : <BookOpen className="text-green-400"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
