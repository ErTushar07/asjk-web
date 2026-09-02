import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { ProjectCard } from '../../components/project/ProjectCard';
import { CampaignCard } from '../../components/campaign/CampaignCard';
import { 
  Heart, ShieldCheck, FileText, ArrowRight, CheckCircle2, Globe, Users, 
  MapPin, Sparkles, Droplets, GraduationCap, Activity, HeartHandshake
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenDonateModal: (projectId?: string, campaignId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenDonateModal }) => {
  const { t, tNum } = useLanguage();
  const { formatUSD } = useCurrency();
  const { projects, campaigns, stories, impactMetrics } = useDatabase();

  const featuredProjects = projects.filter((p) => p.featured || p.status === 'active').slice(0, 3);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').slice(0, 2);
  const featuredStories = stories.slice(0, 2);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-soft via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-12 pb-20 border-b border-content-border/60">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-highlight dark:bg-purple-950/60 border border-brand-blue/30 dark:border-purple-800 text-brand-purple dark:text-purple-300 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-4 h-4 text-brand-pink" />
                <span>{t('hero.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-content-primary tracking-tight leading-[1.15]">
                {t('hero.title', 'Empowering Communities, Transforming Lives Across Jammu & Kashmir')}
              </h1>

              <p className="text-content-secondary text-sm sm:text-base leading-relaxed max-w-xl">
                {t('hero.subtitle', 'Al Shujaiat Foundation Jammu & Kashmir delivers clean water, quality education, emergency relief, healthcare, and livelihood support to remote Himalayan villages with 100% financial transparency.')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenDonateModal()}
                  className="btn-secondary !py-3.5 !px-6 text-sm sm:text-base flex items-center gap-2.5 shadow-pink-glow"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{t('hero.donate_cta', 'Donate Securely')}</span>
                </button>

                <button
                  onClick={() => onNavigate('/projects')}
                  className="btn-outline !py-3.5 !px-6 text-sm sm:text-base flex items-center gap-2"
                >
                  <span>{t('hero.explore_cta', 'Explore Projects')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-content-border/60 flex flex-wrap items-center gap-6 text-xs text-content-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-purple" />
                  <span className="font-semibold text-content-primary">{t('hero.stat_80g', '80G & 501(c)(3) Exempt')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-pink" />
                  <span className="font-semibold text-content-primary">{t('hero.stat_pdf', 'Instant PDF Receipts')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-blue" />
                  <span className="font-semibold text-content-primary">{t('hero.stat_currency', 'Multi-Currency & Subscriptions')}</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-brand-lg border border-content-border/80">
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=800&q=80"
                    alt="Clean Water in Kashmir"
                    loading="lazy"
                    width="600"
                    height="350"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-brand-pink text-white text-xs font-bold px-3 py-1 rounded-full shadow-pink-glow">
                    {t('hero.featured_badge', 'Featured Project')}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-content-primary">
                    {t('hero.featured_title', 'Clean Water for Remote Himalayan Villages')}
                  </h3>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    {t('hero.featured_desc', '24 solar deep-tube filtration wells operational. 16 more required before winter freezes.')}
                  </p>

                  <div className="bg-surface-soft p-3 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-purple">{t('hero.featured_raised', 'Raised')}: $63,500</span>
                      <span className="text-content-muted">{t('hero.featured_need', 'Need')}: $100,000</span>
                    </div>
                    <div className="w-full h-2 bg-content-border rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gradient-pink w-[63.5%]" />
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenDonateModal('proj_clean_water')}
                    className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{t('hero.featured_cta', 'Support This Project')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Impact Statistics Counters */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-brand-purple text-white rounded-2xl sm:rounded-3xl p-5 sm:p-12 shadow-brand-lg relative overflow-hidden">
          <div className="relative z-10 text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <span className="text-[10px] sm:text-xs font-bold text-brand-pink tracking-widest uppercase block mb-1">
              {t('home.impact_badge', 'Measurable Human Impact')}
            </span>
            <h2 className="text-lg sm:text-3xl font-extrabold tracking-tight">
              {t('home.impact_title', 'Real Lives Changed Across Jammu & Kashmir')}
            </h2>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 text-center">
            {impactMetrics.map((m) => (
              <div 
                key={m.id} 
                className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-white/10 hover:border-brand-pink/60 hover:bg-white/15 transition-all flex flex-col justify-center items-center min-w-0"
              >
                <div className="text-sm sm:text-2xl font-black text-brand-blue tracking-tight flex items-baseline justify-center flex-wrap">
                  <span>{tNum(m.value)}</span>
                  <span className="text-brand-pink font-extrabold ml-0.5 text-xs sm:text-lg">
                    {m.unit && !['Units', 'Children', 'Meals', 'Patients', 'Villages'].includes(m.unit) ? m.unit : '+'}
                  </span>
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-white/90 block mt-1 leading-snug line-clamp-2">
                  {t(m.label, m.label)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Active Projects */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-row items-end justify-between gap-2">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-brand-pink tracking-widest uppercase block mb-0.5">
              {t('home.active_fundraisers', 'Active Fundraisers')}
            </span>
            <h2 className="text-lg sm:text-3xl font-extrabold text-content-primary tracking-tight">
              {t('home.priority_projects', 'Priority Humanitarian Projects')}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/projects')}
            className="btn-outline !py-1.5 !px-2.5 sm:!py-2.5 sm:!px-4 text-[10px] sm:text-xs font-bold flex items-center gap-1 flex-shrink-0"
          >
            <span>{t('home.view_all', 'View All')}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelectProject={(slug) => onNavigate(`/projects/${slug}`)}
              onDonateToProject={(id) => onOpenDonateModal(id)}
            />
          ))}
        </div>
      </section>

      {/* 4. Active Emergency & Seasonal Campaigns */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="bg-surface-highlight rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-brand-blue/30 space-y-6 sm:space-y-8">
          <div className="flex flex-row items-end justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-brand-orange tracking-widest uppercase block mb-0.5">
                {t('home.special_appeals', 'Special Appeals')}
              </span>
              <h2 className="text-lg sm:text-3xl font-extrabold text-content-primary tracking-tight">
                {t('home.emergency_drives', 'Emergency & Seasonal Drives')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/campaigns')}
              className="btn-primary !py-1.5 !px-2.5 sm:!py-2 sm:!px-4 text-[10px] sm:text-xs font-bold flex items-center gap-1 flex-shrink-0"
            >
              <span>{t('home.all_appeals', 'All Appeals')}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
            {activeCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onSelectCampaign={(slug) => onNavigate(`/campaigns/${slug}`)}
                onDonateToCampaign={(id) => onOpenDonateModal(undefined, id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Transparency & Governance Spotlight */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-surface-card rounded-2xl sm:rounded-3xl p-5 sm:p-12 border border-content-border grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-10">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple text-[10px] sm:text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" /> {t('home.transparency_badge', '100% Financial Transparency')}
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
              {t('home.transparency_title', 'Financial Transparency & Accountability')}
            </h2>
            <p className="text-content-secondary text-xs sm:text-sm leading-relaxed">
              {t('home.transparency_desc', 'We publish independent chartered accountant audited financial balance sheets, program cost allocations, and donor receipts openly.')}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-content-border">
                <span className="text-base sm:text-lg font-bold text-brand-purple block">88.5%</span>
                <span className="text-[10px] sm:text-[11px] text-content-secondary">{t('home.direct_aid', 'Direct Program Aid')}</span>
              </div>
              <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-content-border">
                <span className="text-base sm:text-lg font-bold text-brand-pink block">100%</span>
                <span className="text-[10px] sm:text-[11px] text-content-secondary">{t('home.verified_audits', 'Verified Project Audits')}</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => onNavigate('/transparency')}
                className="btn-primary !py-2 !px-3 sm:!py-2.5 sm:!px-4 text-[10px] sm:text-xs font-bold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t('home.audited_cta', 'Audited Statements & 80G Docs')}</span>
              </button>
            </div>
          </div>

          <div className="w-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-content-border space-y-3 sm:space-y-4 shadow-brand-sm">
            <h4 className="font-extrabold text-xs sm:text-sm text-brand-purple uppercase tracking-wider">
              {t('home.donation_breakdown', 'Where Your Donation Goes')}
            </h4>
            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <div className="flex justify-between text-[11px] sm:text-xs font-semibold mb-1">
                  <span>{t('home.clean_water_edu', 'Clean Water, Education & Relief')}</span>
                  <span className="text-brand-purple font-bold">88.5%</span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-surface-soft rounded-full overflow-hidden">
                  <div className="h-full bg-brand-purple rounded-full w-[88.5%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] sm:text-xs font-semibold mb-1">
                  <span>{t('home.monitoring_logistics', 'Monitoring & Field Logistics')}</span>
                  <span className="text-brand-pink font-bold">7.2%</span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-surface-soft rounded-full overflow-hidden">
                  <div className="h-full bg-brand-pink rounded-full w-[7.2%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] sm:text-xs font-semibold mb-1">
                  <span>{t('home.auditing_gov', 'Auditing & Governance')}</span>
                  <span className="text-brand-blue font-bold">4.3%</span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-surface-soft rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue rounded-full w-[4.3%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Beneficiary Stories */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-row items-end justify-between gap-2">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-brand-pink tracking-widest uppercase block mb-0.5">
              {t('home.field_realities', 'Field Realities')}
            </span>
            <h2 className="text-lg sm:text-3xl font-extrabold text-content-primary tracking-tight">
              {t('home.stories_title', 'Stories of Hope & Transformation')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/stories')}
            className="btn-outline !py-1.5 !px-2.5 sm:!py-2.5 sm:!px-4 text-[10px] sm:text-xs font-bold flex items-center gap-1 flex-shrink-0"
          >
            <span>{t('home.all_stories', 'All Stories')}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
          {featuredStories.map((s) => (
            <div
              key={s.id}
              onClick={() => onNavigate('/stories')}
              className="bg-white rounded-2xl sm:rounded-3xl border border-content-border overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all cursor-pointer group flex flex-col min-w-0"
            >
              <div className="relative h-32 sm:h-56 w-full overflow-hidden flex-shrink-0">
                <img
                  src={s.coverImage}
                  alt={s.title}
                  loading="lazy"
                  width="600"
                  height="350"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white text-[9px] sm:text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-pink" /> <span className="truncate max-w-[100px] sm:max-w-none">{s.location}</span>
                </div>
              </div>
              <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                <div>
                  <span className="text-[9px] sm:text-[11px] font-bold text-brand-pink uppercase tracking-wider truncate block">
                    {s.beneficiaryName}
                  </span>
                  <h3 className="text-xs sm:text-base font-bold sm:font-extrabold text-content-primary group-hover:text-brand-purple transition-colors mt-0.5 line-clamp-1">
                    {s.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-content-secondary line-clamp-2 mt-1 leading-relaxed">
                    {s.summary}
                  </p>
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-brand-purple flex items-center gap-1 pt-1">
                  <span>{t('home.read_story', 'Read Story')}</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Volunteer & Partner Call to Action */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6">
          <div className="bg-brand-purple text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-2.5 sm:space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-xl font-extrabold tracking-tight">{t('home.become_volunteer', 'Become a Volunteer')}</h3>
              <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed mt-1 line-clamp-2 sm:line-clamp-none">
                {t('home.volunteer_desc', 'Join our passionate field volunteers delivering aid across J&K.')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/volunteer')}
              className="btn-secondary !py-1.5 sm:!py-2.5 !px-3 sm:!px-5 text-[10px] sm:text-xs font-bold self-start"
            >
              {t('home.apply_now', 'Apply Now')}
            </button>
          </div>

          <div className="bg-surface-highlight text-content-primary rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-2.5 sm:space-y-4 border border-brand-blue/40 flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-xl font-extrabold tracking-tight text-brand-purple">{t('home.corporate_partnerships', 'Corporate Partnerships')}</h3>
              <p className="text-content-secondary text-[10px] sm:text-xs leading-relaxed mt-1 line-clamp-2 sm:line-clamp-none">
                {t('home.partner_desc', 'Partner for CSR projects, grants, and high-impact programs.')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/partners')}
              className="btn-outline !py-1.5 sm:!py-2.5 !px-3 sm:!px-5 text-[10px] sm:text-xs font-bold self-start"
            >
              {t('home.inquire', 'Inquire')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
