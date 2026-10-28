import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Bot, 
  FileText, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Languages, 
  Menu as MenuIcon, 
  X, 
  ShieldAlert,
  Sparkles,
  Settings,
  BookOpen,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuDropdownOpen, setDesktopMenuDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDesktopMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Public navigation links - Demo Portal completely removed from public website
  const navLinks = [
    { to: '/', label: t('navHome') },
    { to: '/chat', label: t('navTalkToAI'), isAI: true },
    { to: '/report', label: t('navReport') },
    { to: '/track', label: t('navTrack') },
    { to: '/my-complaints', label: t('navMyComplaints'), requiresAuth: true },
  ];

  // The main menu sections (Settings, How to Use, About, Terms)
  const menuSections = [
    {
      to: '/settings',
      label: t('navSettings'),
      desc: language === 'ta' ? 'மொழி & குரல் விருப்பங்கள்' : language === 'tanglish' ? 'Language, Voice & Accessibility' : 'Customize language, voice, and accessibility',
      icon: Settings,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      to: '/how-to-use',
      label: t('navHowToUse'),
      desc: language === 'ta' ? 'படிநிலைகள் கொண்ட வழிகாட்டி' : language === 'tanglish' ? 'Interactive user guide' : 'Interactive user guide',
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      to: '/about',
      label: t('navAbout'),
      desc: language === 'ta' ? 'திட்ட நோக்கம் & சிறப்பம்சங்கள்' : language === 'tanglish' ? 'Platform overview & capabilities' : 'Platform overview and capabilities',
      icon: Info,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      to: '/terms',
      label: t('navTerms'),
      desc: language === 'ta' ? 'விதிமுறைகள் & பொறுப்பான பயன்பாடு' : language === 'tanglish' ? 'Guidelines & platform policies' : 'User guidelines and platform policies',
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50'
    }
  ];

  // If user is logged in as an officer/demo admin, add authority section in menu
  const isOfficerOrAdmin = user && (user.role === 'OFFICER' || user.role === 'DEMO_ADMIN');
  if (isOfficerOrAdmin) {
    menuSections.push({
      to: '/demo-authority',
      label: t('navOfficerPortal'),
      desc: 'Simulated civic authority resolution workflow',
      icon: Shield,
      color: 'text-purple-600 bg-purple-50'
    });
  }

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const isMenuSectionActive = menuSections.some(sec => location.pathname === sec.to);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-civic-navy-900 to-civic-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-civic-navy-900 font-sans">
                  NammaCivic
                </span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-civic-blue-600 text-white tracking-widest uppercase">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none hidden sm:block">
                {t('brandSlogan')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              const isActive = location.pathname === link.to;

              if (link.isAI) {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-civic-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all mx-1"
                  >
                    <Bot className="w-4 h-4 animate-pulse" />
                    <span>{link.label}</span>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </Link>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-civic-blue-600 font-bold'
                      : 'text-slate-600 hover:text-civic-navy-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Desktop Menu Dropdown Trigger (Settings, How to Use, About, Terms) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDesktopMenuDropdownOpen(!desktopMenuDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isMenuSectionActive || desktopMenuDropdownOpen
                    ? 'bg-slate-100 text-civic-blue-700 border-slate-300'
                    : 'text-slate-700 hover:bg-slate-100 border-transparent hover:border-slate-200'
                }`}
                aria-expanded={desktopMenuDropdownOpen}
                aria-label="Toggle App Menu"
              >
                <MenuIcon className="w-4 h-4 text-civic-blue-600" />
                <span>{t('navMenu')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${desktopMenuDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Card */}
              {desktopMenuDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('navMenu')}
                    </span>
                  </div>

                  {menuSections.map((sec) => {
                    const IconComp = sec.icon;
                    const isActive = location.pathname === sec.to;
                    return (
                      <Link
                        key={sec.to}
                        to={sec.to}
                        onClick={() => setDesktopMenuDropdownOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-blue-50 border border-blue-200 text-civic-navy-900' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${sec.color} flex-shrink-0 mt-0.5`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs block text-civic-navy-900">
                            {sec.label}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {sec.desc}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action: Language Selector & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-xs shadow-sm">
              <Languages className="w-4 h-4 text-civic-blue-600" />
              <select
                value={language}
                onChange={handleLangChange}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
                aria-label="Select Interface Language"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="tanglish">Tanglish</option>
              </select>
            </div>

            {/* User Auth controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/my-complaints"
                  className="flex items-center gap-1.5 text-xs font-bold text-civic-navy-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5 text-civic-blue-600" />
                  <span className="max-w-[120px] truncate">{user?.full_name?.split(' ')[0]}</span>
                  {isOfficerOrAdmin && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded font-semibold ml-1">
                      Staff
                    </span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold text-civic-blue-600 hover:text-civic-navy-900 px-4 py-2 rounded-xl border border-civic-blue-600/30 hover:border-civic-blue-600 transition-colors"
              >
                {t('navSignIn')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl animate-fadeIn">
          {/* Main Links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>

          {/* Dedicated Menu Sections (Settings, How to Use, About, Terms) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-3">
              {t('navMenu')}
            </span>
            <div className="grid grid-cols-1 gap-1">
              {menuSections.map((sec) => {
                const IconComp = sec.icon;
                const isActive = location.pathname === sec.to;
                return (
                  <Link
                    key={sec.to}
                    to={sec.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-blue-50 text-civic-blue-800' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${sec.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span>{sec.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Language Selector & Auth in Mobile */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-civic-blue-600" />
              <select
                value={language}
                onChange={handleLangChange}
                className="text-xs bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-bold"
                aria-label="Select mobile language"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="tanglish">Tanglish</option>
              </select>
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs text-rose-600 font-bold px-3 py-2 bg-rose-50 rounded-xl"
              >
                {t('navLogout')}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-civic-blue-600 px-4 py-2 bg-blue-50 rounded-xl"
              >
                {t('navSignIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
