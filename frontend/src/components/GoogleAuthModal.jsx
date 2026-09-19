import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, User, Lock, Mail, ArrowRight, UserCheck, Plane, Compass } from 'lucide-react';

export default function GoogleAuthModal({ isOpen, onClose, user, setUser, onEnterDashboard }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'guest'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Clear errors on tab switch
  useEffect(() => {
    setErrorMessage('');
  }, [activeTab]);

  if (!isOpen) return null;

  const handleGuestEntry = () => {
    setIsLoading(true);
    setTimeout(() => {
      const guestUser = {
        name: 'Guest Passenger',
        email: 'guest@skylinesarathi.ai',
        picture: null,
        role: 'Guest Aviation Explorer',
        badge: 'Guest Access',
        isGuest: true,
      };
      setUser(guestUser);
      localStorage.setItem('aero_user', JSON.stringify(guestUser));
      setIsLoading(false);
      onClose();
      if (onEnterDashboard) {
        onEnterDashboard(guestUser);
      }
    }, 300);
  };

  const handleGoogleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockGoogleUser = {
        name: 'SIH Aviation Analyst',
        email: 'analyst.sih2026@gov.in',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        role: 'Verified Aviation Analyst',
        badge: 'Google OAuth 2.0',
        isGuest: false,
      };
      setUser(mockGoogleUser);
      localStorage.setItem('aero_user', JSON.stringify(mockGoogleUser));
      setIsLoading(false);
      onClose();
      if (onEnterDashboard) {
        onEnterDashboard(mockGoogleUser);
      }
    }, 400);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const authenticatedUser = {
        name: loginEmail.split('@')[0].toUpperCase(),
        email: loginEmail,
        picture: null,
        role: 'Aviation Route Analyst',
        badge: 'Direct Login Verified',
        isGuest: false,
      };
      setUser(authenticatedUser);
      localStorage.setItem('aero_user', JSON.stringify(authenticatedUser));
      setIsLoading(false);
      onClose();
      if (onEnterDashboard) {
        onEnterDashboard(authenticatedUser);
      }
    }, 400);
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      setErrorMessage('All fields are required.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const authenticatedUser = {
        name: signUpName,
        email: signUpEmail,
        picture: null,
        role: 'Registered Flight Planner',
        badge: 'Account Verified',
        isGuest: false,
      };
      setUser(authenticatedUser);
      localStorage.setItem('aero_user', JSON.stringify(authenticatedUser));
      setIsLoading(false);
      onClose();
      if (onEnterDashboard) {
        onEnterDashboard(authenticatedUser);
      }
    }, 400);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('aero_user');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden animate-fadeIn"
      onClick={onClose}
    >
      {/* Blurred background using image 240 in ezgif as requested */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105 filter blur-xl"
        style={{
          backgroundImage: `url('/ezgif-frames/ezgif-frame-240.jpg'), url('/optimized-frames/frame-240.jpg'), url('/sky_clouds_bg.jpg')`,
        }}
      />
      {/* Soft overlay tint */}
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-md" />

      {/* Glassmorphism Auth Card */}
      <div 
        className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.25)] text-slate-900 font-['Space_Grotesk'] overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Light Highlights */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-sky-300/20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="relative mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] font-bold tracking-wider text-blue-800 mb-2 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            SKYLINE <span className="tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span> // ACCESS PORTAL
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {user 
              ? 'Active Aviation Session' 
              : activeTab === 'guest' 
              ? 'Guest Dashboard Entry' 
              : activeTab === 'login' 
              ? 'Welcome Aboard' 
              : 'Create Flight Account'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {user 
              ? 'Your authenticated session is active. Proceed directly to the dashboard.'
              : activeTab === 'guest'
              ? 'Explore real-time flight routes, price predictions, and aircraft analytics with zero sign-up required.'
              : 'Access machine-learning airfare predictions, dynamic corridor charts, and route maps.'}
          </p>
        </div>

        {user ? (
          /* Active User Session */
          <div className="space-y-4 relative">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-sm">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-11 h-11 rounded-full border border-blue-400/40 object-cover" 
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm truncate text-slate-900">{user.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <div className="text-xs text-slate-500 font-mono truncate">{user.email}</div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-semibold">
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onEnterDashboard) onEnterDashboard(user);
              }}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              Sign Out (Switch Account)
            </button>
          </div>
        ) : (
          /* 3 Entry Options: Login | Sign Up | Continue as Guest */
          <div className="relative space-y-4">
            
            {/* 3-Segment Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`py-2 text-xs font-bold rounded-xl tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`py-2 text-xs font-bold rounded-xl tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guest')}
                className={`py-2 text-xs font-bold rounded-xl tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'guest'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guest
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="analyst@airline-cpi.gov.in"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Verifying...' : 'Login & Enter Dashboard'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* TAB 2: SIGN UP FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Vikramaditya Sharma"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="analyst@airline-cpi.gov.in"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Confirm
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account & Enter'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* TAB 3: CONTINUE AS GUEST OPTION */}
            {activeTab === 'guest' && (
              <div className="space-y-3.5 py-1">
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-left">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Instant Guest Access</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter directly without account creation or password. All dynamic pricing engines, route maps, and AI forecasting are fully accessible.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGuestEntry}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plane className="w-4 h-4" />
                  <span>{isLoading ? 'Entering Dashboard...' : 'Continue as Guest'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Guest CTA if on Login or Sign Up tab */}
            {activeTab !== 'guest' && (
              <div className="pt-2">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="w-full border-t border-slate-300" />
                  <span className="absolute px-3 bg-white/80 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                    Instant Access
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGuestEntry}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/90 border border-slate-300 text-slate-800 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Continue as Guest</span>
                </button>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Skyline <span className="tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span> Aviation Engine</span>
          <span className="font-semibold text-blue-700">MoSPI SIH 2026</span>
        </div>
      </div>
    </div>
  );
}
