import React, { useState } from 'react';
import { LessonContent, Subject, ClassLevel, Chapter } from '../types';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, CheckCircle, XCircle, Share2, Download, Crown, FileText, BrainCircuit } from 'lucide-react';
import katex from 'katex';

interface Props {
  content: LessonContent; subject: Subject; classLevel: ClassLevel; chapter: Chapter; loading: boolean;
  onBack: () => void; isPremium?: boolean; onMCQComplete?: (score: number) => void;
}

export const LessonView: React.FC<Props> = ({ content, subject, chapter, onBack, isPremium, onMCQComplete }) => {
  const [mcqAnswers, setMcqAnswers] = useState<number[]>(new Array(content.mcqData?.length || 0).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleMCQSubmit = () => {
      let score = 0;
      content.mcqData?.forEach((q, i) => { if (q.correctAnswer === mcqAnswers[i]) score++; });
      setShowResults(true);
      if (onMCQComplete) onMCQComplete(score);
  };

  const renderMath = (text: string) => {
      // Basic replacement for display purposes if not using a full remark-math plugin setup
      return text; 
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white min-h-[80vh] rounded-t-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-20 p-4 border-b border-slate-100 flex justify-between items-center rounded-t-3xl">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-bold flex gap-1 items-center">&larr; Back</button>
            <div className="text-xs font-bold text-slate-400 uppercase">{content.type.replace('_',' ')}</div>
        </div>
        
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-black text-slate-900 mb-2">{content.title}</h1>
            <div className="flex gap-2 mb-6">
                <span className={`text-[10px] font-bold px-2 py-1 rounded text-white ${subject.color.includes('blue') ? 'bg-blue-600' : 'bg-slate-600'}`}>{subject.name}</span>
                {isPremium && <span className="text-[10px] font-bold px-2 py-1 rounded bg-yellow-400 text-black flex items-center gap-1"><Crown size={10}/> PREMIUM</span>}
            </div>

            {content.type.includes('MCQ') && content.mcqData ? (
                <div className="space-y-8">
                    {content.mcqData.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg mb-4 text-slate-800 flex gap-2"><span className="text-slate-400">Q{idx+1}.</span> <ReactMarkdown>{q.question}</ReactMarkdown></h3>
                            <div className="space-y-2">
                                {q.options.map((opt, oIdx) => {
                                    const isSelected = mcqAnswers[idx] === oIdx;
                                    const isCorrect = q.correctAnswer === oIdx;
                                    let btnClass = "w-full p-3 text-left rounded-lg border transition-all ";
                                    if (showResults) {
                                        if (isCorrect) btnClass += "bg-green-100 border-green-500 text-green-800";
                                        else if (isSelected) btnClass += "bg-red-100 border-red-500 text-red-800";
                                        else btnClass += "bg-white border-slate-200 opacity-50";
                                    } else {
                                        btnClass += isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 hover:bg-slate-100";
                                    }
                                    return <button key={oIdx} disabled={showResults} onClick={()=>{const newAns=[...mcqAnswers]; newAns[idx]=oIdx; setMcqAnswers(newAns)}} className={btnClass}>{opt}</button>;
                                })}
                            </div>
                            {showResults && <div className="mt-3 text-sm bg-blue-50 text-blue-800 p-3 rounded-lg"><span className="font-bold">Explanation:</span> <ReactMarkdown>{q.explanation}</ReactMarkdown></div>}
                        </div>
                    ))}
                    {!showResults ? <button onClick={handleMCQSubmit} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg">Submit Test</button> : <div className="text-center p-6 bg-slate-100 rounded-xl"><h3 className="text-2xl font-bold mb-2">Test Completed!</h3><button onClick={onBack} className="bg-slate-900 text-white px-6 py-2 rounded-lg">Finish</button></div>}
                </div>
            ) : (
                <article className="markdown-body prose prose-slate max-w-none">
                    {content.type === 'PDF_NOTES' ? (
                         content.content.startsWith('http') ? <iframe src={content.content} className="w-full h-[80vh] rounded-xl border" /> : <div className="text-center p-10 bg-red-50 text-red-600 font-bold">Invalid PDF Link</div>
                    ) : (
                         <ReactMarkdown 
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-black text-blue-900 mt-6 mb-4 border-b pb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-5 mb-3 flex items-center gap-2" {...props} />,
                                strong: ({node, ...props}) => <span className="font-bold text-slate-900 bg-yellow-100 px-1 rounded" {...props} />,
                                code: ({node, ...props}) => <code className="bg-slate-100 text-pink-600 font-mono px-1 py-0.5 rounded text-sm" {...props} />
                            }}
                         >
                            {content.content}
                         </ReactMarkdown>
                    )}
                </article>
            )}
        </div>
    </div>
  );
};

