import React, { useState, useEffect } from 'react';
import { Play, Square, Volume2, RotateCcw, Copy, Check } from 'lucide-react';
import { Language } from '../types';

interface Props { language: Language; onBack: () => void; }

export const AudioStudio: React.FC<Props> = ({ language, onBack }) => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { return () => window.speechSynthesis.cancel(); }, []);

  const handlePlay = () => {
    if (paused) { window.speechSynthesis.resume(); setPaused(false); setIsPlaying(true); return; }
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (language === 'Hindi') u.lang = 'hi-IN'; else u.lang = 'en-US';
    
    // Try to find a good voice
    const voice = voices.find(v => v.lang.includes(language === 'Hindi' ? 'hi' : 'en'));
    if (voice) u.voice = voice;

    u.onend = () => { setIsPlaying(false); setPaused(false); };
    u.onstart = () => setIsPlaying(true);
    setUtterance(u); window.speechSynthesis.speak(u);
  };

  const handleStop = () => { window.speechSynthesis.cancel(); setIsPlaying(false); setPaused(false); };
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8">
      <div className="flex items-center mb-8"><button onClick={onBack} className="text-slate-500 hover:text-slate-800 mr-4 font-bold">Back</button><h2 className="text-2xl font-bold flex gap-2"><Volume2 className="text-blue-600"/> Audio Studio</h2></div>
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="mb-4 flex justify-between"><label className="font-bold text-sm text-slate-500 uppercase">Input Text ({language})</label><button onClick={handleCopy} className="text-blue-600 text-xs font-bold flex gap-1">{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy'}</button></div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={language === 'Hindi' ? "यहाँ पेस्ट करें..." : "Paste text here..."} className="w-full h-64 p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none font-medium" />
        <div className="mt-6 flex gap-4 justify-center">
          {!isPlaying ? <button onClick={handlePlay} disabled={!text.trim()} className="flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg bg-blue-600 text-white hover:scale-105 transition-transform"><Play size={20}/> Play Audio</button>
          : <button onClick={handleStop} className="flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg bg-red-500 text-white hover:scale-105 transition-transform"><Square size={20}/> Stop</button>}
          <button onClick={() => setText('')} className="p-3 text-slate-500 hover:bg-slate-100 rounded-full"><RotateCcw size={20} /></button>
        </div>
        <div className="mt-6 text-center text-xs text-slate-400">Powered by Web Speech API</div>
      </div>
    </div>
  );
};

