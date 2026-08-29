import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { ShieldCheck, FileText, Download, CheckCircle2, Lock } from 'lucide-react';

export const TransparencyPage: React.FC<{ onNavigate: (route: string) => void }> = () => {
  const { t } = useLanguage();
  const { settings } = useDatabase();

  const auditReports = [
    { year: 'FY 2024-25', title: 'Independent Auditor’s Report & Balance Sheet', auditor: 'Carter & Associates, Chartered Accountants', size: '2.4 MB PDF' },
    { year: 'FY 2023-24', title: 'Annual Financial Statements & Statutory Tax Filing', auditor: 'Carter & Associates, Chartered Accountants', size: '1.8 MB PDF' },
    { year: 'FY 2022-23', title: 'Audited Program Expenditure and FCRA Return', auditor: 'Global Audit Compliance LLP', size: '2.1 MB PDF' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Al Shujaiat Foundation · Jammu & Kashmir
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Financial Transparency & Governance
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          We operate with 100% radical transparency. We publish certified annual accounts, program expenditures, and statutory filings for public inspection.
        </p>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-content-border space-y-3 shadow-brand-sm text-center">
          <div className="text-4xl font-black text-brand-purple">88.5%</div>
          <h4 className="font-extrabold text-base text-content-primary">Direct Humanitarian Aid</h4>
          <p className="text-xs text-content-secondary leading-relaxed">
            Allocated directly to clean water filtration, school modernizations, child sponsorship, medical camps, and winter relief kits.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-content-border space-y-3 shadow-brand-sm text-center">
          <div className="text-4xl font-black text-brand-pink">7.2%</div>
          <h4 className="font-extrabold text-base text-content-primary">Field Operations & Logistics</h4>
          <p className="text-xs text-content-secondary leading-relaxed">
            Engineering supervision, water testing kits, 4x4 relief convoy transport across mountain snow blockades.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-content-border space-y-3 shadow-brand-sm text-center">
          <div className="text-4xl font-black text-brand-blue">4.3%</div>
          <h4 className="font-extrabold text-base text-content-primary">Auditing & Administration</h4>
          <p className="text-xs text-content-secondary leading-relaxed">
            Independent statutory compliance, digital payment security gateways, tax reporting, and cloud infrastructure.
          </p>
        </div>
      </div>

      {/* Statutory Registrations */}
      <div className="bg-surface-soft p-8 sm:p-10 rounded-3xl border border-content-border space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-brand-purple flex-shrink-0" />
          <div>
            <h3 className="text-xl font-extrabold text-content-primary">
              Official Statutory Registrations & Exemptions
            </h3>
            <p className="text-xs text-content-secondary">
              Al Shujaiat Foundation Jammu & Kashmir is fully accredited under Indian non-profit laws.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-content-border space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">NITI Aayog NGO-DARPAN ID</span>
            <span className="font-bold text-brand-purple font-mono text-sm">{settings.darpanUniqueId || settings.registrationNumber}</span>
            <span className="text-[11px] text-content-secondary block">Govt of India NGO-DARPAN</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-content-border space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">Section 80G Tax Exemption</span>
            <span className="font-bold text-brand-pink font-mono text-sm">{settings.taxExemptionNumber80G}</span>
            <span className="text-[11px] text-content-secondary block">50% Tax Deduction in India</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-content-border space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">FCRA Registration</span>
            <span className="font-bold text-brand-blue font-mono text-sm">{settings.fcraRegistrationNumber}</span>
            <span className="text-[11px] text-content-secondary block">Foreign Contribution Regulation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-content-border space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase block">Section 12A Status</span>
            <span className="font-bold text-emerald-600 font-mono text-sm">Approved (Perpetual)</span>
            <span className="text-[11px] text-content-secondary block">Income Tax Exemption</span>
          </div>
        </div>
      </div>

      {/* Downloadable Audited Statements */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
        <h3 className="text-xl font-extrabold text-content-primary">
          Annual Audited Statements & Financial Returns
        </h3>

        <div className="divide-y divide-content-border">
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
                onClick={() => alert(`Downloading ${rep.title} (${rep.year}) certified document...`)}
                className="btn-outline !py-1.5 !px-3 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
