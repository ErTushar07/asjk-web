import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, Globe, DollarSign, Menu, X, ChevronDown, 
  User as UserIcon, Shield, FileText, Activity, Layers, LogIn 
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenDonateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute, onOpenDonateModal }) => {
  const { currentLanguage, setLanguage, supportedLanguages, t, isRTL } = useLanguage();
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();
  const { user, isAuthenticated, isAdmin, isDonor, role, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: t('nav.home', 'Home'), route: '/' },
    { name: t('nav.about', 'About Us'), route: '/about' },
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-content-border shadow-brand-sm">
      {/* Continuous Right-to-Left Headline Ticker Announcement Bar */}
      <div className="bg-brand-purple text-white text-xs py-1.5 overflow-hidden border-b border-brand-purple-dark/50 relative select-none">
        <div className="flex items-center">
          {/* Static Live Indicator Tag */}
          <div className="flex items-center gap-1.5 px-3 py-0.5 bg-brand-purple-dark/90 z-10 flex-shrink-0 text-[10px] font-extrabold uppercase tracking-wider text-brand-pink shadow-md border-r border-white/10">
            <span className="w-2 h-2 rounded-full bg-brand-pink animate-ping inline-block" />
            <span className="w-2 h-2 rounded-full bg-brand-pink -ml-3.5 inline-block" />
            <span>{t('ticker.headlines', 'HEADLINES')}</span>
          </div>

          {/* Continuous Moving Stream */}
          <div className="flex overflow-hidden flex-1 relative">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group flex-shrink-0"
            onClick={() => onNavigate('/')}
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-brand-sm group-hover:scale-105 transition-transform flex-shrink-0 bg-white p-0.5 border border-content-border/50">
              <img 
                src="/images/logo.png" 
                alt="Al Shujaiat Foundation Jammu & Kashmir Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center flex-shrink-0">
              <span className="font-bold text-base sm:text-lg tracking-tight text-brand-purple leading-tight whitespace-nowrap block">
                {t('brand.name', 'Al Shujaiat Foundation')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-brand-pink uppercase whitespace-nowrap">
                {t('brand.region', 'Jammu & Kashmir · India')}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.slice(0, 5).map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`px-2.5 xl:px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  currentRoute === item.route
                    ? 'text-brand-purple bg-surface-highlight font-semibold'
                    : 'text-content-secondary hover:text-brand-purple hover:bg-surface-soft'
                }`}
              >
                {item.name}
              </button>
            ))}

            {/* More dropdown */}
            <div className="relative group">
              <button className="px-2.5 xl:px-3 py-2 text-sm font-medium text-content-secondary hover:text-brand-purple rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap">
                More <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 mt-1 w-52 bg-white border border-content-border rounded-xl shadow-brand-md py-2 hidden group-hover:block z-50 animate-fadeIn">
                {navLinks.slice(5).map((subItem) => (
                  <button
                    key={subItem.route}
                    onClick={() => onNavigate(subItem.route)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      currentRoute === subItem.route
                        ? 'text-brand-purple bg-surface-highlight font-bold'
                        : 'text-content-secondary hover:text-brand-purple hover:bg-surface-soft'
                    }`}
                  >
                    {subItem.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Right Action Area (Language, Currency, Auth, Donate) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Selector (Desktop / Tablet) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-content-border hover:border-brand-purple text-content-primary hover:text-brand-purple transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Select Language"
              >
                <span className="text-sm">{currentLanguage.flag}</span>
                <span className="hidden lg:inline">{currentLanguage.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-content-muted" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-content-border rounded-xl shadow-brand-lg py-2 z-50 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-content-muted uppercase tracking-wider border-b border-content-border">
                    Select Language
                  </div>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                        currentLanguage.code === lang.code
                          ? 'bg-surface-highlight text-brand-purple font-bold'
                          : 'text-content-primary hover:bg-surface-soft'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-[10px] text-content-muted uppercase font-mono">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector (Desktop / Tablet) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg border border-content-border hover:border-brand-purple text-content-primary hover:text-brand-purple transition-colors flex items-center gap-1 text-xs font-bold font-mono"
                title="Select Currency"
              >
                <span>{currentCurrency.symbol}</span>
                <span className="hidden lg:inline">{currentCurrency.code}</span>
                <ChevronDown className="w-3 h-3 text-content-muted" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-content-border rounded-xl shadow-brand-lg py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-content-muted uppercase tracking-wider border-b border-content-border">
                    Select Currency
                  </div>
                  {availableCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setCurrDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
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

            {/* User Account / Portal Switcher (Desktop / Tablet) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setLangDropdownOpen(false);
                  setCurrDropdownOpen(false);
                }}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-surface-soft hover:bg-surface-card border border-content-border text-content-primary transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-brand-purple" />
                ) : (
                  <UserIcon className="w-4 h-4 text-brand-pink" />
                )}
                <span className="hidden md:inline max-w-[110px] truncate font-semibold">
                  {user ? user.name.split(' ')[0] : 'Portal'}
                </span>
                <ChevronDown className="w-3 h-3 text-content-muted" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-content-border rounded-xl shadow-brand-lg py-2 z-50 animate-fadeIn">
                  {isAuthenticated && user && (
                    <div className="px-4 py-2 border-b border-content-border">
                      <p className="text-xs font-bold text-content-primary">{user.name}</p>
                      <p className="text-[10px] text-content-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-purple/10 text-brand-purple uppercase">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  <div className="py-1">
                    {/* Admin Dashboard */}
                    <button
                      onClick={() => {
                        onNavigate('/admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-content-primary hover:bg-surface-soft transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-brand-purple" />
                      <span>Admin Portal</span>
                    </button>

                    {/* Donor Portal */}
                    <button
                      onClick={() => {
                        onNavigate('/dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-content-primary hover:bg-surface-soft transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Donor Portal</span>
                    </button>

                    {/* My Receipts */}
                    <button
                      onClick={() => {
                        onNavigate('/receipts');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-content-primary hover:bg-surface-soft transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Tax Receipts</span>
                    </button>

                    <div className="border-t border-content-border my-1" />

                    {!isAuthenticated ? (
                      <button
                        onClick={() => {
                          onNavigate('/login');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-brand-purple hover:bg-surface-soft"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Sign In
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Donate Now Button */}
            <button
              onClick={onOpenDonateModal}
              className="btn-secondary !py-1.5 sm:!py-2 !px-3 sm:!px-4 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-pink-glow flex-shrink-0"
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>{t('nav.donate', 'Donate')}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-content-primary hover:bg-surface-soft flex-shrink-0"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-brand-purple" /> : <Menu className="w-6 h-6 text-brand-purple" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-content-border px-4 pt-3 pb-6 space-y-3 shadow-brand-lg animate-fadeIn max-h-[85vh] overflow-y-auto">
          {/* Quick Language & Currency Switchers in Mobile Menu */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-surface-soft rounded-2xl border border-content-border/60">
            {/* Mobile Language */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-content-muted block mb-1">
                Language
              </label>
              <select
                value={currentLanguage.code}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white text-content-primary text-xs font-semibold rounded-lg px-2.5 py-2 border border-content-border focus:outline-none focus:ring-2 focus:ring-brand-purple"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName} ({l.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Currency */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-content-muted block mb-1">
                Currency
              </label>
              <select
                value={currentCurrency.code}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white text-content-primary text-xs font-semibold font-mono rounded-lg px-2.5 py-2 border border-content-border focus:outline-none focus:ring-2 focus:ring-brand-pink"
              >
                {availableCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Portal Switcher Cards in Mobile Menu */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onNavigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-xs font-semibold bg-pink-50 hover:bg-pink-100 text-brand-pink rounded-xl border border-pink-200/60 flex items-center gap-2 transition-colors"
            >
              <Heart className="w-4 h-4 text-brand-pink fill-brand-pink/20 flex-shrink-0" />
              <div>
                <span className="block font-bold text-slate-900">Donor Portal</span>
                <span className="text-[10px] text-brand-pink font-normal">Track gifts & receipts</span>
              </div>
            </button>
            <button
              onClick={() => {
                onNavigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-brand-purple rounded-xl border border-indigo-200/60 flex items-center gap-2 transition-colors"
            >
              <Shield className="w-4 h-4 text-brand-purple flex-shrink-0" />
              <div>
                <span className="block font-bold text-slate-900">Admin Portal</span>
                <span className="text-[10px] text-brand-purple font-normal">Manage foundation</span>
              </div>
            </button>
          </div>

          {/* Navigation Links Grid/List */}
          <div className="pt-2 border-t border-content-border space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-content-muted px-2 block mb-1">
              Navigation Menu
            </span>
            {navLinks.map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-between transition-colors ${
                  currentRoute === item.route
                    ? 'bg-surface-highlight text-brand-purple font-bold'
                    : 'text-content-primary hover:bg-surface-soft'
                }`}
              >
                <span>{item.name}</span>
                {currentRoute === item.route && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                )}
              </button>
            ))}
          </div>

          {/* Auth Action */}
          <div className="pt-2 border-t border-content-border">
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  onNavigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-brand-purple bg-surface-soft hover:bg-surface-card rounded-xl border border-content-border flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign In to Account
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
