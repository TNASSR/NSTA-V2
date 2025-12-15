import React, { useState, useEffect } from 'react';
import { 
  ClassLevel, Subject, Chapter, AppState, Board, Stream, User, ContentType, SystemSettings
} from './types';
import { fetchChapters, fetchLessonContent } from './services/gemini';
import { BoardSelection } from './components/BoardSelection';
import { ClassSelection } from './components/ClassSelection';
import { SubjectSelection } from './components/SubjectSelection';
import { ChapterSelection } from './components/ChapterSelection';
import { StreamSelection } from './components/StreamSelection';
import { LessonView } from './components/LessonView';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { AudioStudio } from './components/AudioStudio';
import { WelcomePopup } from './components/WelcomePopup';
import { PremiumModal } from './components/PremiumModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { RulesPage } from './components/RulesPage';
import { IICPage } from './components/IICPage';
import { BrainCircuit, LogOut, Newspaper, KeyRound, Lock, FileText } from 'lucide-react';

const TermsPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <FileText className="text-[var(--primary)]" /> Terms & Conditions
                </h3>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed custom-scrollbar">
                <p className="text-slate-900 font-medium">Please read carefully before using NST AI Assistant.</p>
                <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <strong className="block text-slate-800 mb-1">1. Educational Use Only</strong>
                        This app uses AI to generate content. Always verify important information with your official textbooks.
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <strong className="block text-slate-800 mb-1">2. Data Privacy</strong>
                        Your progress and notes are stored locally on your device. We do not sell your personal data.
                    </div>
                </div>
                <button onClick={onClose} className="w-full bg-blue-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg mt-4">I Agree & Continue</button>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null, originalAdmin: null, view: 'BOARDS',
    selectedBoard: null, selectedClass: null, selectedStream: null, selectedSubject: null, selectedChapter: null,
    chapters: [], lessonContent: null, loading: false, error: null, language: 'English', showWelcome: false, globalMessage: null,
    settings: {
        appName: 'NST', themeColor: '#3b82f6', maintenanceMode: false, customCSS: '', apiKeys: [],
        chatCost: 1, dailyReward: 3, signupBonus: 2, isChatEnabled: true, isGameEnabled: true, allowSignup: true, loginMessage: '',
        allowedClasses: ['6','7','8','9','10','11','12'], storageCapacity: '100 GB', isPaymentEnabled: true,
        upiId: '8227070298@paytm', upiName: 'NST Admin', qrCodeUrl: '', paymentInstructions: 'Pay via UPI', packages: []
    }
  });

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [tempSelectedChapter, setTempSelectedChapter] = useState<Chapter | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [generationDataReady, setGenerationDataReady] = useState(false);
  const [dailyStudySeconds, setDailyStudySeconds] = useState(0);

  useEffect(() => {
      const storedSettings = localStorage.getItem('nst_system_settings');
      if (storedSettings) {
          try {
              const parsed = JSON.parse(storedSettings);
              setState(prev => ({ ...prev, settings: { ...prev.settings, ...parsed } }));
          } catch(e) {}
      }
      const hasAcceptedTerms = localStorage.getItem('nst_terms_accepted');
      if (!hasAcceptedTerms) setShowTerms(true);

      const loggedInUserStr = localStorage.getItem('nst_current_user');
      if (loggedInUserStr) {
        const user: User = JSON.parse(loggedInUserStr);
        if (user.isLocked) { localStorage.removeItem('nst_current_user'); alert("Account Locked."); return; }
        const nextView = user.role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD';
        setState(prev => ({ ...prev, user, view: nextView as any, selectedBoard: user.board || null, selectedClass: user.classLevel || null, language: user.board === 'BSEB' ? 'Hindi' : 'English' }));
      }
  }, []);

  useEffect(() => {
    if (!state.user) return;
    const interval = setInterval(() => {
        setDailyStudySeconds(prev => {
            const next = prev + 1;
            localStorage.setItem('nst_daily_study_seconds', next.toString());
            return next;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.user?.id]);

  const handleLogin = (user: User) => {
    localStorage.setItem('nst_current_user', JSON.stringify(user));
    const nextView = user.role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD';
    setState(prev => ({ ...prev, user, view: nextView as any, selectedBoard: user.board || null, selectedClass: user.classLevel || null, language: user.board === 'BSEB' ? 'Hindi' : 'English' }));
  };

  const handleLogout = () => {
    localStorage.removeItem('nst_current_user');
    setState(prev => ({ ...prev, user: null, originalAdmin: null, view: 'BOARDS', selectedBoard: null, selectedClass: null }));
  };

  const goBack = () => {
    setState(prev => {
      if (prev.view === 'LESSON') return { ...prev, view: 'CHAPTERS', lessonContent: null };
      if (prev.view === 'CHAPTERS') return { ...prev, view: prev.user?.role === 'STUDENT' ? 'STUDENT_DASHBOARD' as any : 'SUBJECTS' };
      if (prev.view === 'SUBJECTS') return { ...prev, view: 'CLASSES' };
      if (prev.view === 'CLASSES') return { ...prev, view: 'BOARDS' };
      if (prev.view === 'BOARDS') return { ...prev, view: 'ADMIN_DASHBOARD' as any };
      return { ...prev, view: prev.user?.role === 'ADMIN' ? 'ADMIN_DASHBOARD' as any : 'STUDENT_DASHBOARD' as any };
    });
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setState(prev => ({ ...prev, selectedSubject: subject, loading: true }));
    try {
        const chapters = await fetchChapters(state.selectedBoard!, state.selectedClass!, state.selectedStream, subject, state.language);
        setState(prev => ({ ...prev, chapters, view: 'CHAPTERS', loading: false }));
    } catch (e) { setState(prev => ({ ...prev, loading: false })); }
  };

  const handleContentGeneration = async (type: ContentType) => {
      setShowPremiumModal(false);
      setState(prev => ({ ...prev, selectedChapter: tempSelectedChapter, loading: true }));
      setGenerationDataReady(false);
      try {
          const content = await fetchLessonContent(state.selectedBoard!, state.selectedClass!, state.selectedStream!, state.selectedSubject!, tempSelectedChapter!, state.language, type, 0, state.user?.isPremium || state.user?.role === 'ADMIN');
          setState(prev => ({ ...prev, lessonContent: content }));
          setGenerationDataReady(true);
      } catch (e) { setState(prev => ({ ...prev, loading: false })); }
  };

  if (state.settings.maintenanceMode && state.user?.role !== 'ADMIN') return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><Lock size={48} /> Maintenance Mode</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans relative">
      {showTerms && <TermsPopup onClose={() => setShowTerms(false)} />}
      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-100 p-4 flex justify-between items-center">
         <div className="flex items-center gap-2"><BrainCircuit size={24} className="text-blue-600" /><h1 className="font-black text-lg">{state.settings.appName}</h1></div>
         {state.user && <button onClick={handleLogout}><LogOut size={20} className="text-red-500" /></button>}
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
        {!state.user ? <Auth onLogin={handleLogin} /> : (
            <>
                {state.view === 'IIC' && <IICPage user={state.user} onBack={goBack} />}
                {state.view === 'RULES' && <RulesPage onBack={goBack} />}
                {state.view === 'ADMIN_DASHBOARD' && <AdminDashboard onNavigate={(v) => setState(prev => ({...prev, view: v}))} settings={state.settings} onUpdateSettings={(s) => setState(p => ({...p, settings: s}))} onImpersonate={(u) => setState(prev => ({...prev, originalAdmin: prev.user, user: u, view: 'STUDENT_DASHBOARD'}))} />}
                {state.view === 'STUDENT_DASHBOARD' as any && <StudentDashboard user={state.user} dailyStudySeconds={dailyStudySeconds} onSubjectSelect={handleSubjectSelect} onRedeemSuccess={u => setState(prev => ({...prev, user: u}))} settings={state.settings} />}
                {state.view === 'BOARDS' && <BoardSelection onSelect={(b) => setState(prev => ({ ...prev, selectedBoard: b, view: 'CLASSES', language: b === 'BSEB' ? 'Hindi' : 'English' }))} onBack={goBack} />}
                {state.view === 'CLASSES' && <ClassSelection selectedBoard={state.selectedBoard} allowedClasses={state.settings.allowedClasses} onSelect={(c) => setState(prev => ({ ...prev, selectedClass: c, view: ['11','12'].includes(c) ? 'STREAMS' : 'SUBJECTS' }))} onBack={goBack} />}
                {state.view === 'STREAMS' && <StreamSelection onSelect={(s) => setState(prev => ({ ...prev, selectedStream: s, view: 'SUBJECTS' }))} onBack={goBack} />}
                {state.view === 'SUBJECTS' && <SubjectSelection classLevel={state.selectedClass!} stream={state.selectedStream} onSelect={handleSubjectSelect} onBack={goBack} />}
                {state.view === 'CHAPTERS' && <ChapterSelection chapters={state.chapters} subject={state.selectedSubject!} classLevel={state.selectedClass!} loading={state.loading} user={state.user} onSelect={(ch) => { setTempSelectedChapter(ch); setShowPremiumModal(true); }} onBack={goBack} />}
                {state.view === 'LESSON' && state.lessonContent && <LessonView content={state.lessonContent} subject={state.selectedSubject!} classLevel={state.selectedClass!} chapter={state.selectedChapter!} loading={false} onBack={goBack} isPremium={true} />}
            </>
        )}
      </main>
      {state.loading && <LoadingOverlay dataReady={generationDataReady} onComplete={() => setState(prev => ({ ...prev, loading: false, view: 'LESSON' }))} />}
      {showPremiumModal && tempSelectedChapter && <PremiumModal chapter={tempSelectedChapter} credits={state.user?.credits || 0} isAdmin={state.user?.role === 'ADMIN'} onSelect={handleContentGeneration} onClose={() => setShowPremiumModal(false)} />}
      {state.showWelcome && <WelcomePopup onStart={() => setState(prev => ({ ...prev, showWelcome: false }))} isResume={!!state.user} />}
    </div>
  );
};
export default App;

