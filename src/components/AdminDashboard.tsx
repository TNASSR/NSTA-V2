import React, { useEffect, useState } from 'react';
import { User, GiftCode, ViewState, SystemSettings, Subject, ChatMessage, PaymentRequest, CreditPackage, Board, ClassLevel, Stream, RecoveryRequest, Chapter, LessonContent, ContentType } from '../types';
import { Users, Search, Trash2, Gift, Edit, Eye, BookOpen, Save, X, Zap, Crown, Shield, Cpu, Megaphone, Settings, Terminal, Database, Plus, AlertTriangle, Coins, HardDrive, Download, Upload, ShoppingBag, Recycle, RotateCcw, Link as LinkIcon, FileCode, Sparkles, FileEdit, Mic, IndianRupee, MessageCircle, Lock, CheckCircle } from 'lucide-react';
import { UniversalChat } from './UniversalChat';
import { getSubjectsList } from '../constants';
import { fetchChapters, fetchLessonContent } from '../services/gemini';
import { LessonView } from './LessonView';
import { AudioStudio } from './AudioStudio';
import { GoogleGenAI } from "@google/genai";
import { AdminDevAssistant } from './AdminDevAssistant';

interface Props { onNavigate: (view: ViewState) => void; settings?: SystemSettings; onUpdateSettings?: (s: SystemSettings) => void; onImpersonate?: (user: User) => void; }
type AdminTab = 'OVERVIEW' | 'USERS' | 'PAYMENTS' | 'STORE' | 'CONTENT' | 'SYSTEM' | 'DATABASE' | 'RECYCLE';

