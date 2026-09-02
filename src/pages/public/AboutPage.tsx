import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ShieldCheck, Heart, Users, MapPin, Award, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const leadershipTeam = [
    {
      name: 'Mohd Amin Ganai',
      role: 'Executive Director',
      bio: 'Visionary leadership directing humanitarian initiatives, community development, and emergency relief operations across Jammu & Kashmir.'
    },
    {
      name: 'James Anderson',
      role: 'International Programs Director',
      bio: 'Oversees international donor alignment, cross-border development partnerships, and sustainable infrastructure programs.'
    },
    {
      name: 'Michael Carter',
      role: 'Finance Director',
      bio: 'Chartered financial specialist managing statutory compliance, independent audit integrity, and 100% financial transparency.'
    },
    {
      name: 'Sarah Mitchell',
      role: 'Operations Director',
      bio: 'Manages rapid response logistics, mountain disaster relief dispatch, and strategic reserve warehouses.'
    },
    {
      name: 'Emily Carter',
      role: 'Communications Director',
      bio: 'Leads public relations, field reporting, educational advocacy, and global stakeholder engagement.'
    },
    {
      name: 'Daniel Wilson',
      role: 'Project Manager',
      bio: 'Senior engineer coordinating groundwater surveys, solar filtration installations, and community water committees.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('about.badge', 'About Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('about.title', 'Dedicated to Human Dignity & Sustainable Development')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t('about.subtitle', 'Founded in Srinagar, Al Shujaiat Foundation Jammu & Kashmir is a non-profit registered charitable trust working relentlessly across the Himalayan valley to alleviate poverty, deliver clean drinking water, educate children, and provide emergency disaster relief.')}
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-8">
        <div className="bg-brand-purple text-white p-4 sm:p-10 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-4 relative overflow-hidden">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center">
            <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-brand-pink fill-brand-pink" />
          </div>
          <h3 className="text-sm sm:text-2xl font-extrabold tracking-tight">{t('about.mission_title', 'Our Mission')}</h3>
          <p className="text-white/80 text-[10px] sm:text-sm leading-relaxed">
            {t('about.mission_desc', 'To empower impoverished and disaster-vulnerable communities in Jammu & Kashmir through sustainable clean water access, world-class digital education, comprehensive child sponsorship, and rapid humanitarian disaster response.')}
          </p>
        </div>

        <div className="bg-surface-highlight text-content-primary p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-brand-blue/30 space-y-2 sm:space-y-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-blue/20 flex items-center justify-center">
            <Award className="w-4 h-4 sm:w-6 sm:h-6 text-brand-purple" />
          </div>
          <h3 className="text-sm sm:text-2xl font-extrabold tracking-tight text-brand-purple">{t('about.vision_title', 'Our Vision')}</h3>
          <p className="text-content-secondary text-[10px] sm:text-sm leading-relaxed">
            {t('about.vision_desc', 'A thriving, self-reliant Jammu & Kashmir where every child has access to quality schooling, every remote village has safe drinking water, and no family is left without warmth or survival support during winter crises.')}
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-lg sm:text-2xl font-extrabold text-content-primary text-center">{t('about.values_title', 'Our Core Operating Values')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {[
            { title: t('about.val_transparency', '100% Transparency'), desc: t('about.val_transparency_desc', 'Every rupee and dollar is audited by independent licensed chartered accountants.') },
            { title: t('about.val_dignity', 'Human Dignity'), desc: t('about.val_dignity_desc', 'Aid is delivered with respect and compassion, upholding beneficiary privacy.') },
            { title: t('about.val_empowerment', 'Local Empowerment'), desc: t('about.val_empowerment_desc', 'Villagers and youth committees are trained to maintain long-term infrastructure.') },
            { title: t('about.val_response', 'Rapid Response'), desc: t('about.val_response_desc', '24/7 disaster readiness teams deploy emergency aid within hours of any calamity.') },
          ].map((v, i) => (
            <div key={i} className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-content-border space-y-1.5 sm:space-y-2 shadow-brand-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pink" />
              <h4 className="font-bold text-xs sm:text-sm text-content-primary">{v.title}</h4>
              <p className="text-[10px] sm:text-xs text-content-secondary leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership & Staff Structure */}
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] sm:text-xs font-bold text-brand-pink uppercase tracking-wider block">
            {t('about.gov_badge', 'Executive Governance')}
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-content-primary">
            {t('about.gov_title', 'Leadership & Organizational Team')}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {leadershipTeam.map((l, idx) => (
            <div key={idx} className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-content-border text-center space-y-2 sm:space-y-3 shadow-brand-sm flex flex-col justify-between min-w-0">
              <div className="space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-brand-purple/10 mx-auto flex items-center justify-center text-brand-purple font-black text-xs sm:text-lg">
                  {l.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-base text-content-primary truncate">{l.name}</h4>
                  <p className="text-[10px] sm:text-xs font-bold text-brand-pink truncate">{t(l.role, l.role)}</p>
                </div>
                <p className="text-[10px] sm:text-xs text-content-secondary leading-relaxed line-clamp-3">{l.bio}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('/leadership')}
            className="btn-primary !py-3 !px-6 text-xs sm:text-sm font-black shadow-brand-md inline-flex items-center gap-2"
          >
            <span>View Full Board of Trustees & Governance Directory</span>
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statutory Credentials & Official Seal */}
      <div className="bg-surface-soft p-6 sm:p-8 rounded-3xl border border-content-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-content-border pb-4">
          <div>
            <h3 className="font-extrabold text-base text-brand-purple flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-pink" /> {t('about.statutory_title', 'Legal & Statutory Registrations')}
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              Accredited under Section 80G, 12A, NGO-DARPAN, and Global Transparency Standards
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase">
              STATUS: ACTIVE & VERIFIED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs text-content-secondary font-mono">
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">NGO-DARPAN</span>
            <span className="font-bold text-content-primary">JK/2018/0190361</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">LEI Identifier</span>
            <span className="font-bold text-content-primary text-[11px] break-all">9845008779YC3EE0IE41</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">Income Tax 80G</span>
            <span className="font-bold text-content-primary text-[10px] break-all">DEL-AE28396-27022018/9728</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">FCRA Compliance</span>
            <span className="font-bold text-content-primary">004872022</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">Section 12A</span>
            <span className="font-bold text-content-primary text-[10px] break-all">DEL-AR26932-27022018/8830</span>
          </div>
        </div>

        {/* Official Presidential Seal & Signatory Endorsement */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-content-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-left flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink block">
              PRESIDENTIAL ATTESTATION & CHARTER
            </span>
            <h4 className="text-sm font-extrabold text-content-primary">
              Al Shujaiat Foundation · Jammu & Kashmir
            </h4>
            <p className="text-xs text-content-secondary leading-relaxed max-w-xl">
              "We hereby solemnly affirm our dedication to the underprivileged families, orphans, and students of Jammu & Kashmir. Every donation and volunteer hour is accounted for with 100% statutory transparency."
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-brand-purple">Mohd Amin Ganai</p>
              <p className="text-[11px] text-content-muted">Founder & President · Al Shujaiat Foundation</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Real Handwritten Signature */}
            <div className="text-center">
              <img 
                src="/images/signature.png" 
                alt="Founder Signature" 
                loading="lazy"
                width="120"
                height="48"
                className="h-12 w-auto object-contain mix-blend-multiply opacity-95"
              />
              <span className="text-[9px] font-mono text-content-muted block">Authorized Signatory</span>
            </div>

            {/* Real Official Seal */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <img 
                src="/images/seal.png" 
                alt="Official Foundation Seal" 
                loading="lazy"
                width="80"
                height="80"
                className="w-full h-full object-contain mix-blend-multiply opacity-95 rotate-[-5deg] drop-shadow-sm hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
