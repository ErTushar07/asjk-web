import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Droplets, GraduationCap, Activity, HeartHandshake, ShieldAlert, Sun, ArrowRight, Heart } from 'lucide-react';

export const OurWorkPage: React.FC<{ onNavigate: (route: string) => void; onOpenDonateModal: () => void }> = ({
  onNavigate,
  onOpenDonateModal,
}) => {
  const pillars = [
    {
      title: 'Clean Water & Sanitation',
      icon: Droplets,
      color: 'text-brand-blue',
      desc: 'Deploying high-capacity solar deep-tube filtration plants, gravity-fed spring catchments, and frost-proof community pipeline networks across remote mountain hamlets.',
      stats: '24 Operational Plants · 35,000+ Daily Beneficiaries',
      link: '/projects/clean-water-initiative',
    },
    {
      title: 'Global Education Access',
      icon: GraduationCap,
      color: 'text-brand-pink',
      desc: 'Transforming under-resourced schools into winterized smart digital classrooms, providing full student scholarships, winter uniforms, and modern computer laboratories.',
      stats: '4,850 Children Supported · 26 Smart Labs',
      link: '/projects/global-education-access-program',
    },
    {
      title: 'Community Healthcare Outreach',
      icon: Activity,
      color: 'text-emerald-600',
      desc: 'Operating 4x4 mobile medical dispensaries equipped with diagnostic ultrasound, maternal care specialists, and free pharmacy dispatches to isolated villages.',
      stats: '42,000+ Free Patient Consultations · 180 Mobile Camps',
      link: '/projects/community-healthcare-outreach',
    },
    {
      title: 'Emergency Relief and Recovery',
      icon: ShieldAlert,
      color: 'text-brand-orange',
      desc: 'Maintaining 24/7 prepositioned disaster response warehouses to deliver food rations, shelter kits, and medical aid within 6 hours of floods, avalanches, and blizzards.',
      stats: '14,200 Emergency Ration Kits · < 6 Hour Response',
      link: '/projects/emergency-relief-and-recovery',
    },
    {
      title: 'Women and Livelihood Development',
      icon: HeartHandshake,
      color: 'text-brand-purple',
      desc: 'Comprehensive monthly living, educational, and healthcare sponsorships for children and single-parent guardian households.',
      stats: '600 Children Sponsored · 100% School Retention',
      link: '/projects/women-and-livelihood-development',
    },
    {
      title: 'Climate Resilience & Winter Survival',
      icon: Sun,
      color: 'text-amber-600',
      desc: 'Distributing heavy thermal blankets, traditional Kangri heating units, clean fuel, and warm winter garments before sub-zero winter blockades.',
      stats: '8,200 Blankets Distributed · 74 Mountain Hamlets',
      link: '/projects/climate-resilience-and-winter-survival',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Al Shujaiat Foundation · Jammu & Kashmir
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Comprehensive Humanitarian & Developmental Programs
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          Through strategic community infrastructure, emergency readiness, and grassroots partnerships, our foundation brings sustainable relief and long-term empowerment to Jammu & Kashmir.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-content-border p-8 shadow-brand-sm hover:shadow-brand-md transition-all space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-soft flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${p.color}`} />
                </div>
                <h3 className="text-lg font-extrabold text-content-primary">{p.title}</h3>
                <p className="text-xs text-content-secondary leading-relaxed">{p.desc}</p>
                <div className="p-3 bg-surface-soft rounded-xl text-[11px] font-bold text-brand-purple">
                  {p.stats}
                </div>
              </div>

              <div className="pt-4 border-t border-content-border flex items-center justify-between">
                <button
                  onClick={() => onNavigate(p.link)}
                  className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <span>View Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenDonateModal}
                  className="btn-secondary !py-1.5 !px-3 text-xs font-bold flex items-center gap-1"
                >
                  <Heart className="w-3 h-3 fill-white" />
                  <span>Donate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
