import React from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { 
  Heart, Calendar, Users, DollarSign, ArrowLeft, 
  CheckCircle2, ShieldAlert, Sparkles, Home 
} from 'lucide-react';

interface CampaignDetailsProps {
  slug: string;
  onNavigate: (route: string) => void;
  onOpenDonateModal: (projectId?: string, campaignId?: string) => void;
}

export const CampaignDetailsPage: React.FC<CampaignDetailsProps> = ({
  slug,
  onNavigate,
  onOpenDonateModal,
}) => {
  const { campaigns, projects } = useDatabase();
  const { formatUSD } = useCurrency();
  const { t } = useLanguage();

  const campaign = campaigns.find((c) => c.slug === slug) || campaigns[0];

  usePageMeta(
    campaign ? `${campaign.name} | Campaigns` : 'Campaign Details',
    campaign?.description
  );

  const fundingPct = Math.min(
    100,
    Math.round((campaign.amountRaisedUSD / campaign.goalUSD) * 100)
  );
  const remainingUSD = Math.max(0, campaign.goalUSD - campaign.amountRaisedUSD);

  const relatedProjectsList = projects.filter((p) =>
    campaign.relatedProjectIds.includes(p.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-brand-purple dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t('nav.home', 'Home')}</span>
        </button>
        <span>›</span>
        <button
          onClick={() => onNavigate('/campaigns')}
          className="hover:text-brand-purple dark:hover:text-purple-300 transition-colors"
        >
          {t('nav.campaigns', 'Campaigns')}
        </button>
        <span>›</span>
        <span className="text-content-primary font-semibold truncate max-w-xs">{t(`campaign.${campaign.id}.name`, campaign.name)}</span>
      </nav>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/campaigns')}
          className="inline-flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-brand-purple dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('campaign.back', 'Back to All Appeals')}
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-pink/10 dark:bg-pink-950/60 text-brand-pink uppercase tracking-wider">
          {t(campaign.type, campaign.type)} {t('campaign.appeal_label', 'Appeal')}
        </span>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight">
          {t(`campaign.${campaign.id}.name`, campaign.name)}
        </h1>
        <div className="flex items-center gap-4 text-xs text-content-secondary font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-brand-blue" />
            Active Drive: {new Date(campaign.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} – {new Date(campaign.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-brand-md border border-content-border">
            <img
              src={campaign.heroImage}
              alt={t(`campaign.${campaign.id}.name`, campaign.name)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-4">
            <h3 className="text-lg font-extrabold text-content-primary">
              {t('campaign.overview_title', 'Emergency Appeal Overview')}
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              {t(`campaign.${campaign.id}.desc`, campaign.description)}
            </p>
          </div>

          {/* Related Programs */}
          {relatedProjectsList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-content-primary">
                {t('campaign.benefiting_programs', 'Directly Benefiting Programs')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedProjectsList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigate(`/projects/${p.slug}`)}
                    className="bg-white p-4 rounded-2xl border border-content-border hover:border-brand-purple cursor-pointer transition-colors space-y-2 shadow-brand-sm"
                  >
                    <span className="text-[10px] font-bold text-brand-pink uppercase tracking-wider">
                      {t(p.category, p.category)}
                    </span>
                    <h4 className="font-bold text-sm text-content-primary line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-content-secondary line-clamp-2">{p.shortDescription}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Donation Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-3xl border border-content-border p-6 sm:p-8 shadow-brand-md space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-brand-pink uppercase tracking-widest block">
                {t('campaign.progress', 'Appeal Progress')}
              </span>
              <div className="text-3xl font-black text-brand-purple">
                {formatUSD(campaign.amountRaisedUSD)}
              </div>
              <p className="text-xs text-content-muted">
                {t('campaign.raised_toward', 'raised toward')} {formatUSD(campaign.goalUSD)} {t('campaign.target', 'target')}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-3 bg-surface-soft rounded-full overflow-hidden border border-content-border/60">
                <div
                  className="h-full bg-brand-gradient-pink rounded-full"
                  style={{ width: `${fundingPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-content-secondary">
                <span>{fundingPct}% {t('project.funded', 'Funded')}</span>
                <span>{formatUSD(remainingUSD)} {t('project.remaining', 'Needed')}</span>
              </div>
            </div>

            <div className="bg-surface-soft p-3 rounded-xl flex items-center justify-between text-xs text-content-secondary">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-purple" /> {t('campaign.backers', 'Backers')}
              </span>
              <span className="font-black text-content-primary">{campaign.donorCount} {t('project.donors', 'Donors')}</span>
            </div>

            <button
              onClick={() => onOpenDonateModal(undefined, campaign.id)}
              className="btn-secondary w-full !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-pink-glow"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{t('campaign.support_cta', 'Support This Appeal')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
