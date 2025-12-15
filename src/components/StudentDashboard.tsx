import React, { useState, useEffect } from 'react';
import { User, Subject, StudentTab, PaymentRequest, SystemSettings } from '../types';
import { getSubjectsList } from '../constants';
import { RedeemSection } from './RedeemSection';
import { Zap, Crown, Calendar, Clock, History, Gift, Sparkles, Megaphone, Settings, Play, Mail, X, Ban, Gamepad2, Timer, CreditCard, Send, CheckCircle } from 'lucide-react';
import { HistoryPage } from './HistoryPage';
import { UniversalChat } from './UniversalChat';
import { SpinWheel } from './SpinWheel';

interface Props { user: User; dailyStudySeconds: number; onSubjectSelect: (s: Subject) => void; onRedeemSuccess: (u: User) => void; settings?: SystemSettings; }

export const StudentDashboard: React.FC<Props> = ({ user, dailyStudySeconds, onSubjectSelect, onRedeemSuccess, settings }) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('ROUTINE');
  const [showInbox, setShowInbox] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({ classLevel: user.classLevel || '10', board: user.board || 'CBSE', stream: user.stream || 'Science', newPassword: '' });
  const [pkgId, setPkgId] = useState(''); const [txnId, setTxnId] = useState('');

  const globalMessage = localStorage.getItem('nst_global_message');
  const unread = user.inbox?.filter(m => !m.read).length || 0;
  const canClaim = (!user.lastRewardClaimDate || new Date(user.lastRewardClaimDate).toDateString() !== new Date().toDateString()) && dailyStudySeconds >= 3600*3;

  const claimReward = () => {
      if(!canClaim) return;
      const u = { ...user, credits: user.credits + (settings?.dailyReward || 3), lastRewardClaimDate: new Date().toISOString() };
      onRedeemSuccess(u); alert("Reward Claimed!");
  };

  const handleUpdateUser = (u: User) => {
      const all = JSON.parse(localStorage.getItem('nst_users')||'[]');
      const i = all.findIndex((usr:User)=>usr.id===u.id);
      if(i!==-1) { all[i]=u; localStorage.setItem('nst_users', JSON.stringify(all)); onRedeemSuccess(u); }
  };

  const saveProfile = () => {
      handleUpdateUser({ ...user, ...profileData, password: profileData.newPassword || user.password });
      setEditMode(false); window.location.reload();
  };

  const submitPayment = () => {
      const pkg = settings?.packages.find(p=>p.id===pkgId);
      if(!pkg || !txnId) return;
      const req: PaymentRequest = { id: Date.now().toString(), userId: user.id, userName: user.name, packageId: pkg.id, packageName: pkg.name, amount: pkg.credits, txnId, status: 'PENDING', timestamp: new Date().toISOString() };
      localStorage.setItem('nst_payment_requests', JSON.stringify([req, ...JSON.parse(localStorage.getItem('nst_payment_requests')||'[]')]));
      alert("Payment Request Sent!"); setTxnId(''); setPkgId('');
  };

  const RoutineView = () => (
      <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold flex gap-2"><Calendar className="text-blue-600"/> Routine</h3>
            <button onClick={()=>setEditMode(true)} className="text-xs bg-slate-100 p-2 rounded flex gap-1"><Settings size={14}/> Settings</button>
          </div>
          <div className="bg-slate-900 text-white p-4 rounded-xl mb-4 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2 text-xs font-bold uppercase"><Timer size={14}/> Daily Goal</div>
                  <div className="font-mono text-xl text-green-400">{new Date(dailyStudySeconds * 1000).toISOString().substr(11, 8)}</div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2"><div className="h-full bg-green-500 transition-all" style={{width: `${Math.min((dailyStudySeconds/(3600*3))*100, 100)}%`}}></div></div>
              {canClaim && <button onClick={claimReward} className="w-full bg-yellow-500 text-black font-bold py-2 rounded animate-pulse">Claim Reward</button>}
          </div>
          <div className="space-y-3">{getSubjectsList(user.classLevel||'10', user.stream||null).map(s => (
              <div key={s.id} onClick={()=>onSubjectSelect(s)} className="p-4 border rounded-xl hover:shadow-md flex items-center gap-4 cursor-pointer bg-white">
                  <div className={`w-2 h-10 rounded ${s.color.split(' ')[0]}`}></div>
                  <div className="flex-1 font-bold text-slate-800">{s.name}</div>
                  <Play size={20} className="text-slate-300"/>
              </div>
          ))}</div>
      </div>
  );

  return (
    <div className="pb-20">
        {editMode && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-xl w-full max-w-sm"><h3 className="font-bold mb-4">Settings</h3><select value={profileData.classLevel} onChange={e=>setProfileData({...profileData, classLevel: e.target.value as any})} className="w-full border p-2 mb-2">{['6','7','8','9','10','11','12'].map(c=><option key={c} value={c}>Class {c}</option>)}</select><input placeholder="New Password" value={profileData.newPassword} onChange={e=>setProfileData({...profileData, newPassword: e.target.value})} className="w-full border p-2 mb-4"/><div className="flex gap-2"><button onClick={saveProfile} className="flex-1 bg-blue-600 text-white p-2 rounded">Save</button><button onClick={()=>setEditMode(false)} className="flex-1 bg-slate-200 p-2 rounded">Cancel</button></div></div></div>}
        
        {globalMessage && <div className="bg-blue-600 text-white p-3 rounded-xl mb-4 flex gap-2"><Megaphone size={20}/> <div className="text-sm">{globalMessage}</div></div>}
        
        <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex justify-between">
            <div className="flex gap-2 items-center"><Zap className="text-orange-500"/><div><div className="font-black text-lg">{user.streak}</div><div className="text-[10px] text-slate-400 uppercase">Streak</div></div></div>
            <div className="flex gap-2 items-center"><Crown className="text-yellow-500"/><div><div className="font-black text-lg">{user.credits}</div><div className="text-[10px] text-slate-400 uppercase">Credits</div></div></div>
            <div onClick={()=>setShowInbox(true)} className="relative cursor-pointer"><Mail size={24} className="text-slate-400"/>{unread>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unread}</span>}</div>
        </div>

        {showInbox && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-xl w-full max-w-sm"><div className="flex justify-between mb-4"><h3 className="font-bold">Inbox</h3><button onClick={()=>setShowInbox(false)}><X/></button></div><div className="max-h-60 overflow-y-auto">{user.inbox?.map(m=><div key={m.id} className="p-2 border-b text-sm">{m.text}</div>)}</div></div></div>}

        <div className="grid grid-cols-6 gap-1 mb-6 bg-slate-50 p-1 rounded-xl">
            {['ROUTINE','CHAT','GAME','HISTORY','REDEEM','PREMIUM'].map((t:any) => <button key={t} onClick={()=>setActiveTab(t)} className={`p-2 rounded-lg text-[10px] font-bold ${activeTab===t?'bg-white shadow text-blue-600':'text-slate-400'}`}>{t}</button>)}
        </div>

        {activeTab === 'ROUTINE' && <RoutineView />}
        {activeTab === 'CHAT' && <UniversalChat currentUser={user} onUserUpdate={handleUpdateUser} settings={settings} />}
        {activeTab === 'GAME' && (user.isGameBanned ? <div className="text-red-500 text-center font-bold">Game Banned</div> : <SpinWheel user={user} onUpdateUser={handleUpdateUser} />)}
        {activeTab === 'HISTORY' && <HistoryPage />}
        {activeTab === 'REDEEM' && <RedeemSection user={user} onSuccess={handleUpdateUser} />}
        {activeTab === 'PREMIUM' && (settings?.isPaymentEnabled===false ? <div className="text-center p-8 text-slate-400 font-bold">Store Closed</div> : <div className="space-y-4">{settings?.packages.map(p => <div key={p.id} onClick={()=>setPkgId(p.id)} className={`p-4 border rounded-xl cursor-pointer ${pkgId===p.id?'border-blue-500 bg-blue-50':''}`}><div className="font-bold">{p.name}</div><div>{p.credits} Cr - ₹{p.price}</div></div>)}{pkgId && <div className="p-4 border rounded-xl bg-slate-50"><div className="text-sm mb-2">UPI: {settings?.upiId}</div><input placeholder="Enter Transaction ID" value={txnId} onChange={e=>setTxnId(e.target.value)} className="w-full border p-2 rounded mb-2"/><button onClick={submitPayment} className="w-full bg-green-600 text-white py-2 rounded font-bold">Submit</button></div>}</div>)}
    </div>
  );
};

