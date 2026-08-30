import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-purple-dark text-white pt-16 pb-24 border-t border-brand-purple/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Foundation Credentials */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1 flex-shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Al Shujaiat Foundation Jammu & Kashmir Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block">
                  {t('brand.name', 'AL SHUJAIAT FOUNDATION')}
                </span>
                <span className="text-xs font-bold text-brand-pink tracking-wider uppercase block">
                  {t('brand.region', 'Jammu & Kashmir · India')}
                </span>
              </div>
            </div>

            <p className="text-white/70 text-xs leading-relaxed max-w-sm">
              {t('footer.tagline', 'Al Shujaiat Foundation Jammu & Kashmir is a registered charitable trust dedicated to sustainable community development, disaster resilience, clean water, and human dignity.')}
            </p>

            {/* Legal Badges */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs text-white/80">
              <div className="flex items-center gap-2 text-brand-blue font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-pink flex-shrink-0" />
                <span>Statutory Registrations & Credentials</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-white/70 pt-1 border-t border-white/10">
                <div>NGO DARPAN: <span className="text-white">JK/2018/0190361</span></div>
                <div>80G Tax: <span className="text-white">DEL-AE28396-27022018/9728</span></div>
                <div>12A Reg: <span className="text-white">DEL-AR26932-27022018/8830</span></div>
                <div>FCRA Reg: <span className="text-white">004872022</span></div>
                <div className="col-span-2">LEI ID: <span className="text-white">9845008779YC3EE0IE41</span></div>
              </div>
            </div>
          </div>

          {/* Column 2: Our Programs */}
          <div>
            <h4 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-4">
              Programs & Initiatives
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('/projects/clean-water-initiative')} className="hover:text-white transition-colors">
                  Clean Water Initiative
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/global-education-access-program')} className="hover:text-white transition-colors">
                  Global Education Access Program
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/community-healthcare-outreach')} className="hover:text-white transition-colors">
                  Community Healthcare Outreach
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/emergency-relief-and-recovery')} className="hover:text-white transition-colors">
                  Emergency Relief and Recovery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/women-and-livelihood-development')} className="hover:text-white transition-colors">
                  Women and Livelihood Development
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/climate-resilience-and-winter-survival')} className="hover:text-white transition-colors">
                  Climate Resilience & Winter Survival
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Transparency & Get Involved */}
          <div>
            <h4 className="text-sm font-bold text-brand-pink uppercase tracking-wider mb-4">
              Governance & Audits
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('/transparency')} className="hover:text-white transition-colors flex items-center gap-1">
                  Annual Audited Reports <ArrowUpRight className="w-3 h-3 text-brand-pink" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/impact')} className="hover:text-white transition-colors">
                  Impact Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/stories')} className="hover:text-white transition-colors">
                  Impact Stories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/news')} className="hover:text-white transition-colors">
                  News & Press Releases
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/volunteer')} className="hover:text-white transition-colors">
                  Volunteer Application & Badges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/membership')} className="hover:text-white transition-colors flex items-center gap-1">
                  NGO Membership Program <ArrowUpRight className="w-3 h-3 text-brand-pink" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/partners')} className="hover:text-white transition-colors">
                  Corporate Partnerships
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <h4 className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-4">
              Offices & Helplines
            </h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block text-[11px]">Registered Office:</span>
                  <span>D-45, 1st FLOOR ZAKIR NAGAR WEST DELHI NEW DELHI 110025</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block text-[11px]">Operating / Field Office:</span>
                  <span>Luragam Tral Pulwama Jammu and Kashmir 192123</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <a href="mailto:info@asfjk.org" className="hover:text-white font-mono">info@asfjk.org</a>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div>
                    <a href="tel:+911933351585" className="hover:text-white transition-colors block text-white/90">
                      +91 1933 351585
                    </a>
                  </div>
                  <div>
                    <a href="tel:+919419301319" className="hover:text-white transition-colors block text-white/90">
                      +91 94193 01319
                    </a>
                  </div>
                </div>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => onNavigate('/faq')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                >
                  FAQ & Support Desk
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Policies Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} {t('footer.rights', 'All rights reserved. Al Shujaiat Foundation Jammu & Kashmir.')}</p>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
              Terms & Conditions
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/refund-policy')} className="hover:text-white transition-colors">
              Refund Policy
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/donation-policy')} className="hover:text-white transition-colors">
              Donation Policy
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/cookie-policy')} className="hover:text-white transition-colors">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
