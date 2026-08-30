import React, { useState } from 'react';
import { NgoMembership, SystemSettings } from '../../types';
import { MembershipCardService } from '../../services/membershipCardService';
import { 
  Download, Printer, RotateCw, Sparkles, Award, ShieldCheck, 
  Crown, CheckCircle, MapPin, Phone, Mail, User, Shield 
} from 'lucide-react';

interface MembershipCardPreviewProps {
  member: NgoMembership;
  settings: SystemSettings;
}

export const MembershipCardPreview: React.FC<MembershipCardPreviewProps> = ({ member, settings }) => {
  const [showBackSide, setShowBackSide] = useState(false);

  const handleDownloadPDF = () => {
    const doc = MembershipCardService.generateMembershipCardPDF(member, settings);
    doc.save(`${member.fullName.replace(/\s+/g, '_')}_ASFJK_NGO_Membership_Card.pdf`);
  };

  const handlePrint = () => {
    const doc = MembershipCardService.generateMembershipCardPDF(member, settings);
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
    };
  };

  // Tier Styling
  let tierGradient = 'from-slate-400 to-slate-200 text-slate-950';
  let tierBorder = 'border-slate-300';
  let tierLabel = 'ASSOCIATE SILVER';

  if (member.tier === 'patron_gold') {
    tierGradient = 'from-amber-400 via-yellow-300 to-amber-500 text-amber-950';
    tierBorder = 'border-amber-400';
    tierLabel = 'PATRON GOLD';
  } else if (member.tier === 'founding_platinum') {
    tierGradient = 'from-purple-300 via-fuchsia-200 to-indigo-300 text-purple-950';
    tierBorder = 'border-purple-300';
    tierLabel = 'FOUNDING PLATINUM';
  } else if (member.tier === 'benefactor_diamond') {
    tierGradient = 'from-cyan-300 via-sky-200 to-teal-300 text-cyan-950';
    tierBorder = 'border-cyan-300';
    tierLabel = 'BENEFACTOR DIAMOND';
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto select-none">
      {/* Lanyard Slot */}
      <div className="flex justify-center -mb-3 relative z-10">
        <div className="w-14 h-3 rounded-full bg-amber-200/80 border-2 border-amber-400/80 shadow-inner flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-amber-600/60" />
        </div>
      </div>

      {/* 3D Card Container */}
      <div className="relative group perspective-1000">
        {!showBackSide ? (
          /* =========================================================
             FRONT OF THE NGO MEMBERSHIP CARD
             ========================================================= */
          <div className="w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl border-2 border-amber-400/50 shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01]">
            {/* Guilloche Security Wave Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="guilloche-mbr" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M0 20 Q 10 0, 20 20 T 40 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#guilloche-mbr)" />
              </svg>
            </div>

            {/* Rainbow Hologram Foil Security Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-rose-400 via-purple-400 via-cyan-400 to-amber-300 shadow-sm" />

            {/* TOP HEADER: Official Seal & Organization Identity */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950/95 via-indigo-900/95 to-purple-950/95 border-b border-amber-400/30 flex items-center justify-between relative">
              <div className="flex items-center gap-3.5 z-10">
                {/* Golden Emblem Seal */}
                <div className="relative flex-shrink-0">
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-amber-200 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center overflow-hidden">
                      <img 
                        src="/images/logo.png" 
                        alt="Al Shujaiat Foundation Emblem" 
                        className="w-full h-full object-contain filter drop-shadow" 
                      />
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-amber-400/20 rounded-full blur-sm pointer-events-none" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-400/30">
                      OFFICIAL NGO MEMBERSHIP CREDENTIAL
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold tracking-wide uppercase leading-tight text-white drop-shadow-sm">
                    AL SHUJAIAT FOUNDATION
                  </h4>
                  <p className="text-[10px] text-amber-200/90 font-semibold tracking-wider uppercase">
                    Jammu & Kashmir · Registered Trust
                  </p>
                </div>
              </div>

              {/* Tier Badge */}
              <div className="text-right z-10">
                <div className={`inline-flex items-center gap-1 bg-gradient-to-r ${tierGradient} font-black text-[9.5px] px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border ${tierBorder}`}>
                  <Crown className="w-3.5 h-3.5" />
                  <span>{tierLabel}</span>
                </div>
              </div>
            </div>

            {/* CARD BODY: Member Profile & Data */}
            <div className="p-5 grid grid-cols-12 gap-5 items-center relative z-10">
              {/* Left Column: Biometric Chip & Frame */}
              <div className="col-span-4 flex flex-col items-center text-center space-y-2.5">
                {/* Gold Smart Chip Graphic */}
                <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200 shadow-md p-0.5 flex flex-col justify-between">
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                  <div className="grid grid-cols-2 gap-1 h-3">
                    <div className="border border-amber-800/30 rounded-sm" />
                    <div className="border border-amber-800/30 rounded-sm" />
                  </div>
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                </div>

                {/* Member Emblem Frame */}
                <div className="w-24 h-28 rounded-2xl bg-gradient-to-b from-purple-900/60 to-slate-900/80 border-2 border-amber-400/40 p-1 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400/20 to-purple-400/20 border border-amber-400/30 flex items-center justify-center text-amber-200 mb-1">
                    <Award className="w-10 h-10" />
                  </div>
                  <span className="text-[8.5px] font-black text-amber-300 tracking-widest uppercase">
                    HONORARY MEMBER
                  </span>
                  <div className="absolute top-1.5 right-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="w-full bg-gradient-to-r from-teal-950/80 via-emerald-900/80 to-teal-950/80 text-emerald-300 font-extrabold text-[10px] py-1 px-2 rounded-xl border border-emerald-500/30 shadow-inner">
                  VALIDITY: <span className="text-white font-mono">{member.durationYears} {member.durationYears === 1 ? 'YEAR' : 'YEARS'}</span>
                </div>
              </div>

              {/* Right Column: Member Details */}
              <div className="col-span-8 space-y-2.5 text-left">
                <div>
                  <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight flex items-center gap-1.5">
                    <span>{member.fullName}</span>
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 inline" />
                  </h3>
                  <p className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 uppercase tracking-wide">
                    {member.tierName}
                  </p>
                </div>

                {/* Data Rows */}
                <div className="space-y-1.5 text-xs bg-white/5 p-3 rounded-2xl border border-white/10 font-mono backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">MEMBERSHIP NO:</span>
                    <span className="font-extrabold text-amber-300 text-xs tracking-wider">
                      {member.membershipNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">CONTRIBUTION:</span>
                    <span className="text-emerald-400 font-extrabold text-[11px]">
                      {member.currency} {member.paidAmount.toLocaleString()} ({member.durationYears} Yrs)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">LOCATION:</span>
                    <span className="text-white font-sans text-[11px] truncate max-w-[145px] text-right">
                      {member.city}, {member.country}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">VALIDITY PERIOD:</span>
                    <span className="text-white font-bold text-[10.5px]">
                      {member.validFrom} to {member.validThru}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9.5px] text-white/70 font-mono">
                  <span>Txn: <strong className="text-white">{member.transactionId}</strong></span>
                  <span className="text-emerald-400 font-bold uppercase">● ACTIVE & REGISTERED</span>
                </div>
              </div>
            </div>

            {/* Bottom Seal Bar */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-purple-950 px-5 py-2.5 border-t border-amber-400/30 flex items-center justify-between text-[10px] relative z-10">
              <div className="text-white/70 font-mono text-[9px] space-y-0.5">
                <div>NGO-DARPAN: <span className="text-amber-300 font-bold">JK/2018/0190361</span> · 80G · 12A · LEI</div>
                <div className="text-[8px] text-white/50">Statutory Accredited NGO Member · Al Shujaiat Foundation</div>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/40 px-2.5 py-1 rounded-xl">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 block leading-none">
                    MOHD AMIN GANAI
                  </span>
                  <span className="text-[7.5px] text-amber-200/70 block uppercase leading-none mt-0.5">
                    DIRECTOR GENERAL
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             BACK OF THE NGO MEMBERSHIP CARD
             ========================================================= */
          <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border-2 border-amber-400/40 shadow-2xl p-5 space-y-3 relative overflow-hidden transition-all duration-500">
            <div className="h-7 w-full -mx-5 bg-slate-950 border-y border-amber-400/20 flex items-center px-5">
              <div className="w-full h-1 bg-amber-400/20" />
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-400 p-0.5 flex items-center justify-center">
                  <img src="/images/logo.png" alt="ASFJK Logo" className="w-full h-full object-contain bg-white rounded-full p-0.5" />
                </div>
                <span className="font-black text-xs uppercase tracking-wider text-amber-300">
                  STATUTORY ACCREDITATIONS & CHARTER
                </span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                MEMBER CHARTER
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 text-[9.5px] font-mono">
              <div>NGO-DARPAN: <span className="text-amber-300 font-bold">{settings.registrationNumber}</span></div>
              <div>80G Tax Exemption: <span className="text-amber-300 font-bold">{settings.taxExemptionNumber80G}</span></div>
              <div>12A Registration: <span className="text-amber-300 font-bold">{settings.taxExemptionNumber12A || 'DEL-AR26932-27022018/8830'}</span></div>
              <div>FCRA Number: <span className="text-amber-300 font-bold">{settings.fcraRegistrationNumber}</span></div>
              <div className="col-span-2">Legal Entity ID (LEI): <span className="text-amber-300 font-bold">{settings.leiNumber || '9845008779YC3EE0IE41'}</span></div>
            </div>

            <div className="space-y-1 text-[9.5px] text-white/80 bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p><span className="font-bold text-amber-200">Registered Office:</span> {settings.registeredAddress}</p>
              <p><span className="font-bold text-amber-200">Operating / Field Office:</span> {settings.operatingAddress}</p>
              <p><span className="font-bold text-amber-200">Helplines & Email:</span> {settings.phone} / {settings.emergencyPhone} · {settings.email}</p>
            </div>

            <div className="bg-amber-950/40 border border-amber-400/30 p-2.5 rounded-xl text-[8.5px] text-amber-100/90 leading-relaxed text-center">
              This card certifies accredited NGO membership of Al Shujaiat Foundation J&K. Member is entitled to annual audited transparency reviews, voting participation in stakeholder surveys, and special delegation briefings.
            </div>
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowBackSide(!showBackSide)}
          className="btn-outline !py-2.5 !px-4 text-xs font-bold flex items-center gap-1.5 text-brand-purple hover:bg-brand-purple/10"
        >
          <RotateCw className="w-4 h-4 text-brand-pink" />
          <span>Flip Card ({showBackSide ? 'Front Side' : 'Back Side / Charter'})</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-outline !py-2.5 !px-4 text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Badge</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5 shadow-pink-glow"
          >
            <Download className="w-4 h-4" />
            <span>Download Membership Card (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
