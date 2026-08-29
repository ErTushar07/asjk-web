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
            <span>HEADLINES</span>
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
                      WINTER RELIEF APPEAL
                    </span>
                    <span className="text-white/95 font-medium">
                      Al Shujaiat Foundation Jammu & Kashmir delivering emergency survival packages in mountain sectors.
                    </span>
                  </div>

                  <span className="text-white/30 font-bold">•</span>

                  <div 
                    onClick={() => onNavigate('/transparency')} 
                    className="flex items-center gap-2 cursor-pointer hover:text-brand-blue transition-colors"
                  >
                    <span className="text-brand-blue font-mono font-bold">Reg: JK-TR-2018/889042 · 80G / 501(c)(3)</span>
                    <span className="text-white/80 underline text-[11px] font-semibold hover:text-white">Transparency & Audits</span>
                  </div>

                  <span className="text-white/30 font-bold">•</span>

                  <div 
                    onClick={() => onNavigate('/volunteer')} 
                    className="flex items-center gap-2.5 cursor-pointer hover:text-brand-pink transition-colors group"
                  >
                    <span className="bg-emerald-500 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                      VOLUNTEER DESK
                    </span>
                    <span className="text-white/95 font-medium">
                      Applications now open: Join our field logistics & medical support task force with CV upload.
                    </span>
                  </div>

                  <span className="text-white/30 font-bold">•</span>

                  <div 
                    onClick={() => onNavigate('/projects')} 
                    className="flex items-center gap-2.5 cursor-pointer hover:text-brand-blue transition-colors group"
                  >
                    <span className="bg-brand-blue text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                      CLEAN WATER INITIATIVE
                    </span>
                    <span className="text-white/95 font-medium">
                      12 New Solar Wells fully operational across high-altitude border districts of J&K.
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
                Al Shujaiat Foundation
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-brand-pink uppercase whitespace-nowrap">
                Jammu & Kashmir · India
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
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
                <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
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

            {/* Currency Selector */}
            <div className="relative">
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
                <span className="hidden sm:inline">{currentCurrency.code}</span>
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

            {/* User Account / Portal Switcher */}
            <div className="relative">
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
              className="btn-secondary !py-2 !px-4 text-xs sm:text-sm flex items-center gap-2 shadow-pink-glow"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span className="hidden xs:inline">{t('nav.donate', 'Donate Now')}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-content-primary hover:bg-surface-soft"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-content-border px-4 pt-2 pb-6 space-y-1 shadow-brand-md animate-fadeIn">
          {navLinks.map((item) => (
            <button
              key={item.route}
              onClick={() => {
                onNavigate(item.route);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
                currentRoute === item.route
                  ? 'bg-surface-highlight text-brand-purple font-bold'
                  : 'text-content-primary hover:bg-surface-soft'
              }`}
            >
              {item.name}
            </button>
          ))}

          <div className="pt-3 border-t border-content-border flex gap-2">
            <button
              onClick={() => {
                onNavigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-semibold bg-surface-soft text-brand-purple rounded-lg"
            >
              Donor Portal
            </button>
            <button
              onClick={() => {
                onNavigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-semibold bg-brand-purple text-white rounded-lg"
            >
              Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
