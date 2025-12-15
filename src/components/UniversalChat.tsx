import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, SystemSettings } from '../types';
import { Send, Trash2, Edit2, Shield, User as UserIcon, Lock, Clock, Coins, Crown, MessageCircle, Ban } from 'lucide-react';

interface Props { currentUser: User; onUserUpdate: (user: User) => void; isAdminView?: boolean; settings?: SystemSettings; }

export const UniversalChat: React.FC<Props> = ({ currentUser, onUserUpdate, isAdminView = false, settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const CHAT_COST = settings?.chatCost ?? 1;
  const IS_ENABLED = settings?.isChatEnabled ?? true;

  useEffect(() => {
    const loadMessages = () => { const stored = localStorage.getItem('nst_universal_chat'); if (stored) setMessages(JSON.parse(stored)); };
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const canSendMessage = () => {
      if (currentUser.role === 'ADMIN') return { allowed: true };
      if (currentUser.isChatBanned) return { allowed: false, reason: "Banned" };
      if (!IS_ENABLED) return { allowed: false, reason: "Disabled" };
      if (currentUser.isPremium) return { allowed: true };
      if (currentUser.credits < CHAT_COST) return { allowed: false, reason: `Need ${CHAT_COST} Cr` };
      if (currentUser.lastChatTime) {
          const diff = (Date.now() - new Date(currentUser.lastChatTime).getTime()) / (1000 * 60 * 60);
          if (diff < 6) return { allowed: false, reason: `Wait ${(6 - diff).toFixed(1)}h` };
      }
      return { allowed: true };
  };

  const handleSend = () => {
      if (!inputText.trim()) return;
      setErrorMsg(null);
      if (editingId && currentUser.role === 'ADMIN') {
          const updated = messages.map(m => m.id === editingId ? { ...m, text: inputText } : m);
          setMessages(updated); localStorage.setItem('nst_universal_chat', JSON.stringify(updated));
          setEditingId(null); setInputText(''); return;
      }
      const check = canSendMessage();
      if (!check.allowed) { setErrorMsg(check.reason || "Error"); return; }
      
      if (currentUser.role !== 'ADMIN' && !currentUser.isPremium) {
          onUserUpdate({ ...currentUser, credits: currentUser.credits - CHAT_COST, lastChatTime: new Date().toISOString() });
      }

      const newMsg: ChatMessage = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, text: inputText, timestamp: new Date().toISOString() };
      const updated = [...messages, newMsg];
      setMessages(updated); localStorage.setItem('nst_universal_chat', JSON.stringify(updated));
      setInputText('');
  };

  const handleDelete = (id: string) => {
      if(!window.confirm("Delete?")) return;
      const updated = messages.map(m => m.id === id ? { ...m, isDeleted: true } : m);
      setMessages(updated); localStorage.setItem('nst_universal_chat', JSON.stringify(updated));
  };

  return (
    <div className={`flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 ${isAdminView ? '' : 'max-w-4xl mx-auto'}`}>
        <div className="bg-slate-900 p-4 flex justify-between text-white items-center">
            <div className="flex gap-2"><MessageCircle /> <h3 className="font-bold">Global Chat</h3></div>
            {!isAdminView && <div className="text-xs flex gap-2">{currentUser.isPremium ? <span className="bg-yellow-500 text-black px-2 rounded font-bold">PREMIUM</span> : <span>Cost: {CHAT_COST} Cr</span>}</div>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.filter(m => !m.isDeleted).map((msg) => {
                const isMe = msg.userId === currentUser.id;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm relative group ${isMe ? 'bg-blue-600 text-white' : msg.userRole === 'ADMIN' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-white text-slate-800 border border-slate-200'}`}>
                             <div className="flex justify-between gap-2 mb-1 text-[9px] font-bold opacity-70">
                                 <span>{msg.userRole === 'ADMIN' && <Shield size={10} className="inline mr-1"/>}{msg.userName}</span>
                                 <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                             </div>
                             <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                             {currentUser.role === 'ADMIN' && <div className="absolute top-1 right-1 hidden group-hover:flex bg-white/50 rounded"><button onClick={()=> {setEditingId(msg.id); setInputText(msg.text)}}><Edit2 size={12}/></button><button onClick={()=>handleDelete(msg.id)}><Trash2 size={12}/></button></div>}
                         </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t">
            {errorMsg && <div className="text-center text-xs text-red-500 font-bold mb-2">{errorMsg}</div>}
            <div className="flex gap-2">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type message..." disabled={currentUser.isChatBanned} className="flex-1 p-3 border rounded-xl" />
                <button onClick={handleSend} disabled={!inputText.trim()} className="p-3 bg-blue-600 text-white rounded-xl"><Send size={20} /></button>
            </div>
        </div>
    </div>
  );
};

