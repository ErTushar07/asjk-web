import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useToast } from '../../contexts/ToastContext';
import { ShieldCheck, FileText, Download, CheckCircle2, Lock } from 'lucide-react';

export const TransparencyPage: React.FC<{ onNavigate: (route: string) => void }> = () => {
  const { t } = useLanguage();
  const { settings } = useDatabase();
  const toast = useToast();

  const auditReports = [
    { year: 'FY 2024-25', title: 'Independent Auditor’s Report & Balance Sheet', auditor: 'Carter & Associates, Chartered Accountants', size: '2.4 MB PDF' },
    { year: 'FY 2023-24', title: 'Annual Financial Statements & Statutory Tax Filing', auditor: 'Carter & Associates, Chartered Accountants', size: '1.8 MB PDF' },
    { year: 'FY 2022-23', title: 'Audited Program Expenditure and FCRA Return', auditor: 'Global Audit Compliance LLP', size: '2.1 MB PDF' },
  ];

  const handleDownloadReport = (year: string) => {
    toast.info(
      `Audit report for ${year} will be available for download soon. Contact us at ${settings.email || 'info@asfjk.org'} for early access.`,
      'Report Requested'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('transparency.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('transparency.title', 'Financial Transparency & Governance')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t('transparency.subtitle', 'We operate with 100% radical transparency. We publish certified annual accounts, program expenditures, and statutory filings for public inspection.')}
        </p>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-8">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-8 rounded-xl sm:rounded-3xl border border-content-border dark:border-slate-800 space-y-1.5 sm:space-y-3 shadow-brand-sm text-center min-w-0">
          <div className="text-xl sm:text-4xl font-black text-brand-purple">88.5%</div>
          <h4 className="font-extrabold text-[10px] sm:text-base text-content-primary">{t('home.direct_aid', 'Direct Program Aid')}</h4>
          <p className="text-[9px] sm:text-xs text-content-secondary leading-relaxed line-clamp-3">
            {t('home.clean_water_edu', 'Clean Water, Education & Relief')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-8 rounded-xl sm:rounded-3xl border border-content-border dark:border-slate-800 space-y-1.5 sm:space-y-3 shadow-brand-sm text-center min-w-0">
          <div className="text-xl sm:text-4xl font-black text-brand-pink">7.2%</div>
          <h4 className="font-extrabold text-[10px] sm:text-base text-content-primary">{t('home.monitoring_logistics', 'Logistics')}</h4>
          <p className="text-[9px] sm:text-xs text-content-secondary leading-relaxed line-clamp-3">
            {t('transparency.logistics_desc', 'Engineering supervision, water testing kits, 4x4 relief convoys in mountain sectors.')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-8 rounded-xl sm:rounded-3xl border border-content-border dark:border-slate-800 space-y-1.5 sm:space-y-3 shadow-brand-sm text-center min-w-0">
          <div className="text-xl sm:text-4xl font-black text-brand-blue">4.3%</div>
          <h4 className="font-extrabold text-[10px] sm:text-base text-content-primary">{t('home.auditing_gov', 'Audits & Governance')}</h4>
          <p className="text-[9px] sm:text-xs text-content-secondary leading-relaxed line-clamp-3">
            {t('transparency.audits_desc', 'Independent CA audits, statutory compliance, payment security, and cloud tech.')}
          </p>
        </div>
      </div>

      {/* Statutory Registrations */}
      <div className="bg-surface-soft dark:bg-slate-950 p-8 sm:p-10 rounded-3xl border border-content-border dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-brand-purple flex-shrink-0" />
          <div>
            <h3 className="text-xl font-extrabold text-content-primary">
              {t('transparency.statutory_title', 'Official Statutory Registrations & Exemptions')}
            </h3>
            <p className="text-xs text-content-secondary">
              {t('transparency.statutory_subtitle', 'Al Shujaiat Foundation Jammu & Kashmir is fully accredited under Indian non-profit laws.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-content-border dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">NITI Aayog NGO-DARPAN</span>
            <span className="font-bold text-brand-purple font-mono text-sm">{settings.darpanUniqueId || settings.registrationNumber}</span>
            <span className="text-[11px] text-content-secondary block">Govt of India DARPAN</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-content-border dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">Legal Entity ID (LEI)</span>
            <span className="font-bold text-brand-orange font-mono text-xs break-all">{settings.leiNumber || '9845008779YC3EE0IE41'}</span>
            <span className="text-[11px] text-content-secondary block">Global Legal Identifier</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-content-border dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">Section 80G Tax</span>
            <span className="font-bold text-brand-pink font-mono text-sm">{settings.taxExemptionNumber80G}</span>
            <span className="text-[11px] text-content-secondary block">50% Tax Deduction</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-content-border dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">FCRA Compliance</span>
            <span className="font-bold text-brand-blue font-mono text-sm">{settings.fcraRegistrationNumber}</span>
            <span className="text-[11px] text-content-secondary block">Foreign Contributions</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-content-border dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">Section 12A Status</span>
            <span className="font-bold text-emerald-600 font-mono text-xs break-all">{settings.taxExemptionNumber12A || 'DEL-AR26932-27022018/8830'}</span>
            <span className="text-[11px] text-content-secondary block">Income Tax Exemption</span>
          </div>
        </div>
      </div>

      {/* Downloadable Audited Statements */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-6">
        <h3 className="text-xl font-extrabold text-content-primary">
          {t('transparency.audited_reports', 'Annual Audited Statements & Financial Returns')}
        </h3>

        <div className="divide-y divide-content-border dark:divide-slate-800">
          {auditReports.map((rep, idx) => (
            <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-brand-purple flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-content-primary">{rep.title} ({rep.year})</h4>
                  <p className="text-xs text-content-secondary">Audited by: {rep.auditor} · {rep.size}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadReport(rep.year)}
                className="btn-outline !py-1.5 !px-3 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('transparency.download_report', 'Download Report')}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Presidential Attestation with Authentic Seal & Signature */}
        <div className="mt-8 pt-6 border-t border-content-border dark:border-slate-800 bg-surface-soft dark:bg-slate-950 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-left flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink block">
              STATUTORY ATTESTATION & AUDIT VERIFICATION
            </span>
            <h4 className="text-sm font-extrabold text-content-primary">
              Executive Attestation of Financial Integrity
            </h4>
            <p className="text-xs text-content-secondary leading-relaxed max-w-xl">
              "We confirm that all audited accounts and statutory tax filings published above represent true, certified statements of our Jammu & Kashmir relief operations."
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-brand-purple">Mohd Amin Ganai</p>
              <p className="text-[11px] text-content-muted">Founder & President · Al Shujaiat Foundation</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Real Signature */}
            <div className="text-center">
              <img 
                src="/images/signature.png" 
                alt="President Signature" 
                className="h-12 w-auto object-contain dark:invert mix-blend-multiply dark:mix-blend-normal opacity-95"
              />
              <span className="text-[9px] font-mono text-content-muted block">Authorized Signature</span>
            </div>

            {/* Real Seal */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <img 
                src="/images/seal.png" 
                alt="Official Seal" 
                className="w-full h-full object-contain dark:invert mix-blend-multiply dark:mix-blend-normal opacity-95 rotate-[-6deg] drop-shadow-sm hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
