import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu, Code2, ShieldCheck, X, Loader2 } from 'lucide-react';
import { generateDevCode } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

export const AdminDevAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'AI'|'USER', text: string}[]>([{ role: 'AI', text: "NST AI Developer Online. How can I help?" }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'USER', text: userMsg }]);
    setInput(''); setIsLoading(true);
    const codeResponse = await generateDevCode(userMsg);
    setMessages(prev => [...prev, { role: 'AI', text: codeResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-5xl bg-[#0d1117] rounded-xl border border-slate-700 h-[85vh] flex flex-col">
            <div className="bg-[#161b22] p-4 border-b border-slate-700 flex justify-between items-center text-green-400">
                <span className="flex gap-2 items-center font-bold"><Cpu /> DEV_CONSOLE</span>
                <button onClick={onClose}><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'AI' ? 'text-slate-300' : 'text-blue-300 flex-row-reverse'}`}>
                        <div className="p-3 rounded-lg border border-slate-700 bg-[#1e1e1e] max-w-[85%] overflow-x-auto">
                           {msg.role === 'AI' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : <p>{msg.text}</p>}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-green-500 animate-pulse flex items-center gap-2"><Loader2 className="animate-spin"/> Generating Code...</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-[#161b22] flex gap-4">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-black border border-slate-700 rounded p-3 text-white" placeholder="Command..." />
                <button onClick={handleSend} className="bg-green-600 text-white px-6 rounded"><Send /></button>
            </div>
        </div>
    </div>
  );
};

