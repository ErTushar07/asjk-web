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
  const { t } = useLanguage();
  const { formatUSD } = useCurrency();

  const percentageFunded = Math.min(100, Math.round((campaign.amountRaisedUSD / campaign.goalUSD) * 100));

  return (
    <div className="bg-white rounded-3xl border border-content-border overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all duration-300 flex flex-col group">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-soft">
        <img
          src={campaign.heroImage}
          alt={campaign.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2">
          {campaign.type === 'emergency' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-pink text-white flex items-center gap-1 shadow-pink-glow">
              <Flame className="w-3.5 h-3.5 fill-white" /> Emergency Appeal
            </span>
          )}
          {campaign.type === 'seasonal' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple text-white">
              Seasonal Campaign
            </span>
          )}
          {campaign.type === 'fundraising' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-blue text-white">
              Community Drive
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-white/90">
          <Calendar className="w-3.5 h-3.5 text-brand-blue" />
          <span>Active Appeal: Closes {new Date(campaign.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={() => onSelectCampaign(campaign.slug)}
            className="text-lg font-extrabold text-content-primary hover:text-brand-purple cursor-pointer transition-colors line-clamp-1"
          >
            {campaign.name}
          </h3>
          <p className="text-xs text-content-secondary line-clamp-2 mt-1.5 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-surface-soft rounded-2xl p-4 space-y-2 border border-content-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-brand-purple">
              {formatUSD(campaign.amountRaisedUSD)}{' '}
              <span className="font-normal text-content-muted">raised of {formatUSD(campaign.goalUSD)}</span>
            </span>
            <span className="font-bold text-brand-pink">{percentageFunded}%</span>
          </div>

          <div className="w-full h-2 bg-content-border/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gradient-pink rounded-full transition-all duration-700"
              style={{ width: `${percentageFunded}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-content-muted pt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-blue" /> {campaign.donorCount} Supporters
            </span>
            <span className="font-semibold text-emerald-600">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onSelectCampaign(campaign.slug)}
            className="btn-outline !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDonateToCampaign(campaign.id)}
            className="btn-secondary !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-pink-glow"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Donate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
