import React, { useState } from 'react';
import { Shield, BookOpen, Lock, Coins, MessageCircle, Crown, CheckCircle2, Languages } from 'lucide-react';

interface Props { onBack: () => void; }

export const RulesPage: React.FC<Props> = ({ onBack }) => {
  const [lang, setLang] = useState<'EN' | 'HI'>('HI');
  const t = lang==='EN' ? {
      title: "App Rules", 
      sections: [
          {title:"Syllabus", points:["Start at Chapter 1.", "Solve 100 MCQs to unlock next chapter."]},
          {title:"Credits", points:["Simple Notes are Free.", "Premium Notes cost 5 Credits.", "Spin wheel daily to earn."]},
          {title:"Chat", points:["1 Credit per msg for free users.", "Premium users chat unlimited."]}
      ]
  } : {
      title: "ऐप नियम", 
      sections: [
          {title:"पाठ्यक्रम", points:["अध्याय 1 से शुरू करें।", "अगला अध्याय खोलने के लिए 100 MCQ हल करें।"]},
          {title:"क्रेडिट", points:["साधारण नोट्स मुफ्त हैं।", "प्रीमियम नोट्स के लिए 5 क्रेडिट लगेंगे।", "रोज़ स्पिन करके क्रेडिट कमाएं।"]},
          {title:"चैट", points:["फ्री यूज़र के लिए 1 क्रेडिट/मैसेज।", "प्रीमियम यूज़र के लिए अनलिमिटेड चैट।"]}
      ]
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in">
      <div className="flex justify-between mb-8 items-center"><button onClick={onBack} className="font-bold text-slate-500">Back</button><div className="flex bg-white p-1 rounded-xl border"><button onClick={()=>setLang('HI')} className={`px-3 py-1 rounded-lg text-xs font-bold ${lang==='HI'?'bg-blue-600 text-white':''}`}>हिंदी</button><button onClick={()=>setLang('EN')} className={`px-3 py-1 rounded-lg text-xs font-bold ${lang==='EN'?'bg-blue-600 text-white':''}`}>Eng</button></div></div>
      <h2 className="text-3xl font-black mb-6 text-slate-800">{t.title}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border"><h3 className="font-bold mb-4 flex gap-2"><BookOpen className="text-green-600"/> {t.sections[0].title}</h3><ul className="space-y-2 text-sm">{t.sections[0].points.map((p,i)=><li key={i} className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/>{p}</li>)}</ul></div>
        <div className="bg-white p-6 rounded-2xl border"><h3 className="font-bold mb-4 flex gap-2"><Coins className="text-yellow-500"/> {t.sections[1].title}</h3><ul className="space-y-2 text-sm">{t.sections[1].points.map((p,i)=><li key={i} className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/>{p}</li>)}</ul></div>
        <div className="bg-white p-6 rounded-2xl border"><h3 className="font-bold mb-4 flex gap-2"><MessageCircle className="text-blue-600"/> {t.sections[2].title}</h3><ul className="space-y-2 text-sm">{t.sections[2].points.map((p,i)=><li key={i} className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/>{p}</li>)}</ul></div>
      </div>
      <div className="mt-8 text-center text-xs font-black text-slate-300 uppercase tracking-widest">Developed by Nadim Anwar</div>
    </div>
  );
};

