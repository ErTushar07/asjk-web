import React, { useState } from 'react';
import { VolunteerApplication, SystemSettings } from '../../types';
import { VolunteerIdCardService } from '../../services/volunteerIdCardService';
import { 
  Download, Printer, ShieldCheck, CheckCircle2, QrCode, 
  MapPin, Phone, Mail, Award, RotateCw, User, Sparkles,
  CheckCircle, Globe, Shield
} from 'lucide-react';

interface VolunteerIdCardPreviewProps {
  volunteer: VolunteerApplication;
  settings: SystemSettings;
}

export const VolunteerIdCardPreview: React.FC<VolunteerIdCardPreviewProps> = ({ volunteer, settings }) => {
  const [showBackSide, setShowBackSide] = useState(false);

  const handleDownloadPDF = () => {
    const doc = VolunteerIdCardService.generateIdCardPDF(volunteer, settings);
    doc.save(`${volunteer.fullName.replace(/\s+/g, '_')}_ASFJK_Volunteer_ID_Card.pdf`);
  };

  const handlePrint = () => {
    const doc = VolunteerIdCardService.generateIdCardPDF(volunteer, settings);
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

  return (
    <div className="space-y-6 max-w-xl mx-auto select-none">
      {/* Top Lanyard Slot Graphic */}
      <div className="flex justify-center -mb-3 relative z-10">
        <div className="w-14 h-3 rounded-full bg-slate-300 border-2 border-slate-400/80 shadow-inner flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-slate-500/60" />
        </div>
      </div>

      {/* Interactive ID Card Container with 3D Effect */}
      <div className="relative group perspective-1000">
        {!showBackSide ? (
          /* =========================================================
             FRONT OF THE IDENTITY CARD (LUXURY HERALDIC BADGE)
             ========================================================= */
          <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border-2 border-amber-400/40 shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01]">
            {/* Guilloche Security Wave Background (SVG) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M0 20 Q 10 0, 20 20 T 40 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#guilloche)" />
              </svg>
            </div>

            {/* Rainbow Hologram Foil Security Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-rose-400 via-purple-400 via-emerald-400 to-amber-300 animate-gradient-x shadow-sm" />

            {/* TOP HEADER: Official Seal & Organization Identity */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950/90 via-indigo-900/90 to-purple-950/90 border-b border-amber-400/30 flex items-center justify-between relative">
              <div className="flex items-center gap-3.5 z-10">
                {/* Prestige Golden Emblem Seal */}
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
                  {/* Subtle golden crest glow */}
                  <div className="absolute -inset-1 bg-amber-400/20 rounded-full blur-sm pointer-events-none" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-400/30">
                      ASFJK OFFICIAL CREDENTIAL
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold tracking-wide uppercase leading-tight text-white drop-shadow-sm">
                    AL SHUJAIAT FOUNDATION
                  </h4>
                  <p className="text-[10px] text-amber-200/90 font-semibold tracking-wider uppercase">
                    Jammu & Kashmir · Humanitarian Services
                  </p>
                </div>
              </div>

              {/* Holographic Verification Badge */}
              <div className="text-right z-10">
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-600 to-brand-pink text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
                  <Sparkles className="w-3 h-3 text-amber-200 animate-pulse" />
                  <span>VOLUNTEER</span>
                </div>
              </div>
            </div>

            {/* CARD BODY: Volunteer Profile & Identity Fields */}
            <div className="p-5 grid grid-cols-12 gap-5 items-center relative z-10">
              {/* Left Column: Smart Chip, Photo Frame & Blood Group */}
              <div className="col-span-4 flex flex-col items-center text-center space-y-2.5">
                {/* Gold Smart Biometric Chip Graphic */}
                <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200 shadow-md p-0.5 flex flex-col justify-between">
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                  <div className="grid grid-cols-2 gap-1 h-3">
                    <div className="border border-amber-800/30 rounded-sm" />
                    <div className="border border-amber-800/30 rounded-sm" />
                  </div>
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                </div>

                {/* Luxury Photo Frame */}
                <div className="w-24 h-28 rounded-2xl bg-gradient-to-b from-purple-900/60 to-slate-900/80 border-2 border-amber-400/40 p-1 flex flex-col items-center justify-center shadow-xl relative overflow-hidden group-hover:border-amber-300 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400/20 to-purple-400/20 border border-amber-400/30 flex items-center justify-center text-amber-200 mb-1">
                    <User className="w-10 h-10" />
                  </div>
                  <span className="text-[8.5px] font-black text-amber-300 tracking-widest uppercase">
                    ACTIVE VOLUNTEER
                  </span>
                  <div className="absolute top-1.5 right-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow" />
                  </div>
                </div>

                {/* Blood Group Badge */}
                <div className="w-full bg-gradient-to-r from-rose-950/80 via-rose-900/80 to-rose-950/80 text-rose-300 font-extrabold text-[10px] py-1 px-2 rounded-xl border border-rose-500/30 shadow-inner">
                  BLOOD GROUP: <span className="text-white font-mono">{volunteer.bloodGroup || 'O+'}</span>
                </div>
              </div>

              {/* Right Column: Candidate Personal & Operational Credentials */}
              <div className="col-span-8 space-y-2.5 text-left">
                {/* Candidate Name & Designation */}
                <div>
                  <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight flex items-center gap-1.5">
                    <span>{volunteer.fullName}</span>
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 inline" />
                  </h3>
                  <p className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 uppercase tracking-wide">
                    {volunteer.roleDesignation || 'HUMANITARIAN FIELD SPECIALIST'}
                  </p>
                </div>

                {/* Credential Data Rows */}
                <div className="space-y-1.5 text-xs bg-white/5 p-3 rounded-2xl border border-white/10 font-mono backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">VOLUNTEER ID:</span>
                    <span className="font-extrabold text-amber-300 text-xs tracking-wider">
                      {volunteer.membershipNumber || `ASF-VOL-2026-${volunteer.id.slice(-4)}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">QUALIFICATION:</span>
                    <span className="text-white truncate max-w-[145px] text-right font-sans font-semibold text-[11px]">
                      {volunteer.qualification || "Bachelor's Degree"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">LOCATION:</span>
                    <span className="text-white font-sans text-[11px] truncate max-w-[145px] text-right">
                      {volunteer.city}, {volunteer.country}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-[10px] font-sans uppercase font-bold">VALIDITY:</span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {volunteer.validThru || '2027-08-31'}
                    </span>
                  </div>
                </div>

                {/* Specialization Tags */}
                <div className="flex flex-wrap gap-1">
                  {volunteer.skills?.slice(0, 2).map((sk, idx) => (
                    <span key={idx} className="text-[9px] bg-amber-400/10 text-amber-200 border border-amber-400/20 font-bold px-2 py-0.5 rounded-md">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Security Hologram & Digital Signature Seal */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-purple-950 px-5 py-2.5 border-t border-amber-400/30 flex items-center justify-between text-[10px] relative z-10">
              <div className="text-white/70 font-mono text-[9px] space-y-0.5">
                <div>NGO-DARPAN: <span className="text-amber-300 font-bold">JK/2018/0190361</span> · 80G · 12A · LEI</div>
                <div className="text-[8px] text-white/50">Official Trust Credential · Al Shujaiat Foundation</div>
              </div>

              {/* Digital Authorized Stamp */}
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
             BACK OF THE IDENTITY CARD (LEGAL, DISCLOSURES & EMERGENCY)
             ========================================================= */
          <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border-2 border-amber-400/40 shadow-2xl p-5 space-y-3 relative overflow-hidden transition-all duration-500">
            {/* Magnetic Stripe Simulation */}
            <div className="h-7 w-full -mx-5 bg-slate-950 border-y border-amber-400/20 flex items-center px-5">
              <div className="w-full h-1 bg-amber-400/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-400 p-0.5 flex items-center justify-center">
                  <img src="/images/logo.png" alt="ASFJK Logo" className="w-full h-full object-contain bg-white rounded-full p-0.5" />
                </div>
                <span className="font-black text-xs uppercase tracking-wider text-amber-300">
                  STATUTORY DISCLOSURES & EMERGENCY DESK
                </span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                LEGAL PROOF
              </span>
            </div>

            {/* Statutory Registrations Grid */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 text-[9.5px] font-mono">
              <div>NGO-DARPAN: <span className="text-amber-300 font-bold">{settings.registrationNumber}</span></div>
              <div>80G Tax Exemption: <span className="text-amber-300 font-bold">{settings.taxExemptionNumber80G}</span></div>
              <div>12A Registration: <span className="text-amber-300 font-bold">{settings.taxExemptionNumber12A || 'DEL-AR26932-27022018/8830'}</span></div>
              <div>FCRA Number: <span className="text-amber-300 font-bold">{settings.fcraRegistrationNumber}</span></div>
              <div className="col-span-2">Legal Entity ID (LEI): <span className="text-amber-300 font-bold">{settings.leiNumber || '9845008779YC3EE0IE41'}</span></div>
            </div>

            {/* Office Locations */}
            <div className="space-y-1 text-[9.5px] text-white/80 bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p><span className="font-bold text-amber-200">Registered Office:</span> {settings.registeredAddress}</p>
              <p><span className="font-bold text-amber-200">Operating / Field Office:</span> {settings.operatingAddress}</p>
              <p><span className="font-bold text-amber-200">Helplines & WhatsApp:</span> {settings.phone} / {settings.emergencyPhone} · {settings.email}</p>
            </div>

            {/* Authorization Disclaimer */}
            <div className="bg-amber-950/40 border border-amber-400/30 p-2.5 rounded-xl text-[8.5px] text-amber-100/90 leading-relaxed text-center">
              This card certifies that the bearer is a registered, vetted humanitarian volunteer of Al Shujaiat Foundation Jammu & Kashmir. Authorized for disaster relief operations, medical distribution, clean water construction, and winter support packages.
            </div>
          </div>
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowBackSide(!showBackSide)}
          className="btn-outline !py-2.5 !px-4 text-xs font-bold flex items-center gap-1.5 text-brand-purple hover:bg-brand-purple/10"
        >
          <RotateCw className="w-4 h-4 text-brand-pink" />
          <span>Flip Card ({showBackSide ? 'Front Side' : 'Back Side / Legal Details'})</span>
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
            <span>Download Identity Card (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
