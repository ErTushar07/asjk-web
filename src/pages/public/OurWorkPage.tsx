import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Droplets, GraduationCap, Activity, HeartHandshake, ShieldAlert, Sun, ArrowRight, Heart } from 'lucide-react';

export const OurWorkPage: React.FC<{ onNavigate: (route: string) => void; onOpenDonateModal: () => void }> = ({
  onNavigate,
  onOpenDonateModal,
}) => {
  usePageMeta(
    'Our Work & Programs',
    'Explore our key humanitarian pillars: clean water, digital education, healthcare clinics, orphan care, and mountain emergency relief across Jammu & Kashmir.'
  );
  const { t } = useLanguage();
  const pillars = [
    {
      id: 'water',
      title: 'Clean Water & Sanitation',
      icon: Droplets,
      color: 'text-brand-blue',
      desc: 'Deploying high-capacity solar deep-tube filtration plants, gravity-fed spring catchments, and frost-proof community pipeline networks across remote mountain hamlets.',
      stats: '24 Operational Plants · 35,000+ Daily Beneficiaries',
      link: '/projects/clean-water-initiative',
    },
    {
      id: 'education',
      title: 'Global Education Access',
      icon: GraduationCap,
      color: 'text-brand-pink',
      desc: 'Transforming under-resourced schools into winterized smart digital classrooms, providing full student scholarships, winter uniforms, and modern computer laboratories.',
      stats: '4,850 Children Supported · 26 Smart Labs',
      link: '/projects/global-education-access-program',
    },
    {
      id: 'health',
      title: 'Community Healthcare Outreach',
      icon: Activity,
      color: 'text-emerald-600',
      desc: 'Operating 4x4 mobile medical dispensaries equipped with diagnostic ultrasound, maternal care specialists, and free pharmacy dispatches to isolated villages.',
      stats: '42,000+ Free Patient Consultations · 180 Mobile Camps',
      link: '/projects/community-healthcare-outreach',
    },
    {
      id: 'emergency',
      title: 'Emergency Relief and Recovery',
      icon: ShieldAlert,
      color: 'text-brand-orange',
      desc: 'Maintaining 24/7 prepositioned disaster response warehouses to deliver food rations, shelter kits, and medical aid within 6 hours of floods, avalanches, and blizzards.',
      stats: '14,200 Emergency Ration Kits · < 6 Hour Response',
      link: '/projects/emergency-relief-and-recovery',
    },
    {
      id: 'livelihood',
      title: 'Women and Livelihood Development',
      icon: HeartHandshake,
      color: 'text-brand-purple',
      desc: 'Comprehensive monthly living, educational, and healthcare sponsorships for children and single-parent guardian households.',
      stats: '600 Children Sponsored · 100% School Retention',
      link: '/projects/women-and-livelihood-development',
    },
    {
      id: 'winter',
      title: 'Climate Resilience & Winter Survival',
      icon: Sun,
      color: 'text-amber-600',
      desc: 'Distributing heavy thermal blankets, traditional Kangri heating units, clean fuel, and warm winter garments before sub-zero winter blockades.',
      stats: '8,200 Blankets Distributed · 74 Mountain Hamlets',
      link: '/projects/climate-resilience-and-winter-survival',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('our_work.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('our_work.title', 'Comprehensive Humanitarian & Developmental Programs')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t('our_work.subtitle', 'Through strategic community infrastructure, emergency readiness, and grassroots partnerships, our foundation brings sustainable relief and long-term empowerment to Jammu & Kashmir.')}
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl border border-content-border p-3.5 sm:p-8 space-y-3 sm:space-y-6 shadow-brand-sm hover:shadow-brand-md transition-all flex flex-col justify-between group min-w-0"
            >
              <div className="space-y-2 sm:space-y-4">
                <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-soft flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${p.color}`} />
                </div>
                <h3 className="text-xs sm:text-xl font-bold sm:font-extrabold text-content-primary group-hover:text-brand-purple transition-colors line-clamp-1">
                  {t(`pillar.${p.id}.title`, p.title)}
                </h3>
                <p className="text-[10px] sm:text-xs text-content-secondary leading-relaxed line-clamp-3">
                  {t(`pillar.${p.id}.desc`, p.desc)}
                </p>
              </div>

              <div className="pt-2 sm:pt-4 border-t border-content-border/60 space-y-2">
                <span className="text-[9px] sm:text-xs font-bold text-brand-purple block truncate">
                  {t(`pillar.${p.id}.stats`, p.stats)}
                </span>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    onClick={() => onNavigate(p.link)}
                    className="text-[10px] sm:text-xs font-bold text-brand-pink hover:underline flex items-center gap-1"
                  >
                    <span>{t('project.view_details', 'Details')}</span> <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={onOpenDonateModal}
                    className="btn-primary !py-1 sm:!py-1.5 !px-2 sm:!px-3 text-[9px] sm:text-xs font-bold"
                  >
                    {t('project.donate_now', 'Donate')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
