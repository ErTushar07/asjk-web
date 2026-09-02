import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LeadershipCategory, LeadershipMember } from '../../types';
import { LeadershipCard } from '../../components/leadership/LeadershipCard';
import { usePageMeta } from '../../hooks/usePageMeta';
import { 
  ShieldCheck, Users, Crown, Briefcase, 
  HeartHandshake, Award, Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';

interface LeadershipPageProps {
  selectedSlug?: string;
  onNavigate: (route: string) => void;
}

export const LeadershipPage: React.FC<LeadershipPageProps> = ({ selectedSlug, onNavigate }) => {
  usePageMeta(
    'Board of Trustees & Leadership',
    'Meet the Board of Trustees, executive leadership, advisors, and core team members of Al Shujaiat Foundation Jammu & Kashmir (ASFJK).'
  );
  const { getPublicLeadership } = useDatabase();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<LeadershipCategory | 'all'>('all');

  const members = getPublicLeadership();

  const categories: { id: LeadershipCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: t('leadership.cat_all', 'All Governance'), icon: Users },
    { id: 'trustee', label: t('leadership.cat_trustee', 'Board of Trustees'), icon: Crown },
    { id: 'executive', label: t('leadership.cat_executive', 'Executive Leadership'), icon: Briefcase },
    { id: 'team', label: t('leadership.cat_team', 'Core Team'), icon: Users },
    { id: 'advisor', label: t('leadership.cat_advisor', 'Advisory Board'), icon: Award },
    { id: 'volunteer_leader', label: t('leadership.cat_volunteer_leader', 'Volunteer Leadership'), icon: HeartHandshake },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fadeIn">
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
                    : 'bg-white dark:bg-slate-900 text-content-secondary border-content-border dark:border-slate-800 hover:border-brand-purple/40 hover:text-content-primary'
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-brand-purple dark:text-purple-300 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      {t('leadership.trustees_title', 'Board of Trustees')}
                    </h2>
                    <p className="text-xs text-content-secondary">
                      {t('leadership.trustees_desc', 'Highest governing authority responsible for strategic direction, legal trust compliance, and statutory integrity.')}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-purple dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
                  {trustees.length} {t('leadership.members_count', 'Members')}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-brand-pink dark:text-pink-300 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      {t('leadership.executives_title', 'Executive Leadership')}
                    </h2>
                    <p className="text-xs text-content-secondary">
                      {t('leadership.executives_desc', 'Executive directors managing day-to-day relief operations, global partnerships, and financial governance.')}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-pink dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-800 self-start sm:self-auto">
                  {executives.length} {t('leadership.directors_count', 'Directors')}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-brand-blue dark:text-blue-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      {t('leadership.team_title', 'Core Team')}
                    </h2>
                    <p className="text-xs text-content-secondary">
                      {t('leadership.team_desc', 'Department heads and project specialists leading clean water engineering, health clinics, and educational aid.')}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-blue dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                  {team.length} {t('leadership.specialists_count', 'Specialists')}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      {t('leadership.advisors_title', 'Advisory Board')}
                    </h2>
                    <p className="text-xs text-content-secondary">
                      {t('leadership.advisors_desc', 'Subject matter experts guiding hydrogeology research, nephrology medical standards, and statutory governance.')}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
                  {advisors.length} {t('leadership.advisors_count', 'Advisors')}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-content-border dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                      {t('leadership.volunteers_title', 'Volunteer Leadership')}
                    </h2>
                    <p className="text-xs text-content-secondary">
                      {t('leadership.volunteers_desc', 'Regional task force coordinators mobilizing grassroots aid and emergency response across Kashmir districts.')}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                  {volunteers.length} {t('leadership.coordinators_count', 'Coordinators')}
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
      <div className="bg-surface-soft dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-content-border dark:border-slate-800 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck className="w-5 h-5 text-brand-pink" />
            <h3 className="text-base font-extrabold text-brand-purple dark:text-purple-300">
              {t('leadership.statutory_title', 'Public Accountability & Statutory Governance')}
            </h3>
          </div>
          <p className="text-xs text-content-secondary leading-relaxed">
            {t(
              'leadership.statutory_desc',
              'All trustees and executive officers serve in compliance with the Indian Trusts Act, NITI Aayog NGO-DARPAN guidelines, and Section 80G/12A statutory standards. Annual audited returns and conflict-of-interest declarations are certified by independent chartered accountants.'
            )}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/transparency')}
          className="btn-outline !py-2.5 !px-5 text-xs font-bold whitespace-nowrap flex items-center gap-1.5"
        >
          <span>{t('leadership.view_audits', 'View Audited Returns')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
