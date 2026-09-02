import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Heart, Globe, DollarSign, ChevronDown, 
  User as UserIcon, Shield, FileText, Activity, Layers, LogIn,
  Check, LayoutDashboard, RefreshCw, Moon, Sun
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenDonateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute, onOpenDonateModal }) => {
  const { currentLanguage, setLanguage, supportedLanguages, t, isRTL } = useLanguage();
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: t('nav.home', 'Home'), route: '/' },
    { name: t('nav.about', 'About Us'), route: '/about' },
    { name: t('nav.leadership', 'Leadership'), route: '/leadership' },
    { name: t('nav.our_work', 'Our Work'), route: '/our-work' },
    { name: t('nav.projects', 'Projects'), route: '/projects' },
    { name: t('nav.campaigns', 'Campaigns'), route: '/campaigns' },
    { name: t('nav.impact', 'Impact'), route: '/impact' },
    { name: t('nav.transparency', 'Transparency'), route: '/transparency' },
    { name: t('nav.stories', 'Stories'), route: '/stories' },
    { name: t('nav.news', 'News'), route: '/news' },
    { name: t('nav.volunteer', 'Volunteer'), route: '/volunteer' },
    { name: t('nav.membership', 'Membership'), route: '/membership' },
    { name: t('nav.partners', 'Partners'), route: '/partners' },
    { name: t('nav.contact', 'Contact'), route: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-content-border shadow-brand-sm w-full max-w-full">
      {/* Continuous Right-to-Left Headline Ticker Announcement Bar */}
      <div className="w-full max-w-full bg-brand-purple text-white text-xs py-1.5 overflow-hidden border-b border-brand-purple-dark/50 relative select-none">
        <div className="flex items-center w-full max-w-full overflow-hidden">
          {/* Static Live Indicator Tag */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 bg-brand-purple-dark/90 z-10 flex-shrink-0 text-[10px] font-extrabold uppercase tracking-wider text-brand-pink shadow-md border-r border-white/10">
            <span className="w-2 h-2 rounded-full bg-brand-pink animate-ping inline-block" />
            <span className="w-2 h-2 rounded-full bg-brand-pink -ml-3.5 inline-block" />
            <span>{t('ticker.headlines', 'HEADLINES')}</span>
          </div>

          {/* Continuous Moving Stream */}
          <div className="flex overflow-hidden flex-1 relative min-w-0">
            <div className="animate-ticker flex items-center">
              {[1, 2].map((loop) => (
                <div key={loop} className="flex items-center gap-10 pr-10 flex-shrink-0">
                  <div 
                    onClick={() => onNavigate('/campaigns/winter-warmth-2026')} 
                    className="flex items-center gap-2.5 cursor-pointer hover:text-brand-pink transition-colors group"
                  >
                    <span className="bg-brand-pink text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wide group-hover:bg-white group-hover:text-brand-pink transition-all">
                      {t('ticker.winter_appeal', 'WINTER RELIEF APPEAL')}
                    </span>
                    <span className="text-white/95 font-medium">
                      {t('ticker.winter_text', 'Al Shujaiat Foundation Jammu & Kashmir delivering emergency survival packages in mountain sectors.')}
                    </span>
                  </div>

                  <span className="text-white/30 font-bold">•</span>

                  <div 
                    onClick={() => onNavigate('/transparency')} 
                    className="flex items-center gap-2 cursor-pointer hover:text-brand-blue transition-colors"
                  >
                    <span className="text-brand-blue font-mono font-bold">{t('ticker.reg_info', 'NGO DARPAN: JK/2018/0190361 · 80G / 501(c)(3)')}</span>
                    <span className="text-white/80 underline text-[11px] font-semibold hover:text-white">{t('nav.transparency', 'Transparency & Audits')}</span>
                  </div>

                  <span className="text-white/30 font-bold">•</span>

                  <div 
                    onClick={() => onNavigate('/volunteer')} 
                    className="flex items-center gap-2.5 cursor-pointer hover:text-brand-pink transition-colors group"
                  >
                    <span className="bg-emerald-500 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                      {t('ticker.volunteer', 'VOLUNTEER DESK')}
                    </span>
                    <span className="text-white/95 font-medium">
                      {t('ticker.volunteer_text', 'Applications now open: Join our field logistics & medical support task force with CV upload.')}
                    </span>
                  </div>

                  <span className="text-white/30 font-bold">•</span>

                  <div 
                    onClick={() => onNavigate('/projects')} 
                    className="flex items-center gap-2.5 cursor-pointer hover:text-brand-blue transition-colors group"
                  >
                    <span className="bg-brand-blue text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                      {t('ticker.water', 'CLEAN WATER INITIATIVE')}
                    </span>
                    <span className="text-white/95 font-medium">
                      {t('ticker.water_text', '12 New Solar Wells fully operational across high-altitude border districts of J&K.')}
                    </span>
                  </div>

                  <span className="text-white/30 font-bold">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-3">
          {/* Logo and Brand Title */}
          <div 
            className="flex items-center gap-2.5 sm:gap-4 cursor-pointer select-none group min-w-0 flex-shrink"
            onClick={() => onNavigate('/')}
          >
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img 
                src="/images/logo.png" 
                alt="Al Shujaiat Foundation Jammu & Kashmir Logo" 
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-black text-sm sm:text-lg lg:text-xl tracking-tight text-brand-purple leading-tight truncate block">
                {t('brand.name', 'Al Shujaiat Foundation')}
              </span>
              <span className="text-[9px] sm:text-xs lg:text-sm font-extrabold tracking-wider text-brand-pink uppercase truncate block">
                {t('brand.region', 'Jammu & Kashmir · India')}
              </span>
            </div>
          </div>

          {/* Right Action Area (Language, Currency, Auth, Donate) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                aria-label={`Select Language, currently ${currentLanguage.nativeName}`}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-content-border hover:border-brand-purple text-content-primary hover:text-brand-purple transition-colors flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                title="Select Language"
              >
                <span className="text-sm">{currentLanguage.flag}</span>
                <span className="hidden md:inline">{currentLanguage.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-content-muted" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white border border-content-border rounded-2xl shadow-2xl py-2 z-[100] max-h-[420px] overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-content-muted uppercase tracking-wider border-b border-content-border">
                    Select Language
                  </div>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      aria-label={`Switch language to ${lang.nativeName}`}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        currentLanguage.code === lang.code
                          ? 'bg-surface-highlight text-brand-purple font-bold'
                          : 'text-content-primary hover:bg-surface-soft'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {currentLanguage.code === lang.code && (
                        <Check className="w-3.5 h-3.5 text-brand-purple" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                aria-label={`Select Currency, currently ${currentCurrency.code}`}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-content-border hover:border-brand-purple text-content-primary hover:text-brand-purple transition-colors flex items-center gap-1 text-xs font-bold font-mono flex-shrink-0"
                title="Select Currency"
              >
                <span>{currentCurrency.symbol}</span>
                <span className="hidden md:inline">{currentCurrency.code}</span>
                <ChevronDown className="w-3 h-3 text-content-muted" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border border-content-border rounded-2xl shadow-2xl py-2 z-[100]">
                  <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-content-muted uppercase tracking-wider border-b border-content-border">
                    Select Currency
                  </div>
                  {availableCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setCurrDropdownOpen(false);
                      }}
                      aria-label={`Switch currency to ${curr.name} (${curr.code})`}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        currentCurrency.code === curr.code
                          ? 'bg-surface-highlight text-brand-purple font-bold'
                          : 'text-content-primary hover:bg-surface-soft'
                      }`}
                    >
                      <span>{curr.name}</span>
                      <span className="font-mono font-bold">{curr.symbol} {curr.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode [Shortcut: Ctrl+Shift+D]`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (Ctrl+Shift+D)`}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-content-border hover:border-brand-purple text-content-primary hover:text-brand-purple transition-colors flex items-center gap-1.5 text-xs font-bold flex-shrink-0 group"
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30 group-hover:rotate-12 transition-transform" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30 group-hover:rotate-45 transition-transform" />
              )}
              <span className="hidden lg:inline text-[11px] font-semibold">{isDark ? 'Dark' : 'Light'}</span>
            </button>

            {/* User Account / Donor Portal */}
            {!isAuthenticated ? (
              <button
                onClick={() => onNavigate('/login')}
                aria-label="Donor Sign In"
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-content-border hover:border-brand-purple text-content-primary hover:text-brand-purple transition-colors flex items-center gap-1.5 text-xs font-bold flex-shrink-0"
                title="Donor Sign In"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-purple" />
                <span className="hidden md:inline">{t('nav.signin', 'Sign In')}</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setLangDropdownOpen(false);
                    setCurrDropdownOpen(false);
                  }}
                  aria-label="Open User Account Menu"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-surface-soft hover:bg-surface-card border border-content-border text-content-primary transition-colors flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                  title="My Account"
                >
                  <UserIcon className="w-4 h-4 text-brand-pink" />
                  <span className="hidden md:inline max-w-[110px] truncate font-semibold">
                    {user ? user.name.split(' ')[0] : 'My Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-content-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white border border-content-border rounded-2xl shadow-2xl py-2 z-[100] animate-fadeIn">
                    <div className="px-4 py-3 border-b border-content-border bg-surface-soft rounded-t-2xl">
                      <p className="text-xs font-bold text-content-primary truncate">{user?.name}</p>
                      <p className="text-[11px] text-content-secondary truncate font-mono">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('/dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-content-primary hover:bg-surface-soft transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-brand-purple" />
                        <span>Donor Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('/donations');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-content-primary hover:bg-surface-soft transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-brand-pink" />
                        <span>My Contributions</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('/recurring-donations');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-content-primary hover:bg-surface-soft transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-brand-purple" />
                        <span>Recurring Subscriptions</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('/receipts');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-content-primary hover:bg-surface-soft transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Tax Receipts (80G)</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('/profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-content-primary hover:bg-surface-soft transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-content-muted" />
                        <span>Profile & Security</span>
                      </button>

                      <div className="border-t border-content-border my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Donate Now Button */}
            <button
              onClick={onOpenDonateModal}
              aria-label="Open donation window to contribute"
              className="btn-secondary !py-1.5 sm:!py-2 !px-2.5 sm:!px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shadow-pink-glow flex-shrink-0"
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>{t('nav.donate', 'Donate')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop & Mobile Visible Navigation Links Bar */}
      <div className="border-t border-content-border/60 bg-surface-soft/70 backdrop-blur-sm w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
            {navLinks.map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  currentRoute === item.route
                    ? 'text-brand-purple bg-surface-highlight font-bold shadow-xs'
                    : 'text-content-secondary hover:text-brand-purple hover:bg-surface-soft'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
