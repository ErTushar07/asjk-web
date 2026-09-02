import React from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCountUp } from '../../hooks/useCountUp';
import { Users, Droplets, GraduationCap, HeartHandshake, Activity, Home, CheckCircle2 } from 'lucide-react';

const MetricCard: React.FC<{ metric: any; iconMap: Record<string, any> }> = ({ metric, iconMap }) => {
  const { t, tNum } = useLanguage();
  const Icon = iconMap[metric.iconName] || Users;
  const { count, ref } = useCountUp(metric.value, 1800);

  return (
    <div
      ref={ref}
      className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-content-border dark:border-slate-800 p-3.5 sm:p-8 shadow-brand-sm hover:shadow-brand-md transition-all space-y-3 sm:space-y-4 flex flex-col justify-between min-w-0 group"
    >
      <div className="space-y-2 sm:space-y-3">
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-surface-soft flex items-center justify-center text-brand-purple group-hover:bg-brand-purple/10 transition-colors">
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-brand-pink" />
        </div>
        <div className="text-xl sm:text-4xl font-black text-brand-purple flex items-baseline flex-wrap">
          <span className="font-mono tracking-tight">{tNum(count)}</span>
          <span className="text-brand-pink text-sm sm:text-3xl font-extrabold ml-0.5 sm:ml-1">
            {metric.unit && !['Units', 'Children', 'Meals', 'Patients', 'Villages'].includes(metric.unit)
              ? metric.unit
              : '+'}
          </span>
        </div>
        <h4 className="font-extrabold text-xs sm:text-base text-content-primary truncate">
          {t(metric.label, metric.label)}
        </h4>
        <p className="text-[10px] sm:text-xs text-content-secondary leading-relaxed line-clamp-3">
          {t(metric.label + '.desc', metric.description)}
        </p>
      </div>

      <div className="pt-2 sm:pt-3 border-t border-content-border/60 flex items-center gap-1 text-[9px] sm:text-[11px] text-emerald-600 font-bold">
        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        <span className="truncate">{t('impact.field_verified', 'Field Verified in J&K')}</span>
      </div>
    </div>
  );
};

export const ImpactPage: React.FC<{ onNavigate?: (route: string) => void }> = () => {
  const { impactMetrics } = useDatabase();
  const { t } = useLanguage();

  const iconMap: Record<string, any> = {
    Users,
    Droplets,
    GraduationCap,
    HeartHandshake,
    Activity,
    Home,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fadeIn">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('impact.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('impact.title', 'Quantifiable Impact & Sustainable Transformation')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t(
            'impact.subtitle',
            'We measure our success not simply in funds raised, but in verifiable metrics: liters of clean water pumped, classrooms digitalized, patients treated, and families sheltered.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
        {impactMetrics.map((m) => (
          <MetricCard key={m.id} metric={m} iconMap={iconMap} />
        ))}
      </div>

      {/* Sustainable Development Goals */}
      <div className="bg-surface-card rounded-3xl p-8 sm:p-12 border border-content-border space-y-6 shadow-brand-sm">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">
            {t('impact.sdg_badge', 'Global Development Alignment')}
          </span>
          <h3 className="text-2xl font-extrabold text-content-primary">
            {t('impact.sdg_title', 'Aligned with United Nations Sustainable Development Goals (SDGs)')}
          </h3>
          <p className="text-xs text-content-secondary">
            {t(
              'impact.sdg_desc',
              'Our programs in Jammu & Kashmir directly support global targets for clean water, zero hunger, good health, and quality education.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-content-primary">
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1 hover:border-brand-pink transition-colors">
            <span className="text-brand-pink font-mono block text-sm">SDG 6</span>
            <span>{t('Clean Water & Sanitation', 'Clean Water & Sanitation')}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1 hover:border-brand-purple transition-colors">
            <span className="text-brand-purple font-mono block text-sm">SDG 4</span>
            <span>{t('Quality Education', 'Quality Education')}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1 hover:border-brand-blue transition-colors">
            <span className="text-brand-blue font-mono block text-sm">SDG 3</span>
            <span>{t('Good Health & Well-being', 'Good Health & Well-being')}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1 hover:border-brand-orange transition-colors">
            <span className="text-brand-orange font-mono block text-sm">SDG 1 & 2</span>
            <span>{t('No Poverty & Zero Hunger', 'No Poverty & Zero Hunger')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
