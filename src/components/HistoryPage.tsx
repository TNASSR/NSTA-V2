import React, { useState, useEffect } from 'react';
import { LessonContent } from '../types';
import { BookOpen, Calendar, Trash2 } from 'lucide-react';
import { LessonView } from './LessonView';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<LessonContent[]>([]);
  const [selected, setSelected] = useState<LessonContent | null>(null);

  useEffect(() => {
    const data = [];
    for(let i=0; i<localStorage.length; i++) {
        const k = localStorage.key(i);
        if(k?.startsWith('nst_custom_lesson_')) {
            try { data.push(JSON.parse(localStorage.getItem(k)!)); } catch(e){}
        }
    }
    setHistory(data.sort((a,b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()));
  }, []);

  if(selected) return <div className="p-4"><button onClick={()=>setSelected(null)} className="mb-4 font-bold">Back</button><LessonView content={selected} subject={{id:'h',name:selected.subjectName,icon:'',color:''}} classLevel={'10'} chapter={{id:'h',title:selected.title}} loading={false} onBack={()=>setSelected(null)} isPremium={true}/></div>;

  return (
    <div className="space-y-4">
        <h3 className="font-bold text-xl flex gap-2"><BookOpen className="text-blue-600"/> Saved Content</h3>
        {history.length === 0 ? <p className="text-slate-400">No saved lessons found.</p> : history.map(h => (
            <div key={h.id} onClick={()=>setSelected(h)} className="p-4 border rounded-xl bg-white hover:shadow-md cursor-pointer flex justify-between group">
                <div>
                    <div className="font-bold text-lg">{h.title}</div>
                    <div className="text-xs text-slate-500 flex gap-2"><span className="bg-slate-100 px-1 rounded">{h.subjectName}</span> <span>{new Date(h.dateCreated).toLocaleDateString()}</span></div>
                </div>
                <div className="text-xs font-bold text-[var(--primary)] self-center">{h.type}</div>
            </div>
        ))}
    </div>
  );
};

