import React, { useState } from 'react';
import { Gift, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { User, GiftCode } from '../types';

interface Props { user: User; onSuccess: (u: User) => void; }

export const RedeemSection: React.FC<Props> = ({ user, onSuccess }) => {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleRedeem = () => {
    const codes: GiftCode[] = JSON.parse(localStorage.getItem('nst_admin_codes') || '[]');
    const idx = codes.findIndex(c => c.code === code.trim() && !c.isRedeemed);
    
    if (idx === -1) { setMsg({ type: 'err', text: 'Invalid or Used Code' }); return; }
    
    codes[idx].isRedeemed = true; codes[idx].redeemedBy = user.id;
    localStorage.setItem('nst_admin_codes', JSON.stringify(codes));
    
    const updated = { ...user, credits: user.credits + codes[idx].amount, redeemedCodes: [...user.redeemedCodes, code] };
    const allUsers = JSON.parse(localStorage.getItem('nst_users') || '[]');
    const uIdx = allUsers.findIndex((u:User) => u.id === user.id);
    if(uIdx !== -1) { allUsers[uIdx] = updated; localStorage.setItem('nst_users', JSON.stringify(allUsers)); }
    
    setMsg({ type: 'success', text: `Success! +${codes[idx].amount} Credits` });
    setCode('');
    setTimeout(() => onSuccess(updated), 1000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm mt-6">
        <h3 className="font-bold flex gap-2 items-center mb-4"><Gift className="text-purple-600"/> Redeem Code</h3>
        <div className="flex gap-2">
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="NST-XXXX-XXXX" className="flex-1 border p-3 rounded-xl uppercase font-mono" />
            <button onClick={handleRedeem} className="bg-purple-600 text-white p-3 rounded-xl"><ArrowRight/></button>
        </div>
        {msg.text && <div className={`mt-2 text-sm font-bold flex gap-1 ${msg.type==='err'?'text-red-500':'text-green-600'}`}>{msg.type==='err'?<AlertCircle size={16}/>:<CheckCircle size={16}/>} {msg.text}</div>}
    </div>
  );
};

