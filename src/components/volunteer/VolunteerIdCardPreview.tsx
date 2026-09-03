import React, { useState } from 'react';
import { VolunteerApplication, SystemSettings } from '../../types';
import { VolunteerIdCardService } from '../../services/volunteerIdCardService';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Download, Printer, RotateCw, User, 
  Calendar, Shield, Award, MapPin, Globe, Mail, Heart 
} from 'lucide-react';

interface VolunteerIdCardPreviewProps {
  volunteer: VolunteerApplication;
  settings: SystemSettings;
}

export const VolunteerIdCardPreview: React.FC<VolunteerIdCardPreviewProps> = ({ volunteer, settings }) => {
  const { t } = useLanguage();
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

  // Primary Brand Color matching the Logo Font & Emblem: Deep Royal Navy/Purple (#1E1B4B / #2E1065)
  const themeBg = '#1E1B4B'; // Logo Signature Brand Color

  // Fallback photo
  const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const photoSrc = volunteer.photoUrl || defaultPhoto;

  return (
    <div className="space-y-6 max-w-sm mx-auto select-none">
      {/* 3D Vertical Card Container */}
      <div className="relative group perspective-1000">
        {!showBackSide ? (
          /* =========================================================
             FRONT SIDE (SEAMLESSLY BLENDED LOGO & LOGO FONT COLOR)
             ========================================================= */
          <div className="w-full bg-white text-slate-800 rounded-[2.5rem] border-2 border-indigo-900/20 shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01] flex flex-col justify-between min-h-[600px]">
            
            {/* Top Lanyard Slot */}
            <div className="flex justify-center pt-3.5 z-20">
              <div className="w-16 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center">
                <div className="w-10 h-1.5 rounded-full bg-slate-400/80" />
              </div>
            </div>

            {/* Top-Left Corner Accent: Confined to corner so it NEVER overlaps the center logo */}
            <div 
              style={{ backgroundColor: themeBg }}
              className="absolute top-0 left-0 w-24 h-24 rounded-br-[3rem] overflow-hidden pointer-events-none z-0 shadow-sm"
            >
              {/* Gold Divider Line */}
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            </div>

            {/* Header Content */}
            <div className="text-center pt-2 px-6 space-y-1 z-10">
              {/* Center Emblem Logo: Seamless Transparent Blending with Card Background */}
              <div className="w-24 h-24 mx-auto flex items-center justify-center bg-transparent">
                <img 
                  src="/images/logo.png" 
                  alt="Al Shujaiat Foundation Emblem" 
                  className="w-full h-full object-contain mix-blend-multiply" 
                />
              </div>

              {/* Foundation Brand Header */}
              <h2 style={{ color: themeBg }} className="text-2xl font-black tracking-tight leading-none">
                ASFJK
              </h2>
              <p style={{ color: themeBg }} className="text-[8.5px] font-extrabold uppercase tracking-wider leading-tight">
                AL SHUJAIAT FOUNDATION
              </p>
              <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                JAMMU & KASHMIR
              </p>
              <p className="text-[9px] text-amber-700 font-bold font-serif pt-0.5 leading-none">
                خدمتِ انسانیت، ہماری پہچان
              </p>

              {/* Title Section */}
              <div className="pt-2">
                <h3 style={{ color: themeBg }} className="text-lg font-black tracking-wider uppercase leading-none">
                  VOLUNTEER
                </h3>
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <div className="w-7 h-[1.5px] bg-amber-500" />
                  <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-amber-600">
                    IDENTITY CARD
                  </span>
                  <div className="w-7 h-[1.5px] bg-amber-500" />
                </div>
              </div>
            </div>

            {/* Center Area: Circular Framed Portrait Photo */}
            <div className="relative py-2 flex justify-center items-center z-10">
              <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-100 flex items-center justify-center">
                  <img 
                    src={photoSrc} 
                    alt={volunteer.fullName} 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Section: Royal Brand Navy Wave with Name, Role, ID & QR */}
            <div 
              style={{ backgroundColor: themeBg }}
              className="text-white pt-4 pb-0 rounded-t-[2.5rem] rounded-b-[2.2rem] relative z-10 shadow-lg border-t-2 border-amber-400/40"
            >
              {/* Candidate Info */}
              <div className="text-center px-4 space-y-0.5">
                <h4 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                  {volunteer.fullName}
                </h4>
                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">
                  {volunteer.roleDesignation || 'Community Outreach Volunteer'}
                </p>
                <p className="text-xs font-black tracking-widest text-amber-300 font-mono pt-1">
                  VOL ID : {volunteer.membershipNumber || `ASFJK${new Date().getFullYear().toString().slice(-2)}V${volunteer.id.slice(-3)}`}
                </p>
              </div>

              {/* Bottom Split Bar: QR Code (Left) & Gold Slogan Box (Right) */}
              <div className="mt-3.5 flex items-stretch border-t border-white/10 bg-black/20 rounded-b-[2.2rem] overflow-hidden">
                {/* Left QR Code Box */}
                <div className="bg-white p-2 flex items-center justify-center border-r border-amber-400/30">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.asfjk.org/verify/vol/${volunteer.membershipNumber || volunteer.id}`} 
                      alt="QR Verification" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Right Slogan Box (Warm Gold) */}
                <div className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 p-2 flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6 text-slate-950 fill-slate-950/20 flex-shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[9.5px] font-black uppercase tracking-wider block text-slate-950">
                      TOGETHER
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-wide block text-slate-900">
                      WE MAKE A DIFFERENCE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             BACK SIDE
             ========================================================= */
          <div className="w-full bg-white text-slate-800 rounded-[2.5rem] border-2 border-indigo-900/20 shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01] flex flex-col justify-between min-h-[600px]">
            
            {/* Top Lanyard Slot */}
            <div className="flex justify-center pt-3.5 z-20">
              <div className="w-16 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center">
                <div className="w-10 h-1.5 rounded-full bg-slate-400/80" />
              </div>
            </div>

            {/* Top-Left Corner Accent */}
            <div 
              style={{ backgroundColor: themeBg }}
              className="absolute top-0 left-0 w-20 h-20 rounded-br-[2.5rem] overflow-hidden pointer-events-none z-0"
            >
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            </div>

            {/* Header Content */}
            <div className="text-center pt-2 px-6 space-y-1 z-10">
              <div className="w-20 h-20 mx-auto flex items-center justify-center bg-transparent">
                <img src="/images/logo.png" alt="ASFJK Logo" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <h3 style={{ color: themeBg }} className="text-lg font-black leading-none">ASFJK</h3>
              <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">
                AL SHUJAIAT FOUNDATION · JAMMU & KASHMIR
              </p>

              {/* Divider Header */}
              <div className="flex items-center justify-center gap-2 pt-1.5">
                <div className="w-10 h-[1.5px] bg-amber-500" />
                <span style={{ color: themeBg }} className="text-xs font-black uppercase tracking-widest">
                  VOLUNTEER
                </span>
                <div className="w-10 h-[1.5px] bg-amber-500" />
              </div>
            </div>

            {/* Body Information */}
            <div className="px-6 py-2 space-y-3 z-10 text-left">
              {/* Disclaimer Statement */}
              <div className="text-center space-y-1 border-b border-slate-100 pb-2">
                <p className="text-[9.5px] text-slate-700 leading-snug font-medium">
                  This card identifies the bearer as an authorized volunteer of Al Shujaiat Foundation (ASFJK).
                </p>
                <p className="text-[9px] text-slate-500 font-medium">
                  This card is valid for the period shown below.
                </p>
              </div>

              {/* Data Field List with Hexagonal/Circular Icons */}
              <div className="space-y-2 text-xs">
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: themeBg }}
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-sm"
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                      NAME
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      {volunteer.fullName}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: themeBg }}
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-sm"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                      ROLE
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      {volunteer.roleDesignation || 'Community Outreach Volunteer'}
                    </span>
                  </div>
                </div>

                {/* Valid Dates (Side-by-Side) */}
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: themeBg }}
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                        VALID FROM
                      </span>
                      <span className="font-bold text-slate-800 text-[11px] font-mono">
                        {volunteer.validFrom || '01 May 2025'}
                      </span>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-200" />
                    <div>
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                        VALID TILL
                      </span>
                      <span className="font-bold text-slate-800 text-[11px] font-mono">
                        {volunteer.validThru || '30 Apr 2026'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: themeBg }}
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-sm"
                  >
                    <Shield className="w-4 h-4 text-rose-300" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                      EMERGENCY CONTACT · BLOOD: {volunteer.bloodGroup || 'O+'}
                    </span>
                    <span className="font-bold text-slate-800 text-xs font-mono">
                      {volunteer.phone || settings.phone || '+91 94193 01319'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatory & Official Rubber Stamp Section */}
              <div className="pt-2 border-t border-amber-400/40 flex items-center justify-between relative">
                {/* Left Handwritten Signature (Centered over Mohd Amin Ganai) */}
                <div className="flex flex-col items-center text-center">
                  <img 
                    src="/images/signature.png" 
                    alt="Mohd Amin Ganai Signature" 
                    className="h-9 w-auto object-contain mix-blend-multiply opacity-95 -mb-1"
                  />
                  <div>
                    <p style={{ color: themeBg }} className="text-[10px] font-black uppercase tracking-tight leading-none pt-0.5 whitespace-nowrap">
                      Mohd Amin Ganai
                    </p>
                    <p className="text-[8px] font-semibold text-slate-500 leading-none pt-0.5 whitespace-nowrap">
                      Founder & President
                    </p>
                  </div>
                </div>

                {/* Right Official Seal Stamp */}
                <div className="w-14 h-14 flex items-center justify-center relative">
                  <img 
                    src="/images/seal.png" 
                    alt="Al Shujaiat Foundation Official Seal" 
                    className="w-full h-full object-contain mix-blend-multiply opacity-95 rotate-[-6deg] drop-shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Bottom Footer Bar */}
            <div 
              style={{ backgroundColor: themeBg }}
              className="text-white px-5 py-2.5 rounded-b-[2.2rem] flex items-center justify-between text-[8px] z-10"
            >
              <div className="space-y-0.5 text-left">
                <p className="flex items-center gap-1 text-white/90">
                  <MapPin className="w-2.5 h-2.5 text-amber-300" /> {settings.operatingAddress || 'Luragam Tral Pulwama, Jammu & Kashmir'}
                </p>
                <p className="flex items-center gap-1 text-white/80">
                  <Globe className="w-2.5 h-2.5 text-amber-300" /> www.asfjk.org
                </p>
                <p className="flex items-center gap-1 text-white/80">
                  <Mail className="w-2.5 h-2.5 text-amber-300" /> info@asfjk.org
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <div className="flex items-center justify-end gap-1.5 text-amber-300">
                  <Globe className="w-3 h-3" />
                  <span className="font-bold text-[9px]">/asfjkfoundation</span>
                </div>
                <p className="text-[7.5px] text-white/60 font-mono">
                  NGO-DARPAN: JK/2018/0190361 · 80G
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Actions Bar (Responsive Grid for Mobile & Desktop) */}
      {volunteer.status === 'approved' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowBackSide(!showBackSide)}
            className="btn-outline !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 w-full"
          >
            <RotateCw className="w-4 h-4 text-amber-600" />
            <span>{t('membership.flip', 'Flip')} ({showBackSide ? t('membership.front', 'Front') : t('membership.back', 'Back')})</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-outline !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5 w-full"
          >
            <Printer className="w-4 h-4" />
            <span>{t('volunteer.print_badge', 'Print Badge')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            style={{ backgroundColor: themeBg }}
            className="btn-primary !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-pink-glow border-none text-white w-full sm:col-span-1"
          >
            <Download className="w-4 h-4" />
            <span>{t('volunteer.download_pdf', 'Download PDF')}</span>
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-1.5">
          <p className="text-xs font-bold text-amber-900 uppercase flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-600" /> {t('volunteer.badge_locked_title', 'ID Card Locked — Awaiting Administrative Approval')}
          </p>
          <p className="text-[11px] text-amber-700">
            {t('volunteer.badge_locked_desc', 'PDF download and badge printing are disabled until an authorized administrator verifies your application.')}
          </p>
        </div>
      )}
    </div>
  );
};
