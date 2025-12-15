import React, { useState, useEffect } from 'react';
import { User, Board, ClassLevel, Stream, SystemSettings, RecoveryRequest } from '../types';
import { ADMIN_EMAIL } from '../constants';
import { UserPlus, LogIn, ShieldCheck, Copy, Check, AlertTriangle, XCircle, Send, RefreshCcw, ShieldAlert, Lock } from 'lucide-react';

interface Props { onLogin: (user: User) => void; }

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'ADMIN' | 'RECOVERY' | 'SUCCESS_ID'>('LOGIN');
  const [generatedId, setGeneratedId] = useState('');
  const [formData, setFormData] = useState({ id: '', password: '', name: '', mobile: '', email: '', board: 'CBSE' as Board, classLevel: '10' as ClassLevel, stream: 'Science' as Stream });
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => { const s = localStorage.getItem('nst_system_settings'); if (s) setSettings(JSON.parse(s)); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users: User[] = JSON.parse(localStorage.getItem('nst_users') || '[]');

    if (view === 'LOGIN') {
        const u = users.find(u => (u.id === formData.id || u.mobile === formData.id) && u.password === formData.password);
        if (u) onLogin(u); else setError('Invalid Credentials');
    } else if (view === 'SIGNUP') {
        const newId = `NST-${Math.floor(1000 + Math.random() * 9000)}`;
        const newUser: User = { 
            id: newId, password: formData.password, name: formData.name, mobile: formData.mobile, email: formData.email, 
            role: 'STUDENT', createdAt: new Date().toISOString(), credits: 2, streak: 0, lastLoginDate: new Date().toISOString(), redeemedCodes: [], 
            board: formData.board, classLevel: formData.classLevel, stream: formData.stream, progress: {} 
        };
        localStorage.setItem('nst_users', JSON.stringify([...users, newUser]));
        setGeneratedId(newId); setView('SUCCESS_ID');
    } else if (view === 'ADMIN') {
        if (formData.email === ADMIN_EMAIL || formData.password === 'NSTA') {
             // Create Default Admin if not exists
             const admin: User = { id: 'ADMIN', name: 'Admin', role: 'ADMIN', credits: 9999, email: ADMIN_EMAIL, password: '', mobile: '', createdAt: '', streak: 0, lastLoginDate: '', redeemedCodes: [], progress: {} };
             onLogin(admin);
        } else setError('Invalid Admin Code');
    }
  };

  if (view === 'SUCCESS_ID') return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Account Created!</h2>
          <div className="bg-slate-100 p-4 rounded-xl font-mono text-2xl font-bold mb-4">{generatedId}</div>
          <button onClick={() => setView('LOGIN')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Login Now</button>
      </div>
  );

  return (
    <div className="flex items-center justify-center p-4 py-10">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {view === 'LOGIN' ? <LogIn className="text-blue-600"/> : view === 'SIGNUP' ? <UserPlus className="text-blue-600"/> : <Lock className="text-purple-600"/>}
            {view === 'LOGIN' ? 'Student Login' : view === 'SIGNUP' ? 'Create Account' : 'Admin Login'}
        </h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'SIGNUP' && (
                <>
                    <input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl" required />
                    <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-xl" required />
                    <input placeholder="Mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full p-3 border rounded-xl" required />
                </>
            )}
            <input placeholder={view === 'ADMIN' ? 'Admin Email/Code' : "Login ID or Mobile"} value={view === 'ADMIN' ? formData.email : formData.id} onChange={e => view === 'ADMIN' ? setFormData({...formData, email: e.target.value}) : setFormData({...formData, id: e.target.value})} className="w-full p-3 border rounded-xl" required />
            <input placeholder={view === 'ADMIN' ? 'Secret Code' : "Password"} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border rounded-xl" required />
            
            {view === 'SIGNUP' && (
                <div className="grid grid-cols-2 gap-2">
                    <select value={formData.board} onChange={e => setFormData({...formData, board: e.target.value as any})} className="p-3 border rounded-xl"><option value="CBSE">CBSE</option><option value="BSEB">BSEB</option></select>
                    <select value={formData.classLevel} onChange={e => setFormData({...formData, classLevel: e.target.value as any})} className="p-3 border rounded-xl">{['6','7','8','9','10','11','12'].map(c=><option key={c} value={c}>{c}</option>)}</select>
                </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all">
                {view === 'LOGIN' ? 'Login' : view === 'SIGNUP' ? 'Sign Up' : 'Verify Admin'}
            </button>
        </form>

        <div className="mt-6 text-center text-sm">
            {view === 'LOGIN' && (
                <>
                    <p>New Student? <button onClick={() => setView('SIGNUP')} className="text-blue-600 font-bold">Register Here</button></p>
                    <button onClick={() => setView('ADMIN')} className="text-[10px] text-slate-400 font-bold mt-4 uppercase">Admin Access</button>
                </>
            )}
            {view !== 'LOGIN' && <button onClick={() => setView('LOGIN')} className="text-slate-500 font-bold">Back to Login</button>}
        </div>
      </div>
    </div>
  );
};

