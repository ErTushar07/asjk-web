import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Heart, MapPin, Calendar, Users, DollarSign, ArrowLeft, 
  CheckCircle2, Clock, AlertCircle, Share2, FileText, ChevronRight 
} from 'lucide-react';

interface ProjectDetailsProps {
  slug: string;
  onNavigate: (route: string) => void;
  onOpenDonateModal: (projectId: string) => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsProps> = ({
  slug,
  onNavigate,
  onOpenDonateModal,
}) => {
  const { projects } = useDatabase();
  const { formatUSD } = useCurrency();
  const { t } = useLanguage();

  const project = projects.find((p) => p.slug === slug) || projects[0];

  const fundingPct = Math.min(
    100,
    Math.round((project.amountRaisedUSD / project.fundingGoalUSD) * 100)
  );
  const remainingUSD = Math.max(0, project.fundingGoalUSD - project.amountRaisedUSD);
  const isFunded = project.status === 'funded' || project.amountRaisedUSD >= project.fundingGoalUSD;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button & Category */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('project.back_to_all', 'Back to All Projects')}
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple/10 text-brand-purple uppercase tracking-wider">
          {t(project.category, project.category)}
        </span>
      </div>

      {/* Hero Title & Location */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight">
          {project.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-4 h-4 text-brand-pink" />
            {project.locationDetails} ({project.city}, {project.region})
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 font-mono">
            <Calendar className="w-4 h-4 text-brand-blue" />
            {t('project.timeline', 'Timeline')}: {new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} – {new Date(project.expectedCompletionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Donation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Media & Story (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Main Hero Image */}
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-brand-md border border-content-border">
            <img
              src={project.heroImage}
              alt={project.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-purple shadow-sm">
              {project.beneficiariesCount.toLocaleString()}+ {t('project.direct_beneficiaries', 'Direct Beneficiaries')}
            </div>
          </div>

          {/* Problem Statement & Context */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-4">
            <h3 className="text-lg font-extrabold text-content-primary">
              {t('project.challenge_title', 'The Challenge & Need in Kashmir')}
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              {project.problemStatement}
            </p>
            <div className="pt-2 border-t border-content-border/60">
              <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider mb-2">
                {t('project.overview_title', 'Detailed Program Overview')}
              </h4>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                {project.longDescription}
              </p>
            </div>
          </div>

          {/* Objectives & Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-3">
              <h4 className="font-extrabold text-sm text-brand-purple">
                {t('project.key_objectives', 'Key Objectives')}
              </h4>
              <ul className="space-y-2 text-xs text-content-secondary">
                {project.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-pink flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-3">
              <h4 className="font-extrabold text-sm text-brand-blue">
                {t('project.expected_outcomes', 'Expected Measurable Outcomes')}
              </h4>
              <ul className="space-y-2 text-xs text-content-secondary">
                {project.expectedOutcomes.map((out, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Milestones Roadmap */}
          {project.milestones.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
              <h3 className="text-lg font-extrabold text-content-primary">
                {t('project.milestones_title', 'Implementation Milestones & Budget Breakdown')}
              </h3>
              <div className="space-y-4">
                {project.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className="p-4 rounded-2xl bg-surface-soft border border-content-border space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-content-primary">{ms.title}</span>
                      <span className="font-mono font-bold text-brand-purple">
                        ${ms.costRequirementUSD.toLocaleString()} USD ({ms.completionPercentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-content-secondary">{ms.description}</p>
                    <div className="w-full h-2 bg-content-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-gradient-blue rounded-full"
                        style={{ width: `${ms.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Updates & Reports */}
          {project.updates.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
              <h3 className="text-lg font-extrabold text-content-primary">
                {t('project.field_updates', 'Field Updates & Progress Reports')}
              </h3>
              <div className="space-y-4">
                {project.updates.map((upd) => (
                  <div key={upd.id} className="p-4 rounded-2xl bg-surface-soft border border-content-border space-y-2">
                    <div className="flex justify-between items-center text-xs text-content-muted">
                      <span className="font-mono">{new Date(upd.date).toLocaleDateString()}</span>
                      <span className="font-semibold text-brand-purple">{upd.authorName}</span>
                    </div>
                    <h4 className="font-bold text-sm text-content-primary">{upd.title}</h4>
                    <p className="text-xs text-content-secondary leading-relaxed">{upd.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Column: Financial Ledger & Donation (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-3xl border border-content-border p-6 sm:p-8 shadow-brand-md space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-brand-pink uppercase tracking-widest block">
                {t('project.financial_ledger', 'Verified Financial Ledger')}
              </span>
              <div className="text-3xl font-black text-brand-purple">
                {formatUSD(project.amountRaisedUSD)}
              </div>
              <p className="text-xs text-content-muted">
                {t('campaign.raised_toward', 'raised toward')} {formatUSD(project.fundingGoalUSD)} {t('project.budget_goal', 'budget goal')}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-surface-soft rounded-full overflow-hidden border border-content-border/60">
                <div
                  className="h-full bg-brand-gradient-pink rounded-full transition-all duration-700"
                  style={{ width: `${fundingPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-content-secondary">
                <span>{fundingPct}% {t('project.funded', 'Funded')}</span>
                <span>{formatUSD(remainingUSD)} {t('project.remaining', 'Needed')}</span>
              </div>
            </div>

            {/* Donors Count */}
            <div className="bg-surface-soft p-3 rounded-xl flex items-center justify-between text-xs text-content-secondary">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-purple" /> {t('project.verified_donors', 'Verified Donors')}
              </span>
              <span className="font-black text-content-primary">{project.donorCount} {t('project.donors', 'Donors')}</span>
            </div>

            {/* Donate Trigger Button */}
            <button
              onClick={() => onOpenDonateModal(project.id)}
              className="btn-secondary w-full !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-pink-glow"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{t('project.donate_now', 'Support This Project')}</span>
            </button>

            {/* Exemption & Transparency Note */}
            <div className="text-[11px] text-content-muted space-y-2 pt-2 border-t border-content-border">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('hero.stat_pdf', 'Instant 80G Tax Exemption PDF Receipt')}</span>
              </div>
              <p>
                {t('project.guarantee_note', 'Al Shujaiat Foundation Jammu & Kashmir guarantees 100% direct program fund allocation with public auditing records.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
