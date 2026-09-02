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
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-content-border dark:border-slate-800 overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all duration-300 flex flex-col group min-w-0">
      {/* Hero Image Container */}
      <div className="relative h-36 sm:h-56 w-full overflow-hidden bg-surface-soft dark:bg-slate-950 flex-shrink-0">
        <img
          src={project.heroImage}
          alt={project.name}
          loading="lazy"
          width="600"
          height="350"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category & Status Badges */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-1.5 z-10">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-purple text-white shadow-sm">
            {t(project.category, project.category)}
          </span>
          {project.urgent && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-orange text-white shadow-sm animate-pulse">
              {t('Urgent Appeal', 'Urgent')}
            </span>
          )}
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-white">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-pink flex-shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-none">{project.city}, {project.region}</span>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          {isFullyFunded ? (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">{t('project.status.funded', 'Funded')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-blue text-white shadow-sm">
              {t('project.status.active', 'Active')}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
        <div>
          <h3 
            onClick={() => onSelectProject(project.slug)}
            className="text-xs sm:text-lg font-bold sm:font-extrabold text-content-primary hover:text-brand-purple dark:hover:text-purple-300 cursor-pointer transition-colors line-clamp-1"
          >
            {project.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-content-secondary line-clamp-2 mt-1 leading-relaxed">
            {project.shortDescription}
          </p>
        </div>

        {/* Dynamic Funding Stats */}
        <div className="bg-surface-soft dark:bg-slate-950 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 space-y-2 sm:space-y-3 border border-content-border/60 dark:border-slate-800">
          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className="font-semibold text-content-muted">
              {t('project.funded', 'Funded')}: <span className="font-bold text-brand-purple dark:text-purple-300">{tNum(percentageFunded)}%</span>
            </span>
            <span className="font-semibold text-content-muted flex items-center gap-0.5 sm:gap-1">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-pink" />
              <span className="font-bold text-content-primary">{tNum(project.donorCount)}</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 sm:h-2.5 bg-content-border/60 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isFullyFunded ? 'bg-emerald-500' : 'bg-brand-gradient-pink'
              }`}
              style={{ width: `${percentageFunded}%` }}
            />
          </div>

          {/* Detailed Financial Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 pt-1 border-t border-content-border/40 text-[9px] sm:text-[11px]">
            <div>
              <span className="text-content-muted block text-[8px] sm:text-[10px] uppercase font-bold">{t('project.total_need', 'Goal')}</span>
              <span className="font-bold text-content-primary">{formatUSD(project.fundingGoalUSD)}</span>
            </div>
            <div>
              <span className="text-content-muted block text-[8px] sm:text-[10px] uppercase font-bold">{t('project.raised', 'Raised')}</span>
              <span className="font-bold text-brand-purple">{formatUSD(project.amountRaisedUSD)}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
          <button
            onClick={() => onSelectProject(project.slug)}
            className="btn-outline !py-1.5 sm:!py-2.5 !px-2 sm:!px-3 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1"
          >
            <span>{t('project.view_details', 'Details')}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            onClick={() => onDonateToProject(project.id)}
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