export const AdminDashboard: React.FC<Props> = ({ onNavigate, settings, onUpdateSettings, onImpersonate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<GiftCode[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [search, setSearch] = useState('');
  const [storageStats, setStorageStats] = useState({ usedMB: '0.00', totalNotes: 0, totalMCQs: 0, totalPDFs: 0, percentUsed: 0 });
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings!);
  const [newApiKey, setNewApiKey] = useState('');
  
  // UI States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionCreditAmount, setActionCreditAmount] = useState<number | ''>('');
  const [showChat, setShowChat] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [giftAmount, setGiftAmount] = useState<number | ''>('');
  const [giftQuantity, setGiftQuantity] = useState<number>(1);
  
  // Content Studio
  const [contentBoard, setContentBoard] = useState<Board>('CBSE');
  const [contentClass, setContentClass] = useState<ClassLevel>('10');
  const [contentStream, setContentStream] = useState<Stream>('Science');
  const [contentSubject, setContentSubject] = useState<Subject | null>(null);
  const [contentChapters, setContentChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [generatedContent, setGeneratedContent] = useState<LessonContent | null>(null);
  const [showAudioStudio, setShowAudioStudio] = useState(false);
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [manualEditMode, setManualEditMode] = useState<ContentType | null>(null);
  const [manualText, setManualText] = useState('');
  const [pkgName, setPkgName] = useState(''); const [pkgCredits, setPkgCredits] = useState(''); const [pkgPrice, setPkgPrice] = useState('');

  const adminUser: User = { id: 'ADMIN', name: 'System Admin', role: 'ADMIN', credits: 99999, email: 'admin@nst.com', password: '', mobile: '', createdAt: '', streak: 0, lastLoginDate: '', redeemedCodes: [], progress: {} };

  useEffect(() => { loadData(); calculateStorage(); }, [activeTab]);

  const loadData = () => {
    setUsers(JSON.parse(localStorage.getItem('nst_users') || '[]'));
    setCodes(JSON.parse(localStorage.getItem('nst_admin_codes') || '[]'));
    setChatMessages(JSON.parse(localStorage.getItem('nst_universal_chat') || '[]'));
    setPaymentRequests(JSON.parse(localStorage.getItem('nst_payment_requests') || '[]'));
    setRecoveryRequests(JSON.parse(localStorage.getItem('nst_recovery_requests') || '[]'));
  };

  const calculateStorage = () => {
      let totalBytes = 0, notes = 0;
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
              totalBytes += (key.length + localStorage.getItem(key)!.length) * 2;
              if (key.startsWith('nst_custom_lesson_')) notes++;
          }
      }
      setStorageStats({ usedMB: (totalBytes / 1024 / 1024).toFixed(2), totalNotes: notes, totalMCQs: 0, totalPDFs: 0, percentUsed: 0 });
  };

  const handleBroadcast = () => { localStorage.setItem('nst_global_message', broadcastMsg); alert("Broadcast Sent!"); };
  const handleSaveSettings = () => { if (onUpdateSettings) { onUpdateSettings(localSettings); alert("Settings Saved!"); } };
  
  const handleAddKey = () => { if(newApiKey) { setLocalSettings({...localSettings, apiKeys: [...localSettings.apiKeys, newApiKey]}); setNewApiKey(''); }};
  const handleSavePackage = () => { 
      const newPkg: CreditPackage = { id: Date.now().toString(), name: pkgName, credits: Number(pkgCredits), price: Number(pkgPrice) };
      setLocalSettings({...localSettings, packages: [...localSettings.packages, newPkg]}); setPkgName(''); setPkgCredits(''); setPkgPrice('');
  };

  const handleProcessPayment = (reqId: string, action: 'APPROVE' | 'REJECT') => {
      const updatedReqs = paymentRequests.map(r => r.id === reqId ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' as any } : r);
      setPaymentRequests(updatedReqs); localStorage.setItem('nst_payment_requests', JSON.stringify(updatedReqs));
      if (action === 'APPROVE') {
          const req = paymentRequests.find(r => r.id === reqId);
          if(req) {
              const uIdx = users.findIndex(u => u.id === req.userId);
              if(uIdx !== -1) {
                  users[uIdx].credits += req.amount;
                  setUsers([...users]); localStorage.setItem('nst_users', JSON.stringify(users));
              }
          }
      }
  };

  const handleGenerateCodes = () => {
      const newCodes: GiftCode[] = Array(giftQuantity).fill(0).map(() => ({ 
          code: `NST-${Math.floor(Math.random()*10000)}-${Math.random().toString(36).substring(7).toUpperCase()}`, 
          amount: Number(giftAmount), createdAt: new Date().toISOString(), isRedeemed: false, generatedBy: 'ADMIN' 
      }));
      const updated = [...newCodes, ...codes]; setCodes(updated); localStorage.setItem('nst_admin_codes', JSON.stringify(updated));
  };

  const handleExportData = () => {
      const blob = new Blob([JSON.stringify(localStorage)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'NST_Backup.json'; a.click();
  };

  const handleContentSubjectSelect = async (subject: Subject) => {
      setContentSubject(subject);
      const chapters = await fetchChapters(contentBoard, contentClass, contentStream, subject, 'English');
      setContentChapters(chapters);
  };
  
  const handleManualSave = () => {
      if(!selectedChapter || !contentSubject || !manualEditMode) return;
      const content: LessonContent = { id: Date.now().toString(), title: selectedChapter.title, subtitle: manualEditMode, content: manualText, type: manualEditMode, dateCreated: new Date().toISOString(), subjectName: contentSubject.name };
      const key = `${contentBoard}-${contentClass}-${contentStream}-${contentSubject.name}-${selectedChapter.id}-${manualEditMode}`;
      localStorage.setItem(`nst_custom_lesson_${key}`, JSON.stringify(content));
      alert("Content Saved!"); setManualEditMode(null);
  };

  if (showChat) return <div className="p-4"><button onClick={()=>setShowChat(false)} className="mb-2 font-bold">Back</button><UniversalChat currentUser={adminUser} onUserUpdate={()=>{}} isAdminView={true} settings={localSettings}/></div>;
  if (showDevConsole) return <AdminDevAssistant onClose={()=>setShowDevConsole(false)} />;
  if (showAudioStudio) return <AudioStudio language="English" onBack={()=>setShowAudioStudio(false)} />;
  if (generatedContent) return <div className="p-4"><button onClick={()=>setGeneratedContent(null)} className="mb-2 font-bold">Back</button><LessonView content={generatedContent} subject={contentSubject!} classLevel={contentClass} chapter={selectedChapter!} loading={false} onBack={()=>setGeneratedContent(null)} isPremium={true} /></div>;

  return (
    <div className="pb-20">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['OVERVIEW','USERS','PAYMENTS','STORE','CONTENT','SYSTEM','DATABASE'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as AdminTab)} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border'}`}>{t}</button>
          ))}
      </div>

      {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="text-xs text-slate-500 uppercase font-bold">Users</div>
                  <div className="text-3xl font-black text-slate-800">{users.length}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm cursor-pointer" onClick={()=>setShowChat(true)}>
                  <div className="text-xs text-slate-500 uppercase font-bold">Chat Msgs</div>
                  <div className="text-3xl font-black text-purple-600">{chatMessages.length}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="text-xs text-slate-500 uppercase font-bold">Pending Requests</div>
                  <div className="text-3xl font-black text-orange-500">{paymentRequests.filter(p=>p.status==='PENDING').length}</div>
              </div>
              <div className="col-span-2 bg-slate-50 p-4 rounded-xl border">
                  <h3 className="font-bold mb-2">Broadcast Message</h3>
                  <div className="flex gap-2"><input className="flex-1 p-2 border rounded" value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} /><button onClick={handleBroadcast} className="bg-blue-600 text-white px-4 rounded font-bold">Send</button></div>
              </div>
          </div>
      )}

      {activeTab === 'USERS' && (
          <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-2xl border shadow-sm h-[500px] overflow-y-auto">
                  <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full p-2 border rounded-xl mb-4" />
                  {users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())).map(u => (
                      <div key={u.id} className="flex justify-between items-center p-3 border-b">
                          <div><div className="font-bold">{u.name}</div><div className="text-xs text-slate-400">{u.id} | {u.credits} Cr</div></div>
                          <button onClick={()=>setEditingUser(u)} className="text-blue-600"><Edit size={16}/></button>
                      </div>
                  ))}
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <h3 className="font-bold mb-4">Generate Gift Codes</h3>
                  <input type="number" placeholder="Amount" value={giftAmount} onChange={e=>setGiftAmount(Number(e.target.value))} className="w-full p-2 border rounded-xl mb-2" />
                  <input type="number" placeholder="Qty" value={giftQuantity} onChange={e=>setGiftQuantity(Number(e.target.value))} className="w-full p-2 border rounded-xl mb-2" />
                  <button onClick={handleGenerateCodes} className="w-full bg-green-600 text-white p-2 rounded-xl font-bold">Generate</button>
                  <div className="mt-4 h-48 overflow-y-auto bg-slate-50 p-2 rounded">{codes.map(c=><div key={c.code} className="text-xs font-mono border-b p-1 flex justify-between"><span>{c.code}</span><span>{c.amount}Cr</span></div>)}</div>
              </div>
          </div>
      )}

      {activeTab === 'PAYMENTS' && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
               {paymentRequests.map(req => (
                   <div key={req.id} className="p-4 border-b flex justify-between items-center">
                       <div><div className="font-bold">{req.userName}</div><div className="text-xs">{req.packageName} - ₹{req.amount} (TXN: {req.txnId})</div></div>
                       <div className="flex gap-2">
                           {req.status === 'PENDING' ? <><button onClick={()=>handleProcessPayment(req.id, 'APPROVE')} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button><button onClick={()=>handleProcessPayment(req.id, 'REJECT')} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button></> : <span className="text-xs font-bold">{req.status}</span>}
                       </div>
                   </div>
               ))}
          </div>
      )}

      {activeTab === 'SYSTEM' && (
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h3 className="font-bold">System Configuration</h3>
              <div className="flex items-center justify-between"><label>Maintenance Mode</label><button onClick={()=>setLocalSettings({...localSettings, maintenanceMode: !localSettings.maintenanceMode})} className={`px-4 py-1 rounded ${localSettings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>{localSettings.maintenanceMode ? 'ON' : 'OFF'}</button></div>
              <div><label className="text-xs font-bold">API Keys</label><div className="flex gap-2"><input value={newApiKey} onChange={e=>setNewApiKey(e.target.value)} className="flex-1 border p-2 rounded" /><button onClick={handleAddKey} className="bg-blue-600 text-white px-4 rounded">Add</button></div></div>
              <button onClick={()=>setShowDevConsole(true)} className="w-full bg-black text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"><Terminal size={16}/> Open Developer Console</button>
              <button onClick={handleSaveSettings} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Save Settings</button>
          </div>
      )}

      {activeTab === 'CONTENT' && (
          <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-2xl border">
                  <select onChange={e=>setContentClass(e.target.value as any)} className="w-full p-2 border mb-2">{['6','7','8','9','10','11','12'].map(c=><option key={c} value={c}>Class {c}</option>)}</select>
                  <div className="grid grid-cols-2 gap-2">{getSubjectsList(contentClass, contentStream).map(s=><button key={s.id} onClick={()=>handleContentSubjectSelect(s)} className={`p-2 border rounded text-xs ${contentSubject?.id===s.id ? 'bg-blue-600 text-white' : ''}`}>{s.name}</button>)}</div>
              </div>
              <div className="col-span-2 bg-white p-4 rounded-2xl border h-[500px] overflow-y-auto">
                  {contentChapters.map(ch => (
                      <div key={ch.id} className="p-3 border-b flex justify-between items-center group">
                          <span className="font-bold text-sm">{ch.title}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={()=>{setSelectedChapter(ch); setManualEditMode('NOTES_PREMIUM'); setManualText('')}} className="p-1 bg-blue-100 text-blue-600 rounded"><FileCode size={14}/></button>
                              <button onClick={()=>{setSelectedChapter(ch); setManualEditMode('PDF_NOTES'); setManualText('')}} className="p-1 bg-red-100 text-red-600 rounded"><LinkIcon size={14}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {manualEditMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-lg p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">{manualEditMode === 'PDF_NOTES' ? 'Add PDF Link' : 'Edit Notes'}</h3>
                  {manualEditMode === 'PDF_NOTES' ? <input placeholder="Paste PDF URL" value={manualText} onChange={e=>setManualText(e.target.value)} className="w-full p-3 border rounded mb-4"/> : <textarea value={manualText} onChange={e=>setManualText(e.target.value)} className="w-full h-64 border p-3 rounded mb-4"/>}
                  <div className="flex gap-2"><button onClick={handleManualSave} className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button><button onClick={()=>setManualEditMode(null)} className="flex-1 bg-slate-200 py-2 rounded">Cancel</button></div>
              </div>
          </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-4">{editingUser.name}</h3>
                <div className="flex gap-2 mb-4"><input type="number" placeholder="Amount" value={actionCreditAmount} onChange={e=>setActionCreditAmount(Number(e.target.value))} className="border p-2 rounded w-full" /><button onClick={()=>{const u = {...editingUser, credits: editingUser.credits + Number(actionCreditAmount)}; setEditingUser(u); const idx = users.findIndex(us=>us.id===u.id); users[idx]=u; setUsers([...users]); localStorage.setItem('nst_users', JSON.stringify(users));}} className="bg-green-500 text-white px-4 rounded">Add</button></div>
                <div className="space-y-2">
                    <button onClick={()=>{const u={...editingUser, isLocked: !editingUser.isLocked}; setEditingUser(u); const idx = users.findIndex(us=>us.id===u.id); users[idx]=u; setUsers([...users]); localStorage.setItem('nst_users', JSON.stringify(users));}} className="w-full p-2 border rounded text-red-600 font-bold">{editingUser.isLocked ? 'Unlock' : 'Lock Account'}</button>
                    {onImpersonate && <button onClick={()=>onImpersonate(editingUser)} className="w-full p-2 bg-purple-600 text-white rounded font-bold">View as User</button>}
                    <button onClick={()=>setEditingUser(null)} className="w-full p-2 bg-slate-200 rounded">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

