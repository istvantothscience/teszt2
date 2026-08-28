import React, { useState } from 'react';
import {
  Atom,
  Lock,
  Mail,
  UserCheck,
  UserPlus,
  LogIn,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PREDEFINED_STUDENTS } from '../data/physicsData';
import { PredefinedStudent, StudentProfile } from '../types/physics';

interface LoginViewProps {
  onLogin: (email: string, password?: string) => Promise<{ user: StudentProfile | null; error?: string }>;
  onRegister: (fullName: string, email: string, password?: string) => Promise<{ user: StudentProfile | null; error?: string }>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister }) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickStudentSelect = async (student: PredefinedStudent) => {
    setEmail(student.email);
    setPassword(student.passwordPlaceholder);
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await onLogin(student.email, student.passwordPlaceholder);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Kérjük, add meg az email címedet!');
      return;
    }

    setLoading(true);
    try {
      if (activeMode === 'login') {
        const res = await onLogin(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Kérjük, add meg a teljes nevedet!');
          setLoading(false);
          return;
        }
        const res = await onRegister(fullName, email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Hiba történt a művelet során.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
          <Atom className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Fizika Kihívás
        </h1>
        <p className="mt-2 text-sm text-slate-700 max-w-md mx-auto">
          Lépj be diákfiókoddal, oldd meg a fizika feladatokat és versenyezz a rangsor éléért!
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Predefined Student Quick-Select Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>3 Előre rögzített diák profil (1-Kattintásos belépés):</span>
            </h2>
            <span className="text-[11px] bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              Supabase Auth
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PREDEFINED_STUDENTS.map((student) => (
              <button
                key={student.id}
                type="button"
                id={`quick-login-${student.id}`}
                disabled={loading}
                onClick={() => handleQuickStudentSelect(student)}
                className="flex flex-col items-center text-center p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group disabled:opacity-50"
              >
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-500 shadow-xs mb-2"
                />
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  {student.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate w-full">
                  {student.role}
                </span>
                <span className="mt-1.5 inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{student.defaultScore} pont</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Credentials Box */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-8">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              id="mode-login-tab"
              onClick={() => {
                setActiveMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeMode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center justify-center space-x-1.5">
                <LogIn className="w-4 h-4" />
                <span>Bejelentkezés</span>
              </span>
            </button>
            <button
              type="button"
              id="mode-register-tab"
              onClick={() => {
                setActiveMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeMode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center justify-center space-x-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Új Diák Regisztráció</span>
              </span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 flex items-start space-x-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teljes Név
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="input-full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="pl. Szabó Levente"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Cím
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="input-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="diak@fizika.hu"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jelszó
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  id="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-auth-form"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {activeMode === 'login' ? 'Bejelentkezés a rendszerbe' : 'Fiók létrehozása és belépés'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Biztonságos Supabase adatbázis & Auth hitelesítés</span>
          </div>
        </div>
      </div>
    </div>
  );
};
