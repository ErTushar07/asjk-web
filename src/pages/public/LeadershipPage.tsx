import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LeadershipCategory, LeadershipMember } from '../../types';
import { LeadershipCard } from '../../components/leadership/LeadershipCard';
import { 
  ShieldCheck, Users, Crown, Briefcase, 
  HeartHandshake, Award, Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';

interface LeadershipPageProps {
  selectedSlug?: string;
  onNavigate: (route: string) => void;
}

export const LeadershipPage: React.FC<LeadershipPageProps> = ({ selectedSlug, onNavigate }) => {
  const { getPublicLeadership } = useDatabase();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<LeadershipCategory | 'all'>('all');

  const members = getPublicLeadership();

  // Set document title & SEO meta tags
  useEffect(() => {
    document.title = 'Board of Trustees & Leadership | Al Shujaiat Foundation';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Meet the Board of Trustees, executive leadership, advisors, and core team members of Al Shujaiat Foundation Jammu & Kashmir (ASFJK).'
    );
  }, []);

  const categories: { id: LeadershipCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Governance', icon: Users },
    { id: 'trustee', label: 'Board of Trustees', icon: Crown },
    { id: 'executive', label: 'Executive Leadership', icon: Briefcase },
    { id: 'team', label: 'Core Team', icon: Users },
    { id: 'advisor', label: 'Advisory Board', icon: Award },
    { id: 'volunteer_leader', label: 'Volunteer Leadership', icon: HeartHandshake },
  ];

  const trustees = members.filter((m) => m.category === 'trustee');
  const executives = members.filter((m) => m.category === 'executive');
  const team = members.filter((m) => m.category === 'team');
  const advisors = members.filter((m) => m.category === 'advisor');
  const volunteers = members.filter((m) => m.category === 'volunteer_leader');

  const filteredMembers = activeCategory === 'all' 
    ? members 
    : members.filter((m) => m.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('leadership.badge', 'Governance & Organizational Structure')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-content-primary tracking-tight">
          {t('leadership.title', 'Board of Trustees & Leadership')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t(
            'leadership.subtitle',
            'Al Shujaiat Foundation is governed by a dedicated Board of Trustees, seasoned executive officers, and field leaders committed to 100% transparency, community empowerment, and humanitarian integrity across Jammu & Kashmir.'
          )}
        </p>

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all inline-flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand-purple text-white border-brand-purple shadow-md'
                    : 'bg-white text-content-secondary border-content-border hover:border-brand-purple/40 hover:text-content-primary'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-pink' : 'text-content-muted'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      {activeCategory === 'all' ? (
        <div className="space-y-16">
          {/* Section 1: Board of Trustees */}
          {trustees.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      Board of Trustees
                    </h2>
                    <p className="text-xs text-content-secondary">
                      Highest governing authority responsible for strategic direction, legal trust compliance, and statutory integrity.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-purple bg-purple-50 px-3 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
                  {trustees.length} Members
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trustees.map((member) => (
                  <LeadershipCard 
                    key={member.id} 
                    member={member} 
                    isInitialOpen={selectedSlug === member.slug}
                    onSelectSlug={(slug) => onNavigate(`/leadership/${slug}`)} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 2: Executive Leadership */}
          {executives.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-brand-pink flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      Executive Leadership
                    </h2>
                    <p className="text-xs text-content-secondary">
                      Executive directors managing day-to-day relief operations, global partnerships, and financial governance.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-pink bg-pink-50 px-3 py-1 rounded-full border border-pink-200 self-start sm:self-auto">
                  {executives.length} Directors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {executives.map((member) => (
                  <LeadershipCard 
                    key={member.id} 
                    member={member} 
                    isInitialOpen={selectedSlug === member.slug}
                    onSelectSlug={(slug) => onNavigate(`/leadership/${slug}`)} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Core Team */}
          {team.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      Core Team
                    </h2>
                    <p className="text-xs text-content-secondary">
                      Department heads and project specialists leading clean water engineering, health clinics, and educational aid.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                  {team.length} Specialists
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member) => (
                  <LeadershipCard 
                    key={member.id} 
                    member={member} 
                    isInitialOpen={selectedSlug === member.slug}
                    onSelectSlug={(slug) => onNavigate(`/leadership/${slug}`)} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 4: Advisory Board */}
          {advisors.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      Advisory Board
                    </h2>
                    <p className="text-xs text-content-secondary">
                      Subject matter experts guiding hydrogeology research, nephrology medical standards, and statutory governance.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                  {advisors.length} Advisors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {advisors.map((member) => (
                  <LeadershipCard 
                    key={member.id} 
                    member={member} 
                    isInitialOpen={selectedSlug === member.slug}
                    onSelectSlug={(slug) => onNavigate(`/leadership/${slug}`)} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 5: Volunteer Leadership */}
          {volunteers.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      Volunteer Leadership
                    </h2>
                    <p className="text-xs text-content-secondary">
                      Regional task force coordinators mobilizing grassroots aid and emergency response across Kashmir districts.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  {volunteers.length} Coordinators
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {volunteers.map((member) => (
                  <LeadershipCard 
                    key={member.id} 
                    member={member} 
                    isInitialOpen={selectedSlug === member.slug}
                    onSelectSlug={(slug) => onNavigate(`/leadership/${slug}`)} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Filtered Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <LeadershipCard 
              key={member.id} 
              member={member} 
              isInitialOpen={selectedSlug === member.slug}
              onSelectSlug={(slug) => onNavigate(`/leadership/${slug}`)} 
            />
          ))}
        </div>
      )}

      {/* Governance & Statutory Attestation Box */}
      <div className="bg-surface-soft p-6 sm:p-8 rounded-3xl border border-content-border space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck className="w-5 h-5 text-brand-pink" />
            <h3 className="text-base font-extrabold text-brand-purple">
              Public Accountability & Statutory Governance
            </h3>
          </div>
          <p className="text-xs text-content-secondary leading-relaxed">
            All trustees and executive officers serve in compliance with the Indian Trusts Act, NITI Aayog NGO-DARPAN guidelines, and Section 80G/12A statutory standards. Annual audited returns and conflict-of-interest declarations are certified by independent chartered accountants.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/transparency')}
          className="btn-outline !py-2.5 !px-5 text-xs font-bold whitespace-nowrap flex items-center gap-1.5"
        >
          <span>View Audited Returns</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
