import React from 'react';
import { Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Heart, Users, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelectProject: (slug: string) => void;
  onDonateToProject: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelectProject,
  onDonateToProject,
}) => {
  const { t, tNum } = useLanguage();
  const { formatUSD } = useCurrency();

  const percentageFunded = Math.min(100, Math.round((project.amountRaisedUSD / project.fundingGoalUSD) * 100));
  const remainingUSD = Math.max(0, project.fundingGoalUSD - project.amountRaisedUSD);
  const isFullyFunded = project.amountRaisedUSD >= project.fundingGoalUSD;

  return (
    <div className="bg-white rounded-3xl border border-content-border overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all duration-300 flex flex-col group">
      {/* Hero Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-surface-soft">
        <img
          src={project.heroImage}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category & Status Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple text-white shadow-sm">
            {t(project.category, project.category)}
          </span>
          {project.urgent && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-orange text-white shadow-sm animate-pulse">
              {t('Urgent Appeal', 'Urgent Appeal')}
            </span>
          )}
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-semibold text-white">
          <MapPin className="w-3.5 h-3.5 text-brand-pink" />
          <span>{project.city}, {project.region}</span>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 right-4">
          {isFullyFunded ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('project.status.funded', 'Fully Funded')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-blue text-white shadow-sm">
              {t('project.status.active', 'Active')}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 
            onClick={() => onSelectProject(project.slug)}
            className="text-lg font-extrabold text-content-primary hover:text-brand-purple cursor-pointer transition-colors line-clamp-1"
          >
            {project.name}
          </h3>
          <p className="text-xs text-content-secondary line-clamp-2 mt-1.5 leading-relaxed">
            {project.shortDescription}
          </p>
        </div>

        {/* Dynamic Funding Stats */}
        <div className="bg-surface-soft rounded-2xl p-4 space-y-3 border border-content-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-content-muted">
              {t('project.funded', 'Funded')}: <span className="font-bold text-brand-purple">{tNum(percentageFunded)}%</span>
            </span>
            <span className="font-semibold text-content-muted flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-pink" />
              <span className="font-bold text-content-primary">{tNum(project.donorCount)}</span> {t('project.donors', 'Donors')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-content-border/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFullyFunded ? 'bg-emerald-500' : 'bg-brand-gradient-pink'
              }`}
              style={{ width: `${percentageFunded}%` }}
            />
          </div>

          {/* Detailed Financial Numbers */}
          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-content-border/40 text-[11px]">
            <div>
              <span className="text-content-muted block text-[10px] uppercase font-bold">{t('project.total_need', 'Total Need')}</span>
              <span className="font-bold text-content-primary">{formatUSD(project.fundingGoalUSD)}</span>
            </div>
            <div>
              <span className="text-content-muted block text-[10px] uppercase font-bold">{t('project.raised', 'Raised')}</span>
              <span className="font-bold text-brand-purple">{formatUSD(project.amountRaisedUSD)}</span>
            </div>
            <div className="text-right">
              <span className="text-content-muted block text-[10px] uppercase font-bold">{t('project.remaining', 'Remaining')}</span>
              <span className="font-bold text-brand-pink">{formatUSD(remainingUSD)}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onSelectProject(project.slug)}
            className="btn-outline !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <span>{t('project.view_details', 'View Details')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDonateToProject(project.id)}
            className="btn-primary !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-brand-sm"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>{t('project.donate_now', 'Donate')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
