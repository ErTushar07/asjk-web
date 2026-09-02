import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { 
  Heart, MapPin, Calendar, Users, DollarSign, ArrowLeft, 
  CheckCircle2, Clock, AlertCircle, Share2, FileText, ChevronRight,
  MessageCircle, Twitter, Link as LinkIcon, Check, Home
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
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const project = projects.find((p) => p.slug === slug);

  usePageMeta(
    project ? `${project.name} | Projects` : 'Project Details',
    project?.shortDescription
  );

  if (!project) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-surface-soft dark:bg-slate-800 text-content-muted flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8 text-brand-pink" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-content-primary">Project Not Found</h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            This project may have ended or the link may be incorrect.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/projects')}
          className="btn-primary !py-2.5 !px-6 text-xs font-bold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`Support this project on Al Shujaiat Foundation: ${project.name}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`Check out "${project.name}" on Al Shujaiat Foundation:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    toast.success('Project link copied to clipboard!', 'Link Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const fundingPct = Math.min(
    100,
    Math.round((project.amountRaisedUSD / project.fundingGoalUSD) * 100)
  );
  const remainingUSD = Math.max(0, project.fundingGoalUSD - project.amountRaisedUSD);
  const isFunded = project.status === 'funded' || project.amountRaisedUSD >= project.fundingGoalUSD;

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
          onClick={() => onNavigate('/projects')}
          className="hover:text-brand-purple dark:hover:text-purple-300 transition-colors"
        >
          {t('nav.projects', 'Projects')}
        </button>
        <span>›</span>
        <span className="text-content-primary font-semibold truncate max-w-xs">{project.name}</span>
      </nav>

      {/* Back button & Category */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-brand-purple dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('project.back_to_all', 'Back to All Projects')}
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple/10 dark:bg-purple-950/60 text-brand-purple dark:text-purple-300 uppercase tracking-wider">
          {t(project.category, project.category)}
        </span>
      </div>

      {/* Hero Title, Location & Social Share */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight">
          {project.name}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-content-secondary pt-1 border-b border-content-border dark:border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-4">
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

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider mr-1">Share:</span>
            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareTwitter}
              title="Share on X (Twitter)"
              className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 hover:bg-sky-100 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy Link"
              className="p-2 rounded-xl bg-surface-soft dark:bg-slate-800 text-content-secondary hover:text-brand-purple transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Donation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Media & Story (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Main Hero Image */}
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-brand-md border border-content-border dark:border-slate-800">
            <img
              src={project.heroImage}
              alt={project.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-purple dark:text-purple-300 shadow-sm border border-content-border dark:border-slate-700">
              {project.beneficiariesCount.toLocaleString()}+ {t('project.direct_beneficiaries', 'Direct Beneficiaries')}
            </div>
          </div>

          {/* Problem Statement & Context */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-4">
            <h3 className="text-lg font-extrabold text-content-primary">
              {t('project.challenge_title', 'The Challenge & Need in Kashmir')}
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              {project.problemStatement}
            </p>
            <div className="pt-2 border-t border-content-border/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-brand-purple dark:text-purple-400 uppercase tracking-wider mb-2">
                {t('project.overview_title', 'Detailed Program Overview')}
              </h4>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                {project.longDescription}
              </p>
            </div>
          </div>

          {/* Objectives & Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-3">
              <h4 className="font-extrabold text-sm text-brand-purple dark:text-purple-400">
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

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-3">
              <h4 className="font-extrabold text-sm text-brand-blue dark:text-sky-400">
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
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-6">
              <h3 className="text-lg font-extrabold text-content-primary">
                {t('project.milestones_title', 'Implementation Milestones & Budget Breakdown')}
              </h3>
              <div className="space-y-4">
                {project.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className="p-4 rounded-2xl bg-surface-soft dark:bg-slate-950 border border-content-border dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-content-primary">{ms.title}</span>
                      <span className="font-mono font-bold text-brand-purple dark:text-purple-300">
                        ${ms.costRequirementUSD.toLocaleString()} USD ({ms.completionPercentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-content-secondary">{ms.description}</p>
                    <div className="w-full h-2 bg-content-border dark:bg-slate-800 rounded-full overflow-hidden">
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
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-6">
              <h3 className="text-lg font-extrabold text-content-primary">
                {t('project.field_updates', 'Field Updates & Progress Reports')}
              </h3>
              <div className="space-y-4">
                {project.updates.map((upd) => (
                  <div key={upd.id} className="p-4 rounded-2xl bg-surface-soft dark:bg-slate-950 border border-content-border dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs text-content-muted">
                      <span className="font-mono">{new Date(upd.date).toLocaleDateString()}</span>
                      <span className="font-semibold text-brand-purple dark:text-purple-400">{upd.authorName}</span>
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
          <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-3xl border border-content-border dark:border-slate-800 p-6 sm:p-8 shadow-brand-md space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-brand-pink uppercase tracking-widest block">
                {t('project.financial_ledger', 'Verified Financial Ledger')}
              </span>
              <div className="text-3xl font-black text-brand-purple dark:text-purple-300">
                {formatUSD(project.amountRaisedUSD)}
              </div>
              <p className="text-xs text-content-muted">
                {t('campaign.raised_toward', 'raised toward')} {formatUSD(project.fundingGoalUSD)} {t('project.budget_goal', 'budget goal')}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-surface-soft dark:bg-slate-800 rounded-full overflow-hidden border border-content-border/60 dark:border-slate-700">
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
            <div className="bg-surface-soft dark:bg-slate-950 p-3 rounded-xl flex items-center justify-between text-xs text-content-secondary">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-purple dark:text-purple-400" /> {t('project.verified_donors', 'Verified Donors')}
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
            <div className="text-[11px] text-content-muted space-y-2 pt-2 border-t border-content-border dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
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
