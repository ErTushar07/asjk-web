import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const toast = useToast();

  return (
    <footer className="bg-brand-purple-dark text-white pt-12 sm:pt-16 pb-20 sm:pb-24 border-t border-brand-purple/40 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10">
          {/* Column 1: Foundation Credentials */}
          <div className="col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 footer-brand-logo p-1 flex-shrink-0 shadow-xl flex items-center justify-center border border-white/30">
                <img
                  src="/images/logo.png"
                  alt="Al Shujaiat Foundation Jammu & Kashmir Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block">
                  {t('brand.name', 'AL SHUJAIAT FOUNDATION')}
                </span>
                <span className="text-xs sm:text-sm font-bold text-brand-pink tracking-wider uppercase block">
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
                <span>{t('footer.credentials', 'Statutory Registrations & Credentials')}</span>
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
              {t('footer.programs', 'Programs & Initiatives')}
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('/projects/clean-water-initiative')} className="hover:text-white transition-colors">
                  {t('footer.prog_water', 'Clean Water Initiative')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/global-education-access-program')} className="hover:text-white transition-colors">
                  {t('footer.prog_edu', 'Global Education Access Program')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/community-healthcare-outreach')} className="hover:text-white transition-colors">
                  {t('footer.prog_health', 'Community Healthcare Outreach')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/emergency-relief-and-recovery')} className="hover:text-white transition-colors">
                  {t('footer.prog_relief', 'Emergency Relief and Recovery')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/women-and-livelihood-development')} className="hover:text-white transition-colors">
                  {t('footer.prog_women', 'Women and Livelihood Development')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects/climate-resilience-and-winter-survival')} className="hover:text-white transition-colors">
                  {t('footer.prog_climate', 'Climate Resilience & Winter Survival')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Transparency & Get Involved */}
          <div>
            <h4 className="text-sm font-bold text-brand-pink uppercase tracking-wider mb-4">
              {t('footer.governance', 'Governance & Audits')}
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('/leadership')} className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-white">
                  {t('footer.gov_trustees', 'Board of Trustees & Leadership')} <ArrowUpRight className="w-3 h-3 text-brand-pink" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/transparency')} className="hover:text-white transition-colors flex items-center gap-1">
                  {t('footer.gov_audits', 'Annual Audited Reports')} <ArrowUpRight className="w-3 h-3 text-brand-pink" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/impact')} className="hover:text-white transition-colors">
                  {t('footer.gov_impact', 'Impact Dashboard')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/stories')} className="hover:text-white transition-colors">
                  {t('footer.gov_stories', 'Impact Stories')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/news')} className="hover:text-white transition-colors">
                  {t('footer.gov_news', 'News & Press Releases')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/volunteer')} className="hover:text-white transition-colors">
                  {t('footer.gov_volunteer', 'Volunteer Application & Badges')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/membership')} className="hover:text-white transition-colors flex items-center gap-1">
                  {t('footer.gov_membership', 'NGO Membership Program')} <ArrowUpRight className="w-3 h-3 text-brand-pink" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/partners')} className="hover:text-white transition-colors">
                  {t('footer.gov_partners', 'Corporate Partnerships')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <h4 className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-4">
              {t('footer.offices_title', 'Offices & Helplines')}
            </h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block text-[11px]">
                    {t('footer.registered_office', 'Registered Office:')}
                  </span>
                  <span>D-45, 1st FLOOR ZAKIR NAGAR WEST DELHI NEW DELHI 110025</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block text-[11px]">
                    {t('footer.field_office', 'Operating / Field Office:')}
                  </span>
                  <span>Luragam Tral Pulwama Jammu and Kashmir 192123</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <a href="mailto:info@asfjk.org" className="hover:text-white font-mono">info@asfjk.org</a>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5 font-mono text-[11px]" dir="ltr">
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
                  {t('footer.faq_btn', 'FAQ & Support Desk')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-left w-full md:w-auto">
            <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-pink" />
              {t('footer.newsletter_title', 'Stay Updated · Get Field Reports')}
            </h4>
            <p className="text-xs text-white/70 max-w-lg leading-relaxed">
              {t('footer.newsletter_sub', 'Receive monthly updates directly from community projects in Jammu & Kashmir.')}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.elements.namedItem('email') as HTMLInputElement;
              if (input && input.value) {
                try {
                  localStorage.setItem('asfjk_newsletter_subscribed', input.value);
                } catch (err) {}
                toast.success(
                  t('footer.newsletter_success', "Thank you! You will receive our next field report."),
                  'Subscribed'
                );
                form.reset();
              }
            }}
            className="flex items-center gap-2 w-full md:w-auto flex-shrink-0"
          >
            <input
              type="email"
              name="email"
              required
              aria-label="Email address for newsletter"
              placeholder={t('footer.newsletter_placeholder', 'Enter your email address')}
              className="px-4 py-2.5 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-pink w-full md:w-64"
            />
            <button
              type="submit"
              className="btn-secondary !py-2.5 !px-5 text-xs font-bold whitespace-nowrap shadow-pink-glow"
            >
              {t('footer.newsletter_subscribe', 'Subscribe')}
            </button>
          </form>
        </div>

        {/* Bottom Legal Policies Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} {t('footer.rights', 'All rights reserved. Al Shujaiat Foundation Jammu & Kashmir.')}</p>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">
              {t('footer.privacy', 'Privacy Policy')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
              {t('footer.terms', 'Terms & Conditions')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/refund-policy')} className="hover:text-white transition-colors">
              {t('footer.refund', 'Refund Policy')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/donation-policy')} className="hover:text-white transition-colors">
              {t('footer.donation_policy', 'Donation Policy')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('/cookie-policy')} className="hover:text-white transition-colors">
              {t('footer.cookie_policy', 'Cookie Policy')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
