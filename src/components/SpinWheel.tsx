import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Trophy, Clock, Zap, Star } from 'lucide-react';

interface Props { user: User; onUpdateUser: (user: User) => void; }

const WHEEL_SEGMENTS = [
  { value: 10, color: '#fbbf24', text: '#78350f', label: '10 CR' },
  { value: 0, color: '#ef4444', text: '#ffffff', label: '0' },
  { value: 2, color: '#3b82f6', text: '#ffffff', label: '2' },
  { value: 1, color: '#22c55e', text: '#ffffff', label: '1' },
  { value: 3, color: '#a855f7', text: '#ffffff', label: '3' },
  { value: 0, color: '#ef4444', text: '#ffffff', label: '0' },
  { value: 5, color: '#f97316', text: '#ffffff', label: '5' },
  { value: 1, color: '#22c55e', text: '#ffffff', label: '1' },
  { value: 2, color: '#3b82f6', text: '#ffffff', label: '2' },
  { value: 0, color: '#ef4444', text: '#ffffff', label: '0' },
  { value: 3, color: '#a855f7', text: '#ffffff', label: '3' },
  { value: 1, color: '#22c55e', text: '#ffffff', label: '1' },
];

export const SpinWheel: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [canSpin, setCanSpin] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const check = () => {
      if (!user.lastSpinTime) { setCanSpin(true); setTimeLeft('Ready'); return; }
      const diff = Date.now() - new Date(user.lastSpinTime).getTime();
      if (diff >= 86400000) { setCanSpin(true); setTimeLeft('Ready'); }
      else {
        setCanSpin(false);
        const rem = 86400000 - diff;
        setTimeLeft(`${Math.floor(rem/3600000)}h ${Math.floor((rem%3600000)/60000)}m`);
      }
    };
    check(); const i = setInterval(check, 1000); return () => clearInterval(i);
  }, [user.lastSpinTime]);

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;
    setIsSpinning(true);
    const winIdx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const won = WHEEL_SEGMENTS[winIdx].value;
    const finalRot = 360 * 5 + (360 - (winIdx * 30)) + Math.floor(Math.random()*20);
    setRotation(r => r + finalRot);

    setTimeout(() => {
      setIsSpinning(false);
      onUpdateUser({ ...user, credits: user.credits + won, lastSpinTime: new Date().toISOString() });
      alert(won > 0 ? `Congrats! You won ${won} Credits!` : "Bad luck! Try tomorrow.");
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center py-6">
      <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Trophy className="text-yellow-500"/> Spin & Win</h2>
      <div className="relative w-64 h-64 mb-8">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-10 bg-red-600 clip-path-polygon"></div>
        <div className="w-full h-full rounded-full border-4 border-slate-800 relative overflow-hidden transition-transform duration-[5000ms] ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
            {WHEEL_SEGMENTS.map((s, i) => (
                <div key={i} className="absolute top-0 left-1/2 w-[50%] h-[50%] origin-bottom-left" style={{ transform: `rotate(${i * 30}deg) skewY(-60deg)` }}>
                    <div className="absolute inset-0 border-r border-black/10" style={{ backgroundColor: s.color, transform: `skewY(60deg)`, transformOrigin: '0% 100%' }}>
                        <span className="absolute top-[20%] left-[60%] -translate-x-1/2 font-bold text-xs" style={{ color: s.text, transform: 'rotate(15deg)' }}>{s.label}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
      {canSpin ? <button onClick={handleSpin} disabled={isSpinning} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-black shadow-lg">SPIN NOW</button> : <div className="bg-slate-800 text-white px-6 py-3 rounded-xl font-mono">{timeLeft}</div>}
    </div>
  );
};

