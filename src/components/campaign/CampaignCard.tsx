import React from 'react';
import { Campaign } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Heart, Users, Flame, Calendar, ArrowRight } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onSelectCampaign: (slug: string) => void;
  onDonateToCampaign: (campaignId: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onSelectCampaign,
  onDonateToCampaign,
}) => {
  const { t, tNum } = useLanguage();
  const { formatUSD } = useCurrency();

  const percentageFunded = Math.min(100, Math.round((campaign.amountRaisedUSD / campaign.goalUSD) * 100));

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-content-border overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all duration-300 flex flex-col group min-w-0">
      {/* Image */}
      <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-surface-soft flex-shrink-0">
        <img
          src={campaign.heroImage}
          alt={campaign.name}
          loading="lazy"
          width="600"
          height="350"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
          {campaign.type === 'emergency' && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-pink text-white flex items-center gap-1 shadow-pink-glow">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> {t('campaign.urgent', 'Emergency')}
            </span>
          )}
          {campaign.type === 'seasonal' && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-purple text-white">
              {t('campaign.seasonal', 'Seasonal')}
            </span>
          )}
          {campaign.type === 'fundraising' && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-blue text-white">
              {t('campaign.community', 'Community')}
            </span>
          )}
        </div>

        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 flex items-center gap-1 text-[10px] sm:text-xs font-medium text-white/90">
          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-blue" />
          <span className="truncate max-w-[130px] sm:max-w-none">{t('campaign.closes', 'Closes')} {new Date(campaign.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
        <div>
          <h3
            onClick={() => onSelectCampaign(campaign.slug)}
            className="text-xs sm:text-lg font-bold sm:font-extrabold text-content-primary hover:text-brand-purple cursor-pointer transition-colors line-clamp-1"
          >
            {t(`campaign.${campaign.id}.name`, campaign.name)}
          </h3>
          <p className="text-[10px] sm:text-xs text-content-secondary line-clamp-2 mt-1 leading-relaxed">
            {t(`campaign.${campaign.id}.desc`, campaign.description)}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-surface-soft rounded-xl sm:rounded-2xl p-2.5 sm:p-4 space-y-2 border border-content-border/60">
          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className="font-bold text-brand-purple truncate">
              {formatUSD(campaign.amountRaisedUSD)}
            </span>
            <span className="font-bold text-brand-pink ml-1">{tNum(percentageFunded)}%</span>
          </div>

          <div className="w-full h-1.5 sm:h-2 bg-content-border/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gradient-pink rounded-full transition-all duration-700"
              style={{ width: `${percentageFunded}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] sm:text-[11px] text-content-muted pt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-brand-blue" /> {tNum(campaign.donorCount)}
            </span>
            <span className="font-semibold text-emerald-600">{t('project.status.active', 'Active')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
          <button
            onClick={() => onSelectCampaign(campaign.slug)}
            className="btn-outline !py-1.5 sm:!py-2.5 !px-2 sm:!px-3 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1"
          >
            <span>{t('project.view_details', 'Details')}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            onClick={() => onDonateToCampaign(campaign.id)}
            className="btn-primary !py-1.5 sm:!py-2.5 !px-2 sm:!px-3 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-brand-sm"
          >
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
            <span>{t('project.donate_now', 'Donate')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
