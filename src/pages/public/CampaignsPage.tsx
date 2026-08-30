import React from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CampaignCard } from '../../components/campaign/CampaignCard';

interface CampaignsPageProps {
  onNavigate: (route: string) => void;
  onOpenDonateModal: (projectId?: string, campaignId?: string) => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ onNavigate, onOpenDonateModal }) => {
  const { campaigns } = useDatabase();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('campaigns.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('campaigns.title', 'Urgent Appeals & Seasonal Campaigns')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t('campaigns.subtitle', 'Targeted emergency response drives and seasonal distributions protecting vulnerable Himalayan families during severe climate hazards.')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
        {campaigns.map((camp) => (
          <CampaignCard
            key={camp.id}
            campaign={camp}
            onSelectCampaign={(slug) => onNavigate(`/campaigns/${slug}`)}
            onDonateToCampaign={(id) => onOpenDonateModal(undefined, id)}
          />
        ))}
      </div>
    </div>
  );
};
