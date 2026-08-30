import React, { useState } from 'react';
import { NgoMembership, SystemSettings } from '../../types';
import { MembershipCardService } from '../../services/membershipCardService';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Download, Printer, RotateCw, User, 
  Calendar, Shield, Award, MapPin, Globe, Mail, Crown 
} from 'lucide-react';

interface MembershipCardPreviewProps {
  member: NgoMembership;
  settings: SystemSettings;
}

export const MembershipCardPreview: React.FC<MembershipCardPreviewProps> = ({ member, settings }) => {
  const { t } = useLanguage();
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

  // Tier Theme Styling (Palette, Gradient, and Accents matching Logo aesthetics)
  let themeBg = '#1E1B4B'; // Deep Royal Navy/Purple (Logo Brand Font)
  let themeBorder = 'border-indigo-900/20';
  let tierLabel = 'GENERAL MEMBER';
  let tierSubColor = 'text-emerald-200';
  let tierGold = 'text-amber-300';
  let bannerColor = 'from-amber-600 to-amber-500 text-slate-950';

  if (member.tier === 'general_member') {
    themeBg = '#064E3B'; // Deep Forest Emerald
    themeBorder = 'border-emerald-800/20';
    tierLabel = 'GENERAL MEMBER';
    tierSubColor = 'text-emerald-200';
    tierGold = 'text-amber-300';
    bannerColor = 'from-emerald-600 to-teal-500 text-white';
  } else if (member.tier === 'associate_silver') {
    themeBg = '#1E293B'; // Slate Steel Charcoal
    themeBorder = 'border-slate-700/30';
    tierLabel = 'ASSOCIATE SILVER MEMBER';
    tierSubColor = 'text-slate-300';
    tierGold = 'text-slate-200';
    bannerColor = 'from-slate-300 via-slate-200 to-slate-400 text-slate-900';
  } else if (member.tier === 'patron_gold') {
    themeBg = '#78350F'; // Royal Amber & Gold
    themeBorder = 'border-amber-700/30';
    tierLabel = 'PATRON GOLD MEMBER';
    tierSubColor = 'text-amber-200';
    tierGold = 'text-amber-300';
    bannerColor = 'from-amber-500 to-yellow-400 text-amber-950';
  } else if (member.tier === 'founding_platinum') {
    themeBg = '#3B0764'; // Royal Velvet Purple (Logo Brand Tone)
    themeBorder = 'border-purple-800/30';
    tierLabel = 'FOUNDING PLATINUM PATRON';
    tierSubColor = 'text-purple-200';
    tierGold = 'text-fuchsia-300';
    bannerColor = 'from-purple-400 to-fuchsia-300 text-purple-950';
  } else if (member.tier === 'benefactor_diamond') {
    themeBg = '#083344'; // Deep Sapphire & Cyan
    themeBorder = 'border-cyan-800/30';
    tierLabel = 'BENEFACTOR DIAMOND GOVERNOR';
    tierSubColor = 'text-cyan-200';
    tierGold = 'text-cyan-300';
    bannerColor = 'from-cyan-400 to-sky-300 text-cyan-950';
  }

  // Fallback photo
  const defaultPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
  const photoSrc = member.photoUrl || defaultPhoto;

  return (
    <div className="space-y-6 max-w-sm mx-auto select-none">
      {/* 3D Vertical Card Container */}
      <div className="relative group perspective-1000">
        {!showBackSide ? (
          /* =========================================================
             FRONT SIDE (SEAMLESSLY BLENDED LOGO, TIER COLOR, NO AMOUNTS)
             ========================================================= */
          <div className={`w-full bg-white text-slate-800 rounded-[2.5rem] border-2 ${themeBorder} shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01] flex flex-col justify-between min-h-[600px]`}>
            
            {/* Top Lanyard Slot */}
            <div className="flex justify-center pt-3.5 z-20">
              <div className="w-16 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center">
                <div className="w-10 h-1.5 rounded-full bg-slate-400/80" />
              </div>
            </div>

            {/* Top-Left Corner Accent: Confined to corner to NEVER overlap the center logo */}
            <div 
              style={{ backgroundColor: themeBg }}
              className="absolute top-0 left-0 w-24 h-24 rounded-br-[3rem] overflow-hidden pointer-events-none z-0 shadow-sm"
            >
              {/* Gold Divider Line */}
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            </div>

            {/* Left Edge Vertical Micro-Text */}
            <div 
              style={{ color: themeBg }}
              className="absolute left-2 top-24 -rotate-90 origin-left text-[7px] font-black uppercase tracking-[0.25em] opacity-75 z-10 select-none"
            >
              SERVICE | CHARTER | EMPOWERMENT
            </div>

            {/* Header Content with Perfectly Blended Logo */}
            <div className="text-center pt-2 px-6 space-y-1 z-10">
              {/* Center Emblem Logo: Clean transparent mix-blend to eliminate white box artifact */}
              <div className="w-20 h-20 mx-auto flex items-center justify-center bg-transparent">
                <img 
                  src="/images/logo.png" 
                  alt="Al Shujaiat Foundation Emblem" 
                  className="w-full h-full object-contain mix-blend-multiply" 
                />
              </div>

              <h2 style={{ color: themeBg }} className="text-2xl font-black tracking-tight leading-none">
                ASFJK
              </h2>
              <p style={{ color: themeBg }} className="text-[8.5px] font-extrabold uppercase tracking-wider leading-tight">
                AL SHUJAIAT FOUNDATION
              </p>
              <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                JAMMU & KASHMIR · REGISTERED TRUST
              </p>
              <p className="text-[9px] text-amber-700 font-bold font-serif pt-0.5 leading-none">
                خدمتِ انسانیت، ہماری پہچان
              </p>

              {/* Title Section */}
              <div className="pt-2">
                <h3 style={{ color: themeBg }} className="text-lg font-black tracking-wider uppercase leading-none">
                  NGO MEMBERSHIP
                </h3>
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <div className="w-7 h-[1.5px] bg-amber-500" />
                  <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-amber-600">
                    {tierLabel}
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
                    alt={member.fullName} 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute right-4 opacity-5 pointer-events-none">
                <img src="/images/logo.png" alt="watermark" className="w-24 h-24 object-contain mix-blend-multiply" />
              </div>
            </div>

            {/* Bottom Section: Dynamic Tier Wave Container (NO PAYMENT AMOUNTS SHOWN) */}
            <div 
              style={{ backgroundColor: themeBg }}
              className="text-white pt-4 pb-0 rounded-t-[2.5rem] rounded-b-[2.2rem] relative z-10 shadow-lg border-t-2 border-amber-400/40"
            >
              {/* Member Info: Pure Executive Accreditation */}
              <div className="text-center px-4 space-y-0.5">
                <h4 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                  {member.fullName}
                </h4>
                <p className={`text-xs font-semibold ${tierSubColor} uppercase tracking-wide`}>
                  {member.tierName} · {member.durationYears} {member.durationYears === 1 ? 'Year Accredited' : 'Years Accredited'}
                </p>
                <p className={`text-xs font-black tracking-widest ${tierGold} font-mono pt-1`}>
                  MBR ID : {member.membershipNumber}
                </p>
              </div>

              {/* Bottom Split Bar: QR Code (Left) & Slogan Box (Right) */}
              <div className="mt-3.5 flex items-stretch border-t border-white/10 bg-black/20 rounded-b-[2.2rem] overflow-hidden">
                {/* Left QR Code Box */}
                <div className="bg-white p-2 flex items-center justify-center border-r border-amber-400/30">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.asfjk.org/verify/mbr/${member.membershipNumber}`} 
                      alt="QR Verification" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Right Slogan Box */}
                <div className={`flex-1 bg-gradient-to-r ${bannerColor} p-2 flex items-center justify-center gap-2`}>
                  <Crown className="w-6 h-6 flex-shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[9.5px] font-black uppercase tracking-wider block">
                      ACCREDITED
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-wide block opacity-90">
                      HONORARY NGO MEMBER
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             BACK SIDE (SEAMLESSLY BLENDED LOGO, TIER COLOR, NO AMOUNTS)
             ========================================================= */
          <div className={`w-full bg-white text-slate-800 rounded-[2.5rem] border-2 ${themeBorder} shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01] flex flex-col justify-between min-h-[600px]`}>
            
            {/* Top Lanyard Slot */}
            <div className="flex justify-center pt-3.5 z-20">
              <div className="w-16 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center">
                <div className="w-10 h-1.5 rounded-full bg-slate-400/80" />
              </div>
            </div>

            {/* Top-Left Tier Corner Accent */}
            <div 
              style={{ backgroundColor: themeBg }}
              className="absolute top-0 left-0 w-20 h-20 rounded-br-[2.5rem] overflow-hidden pointer-events-none z-0"
            >
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            </div>

            {/* Header Content */}
            <div className="text-center pt-2 px-6 space-y-1 z-10">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-transparent">
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
                  NGO MEMBERSHIP
                </span>
                <div className="w-10 h-[1.5px] bg-amber-500" />
              </div>
            </div>

            {/* Body Information (NO PAYMENT AMOUNTS SHOWN) */}
            <div className="px-6 py-2 space-y-3 z-10 text-left">
              <div className="text-center space-y-1 border-b border-slate-100 pb-2">
                <p className="text-[9.5px] text-slate-700 leading-snug font-medium">
                  This card identifies the bearer as an accredited NGO Member of Al Shujaiat Foundation (ASFJK).
                </p>
                <p className="text-[9px] text-slate-500 font-medium">
                  This card is valid for the statutory period shown below.
                </p>
              </div>

              {/* Field List with Icons */}
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
                      MEMBER NAME
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      {member.fullName}
                    </span>
                  </div>
                </div>

                {/* Tier Level & Designation */}
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: themeBg }}
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-sm"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                      MEMBERSHIP LEVEL / TIER
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      {member.tierName}
                    </span>
                  </div>
                </div>

                {/* Valid Dates */}
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
                        {member.validFrom}
                      </span>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-200" />
                    <div>
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                        VALID TILL ({member.durationYears} YRS)
                      </span>
                      <span className="font-bold text-slate-800 text-[11px] font-mono">
                        {member.validThru}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statutory Numbers */}
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: themeBg }}
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-sm"
                  >
                    <Shield className="w-4 h-4 text-rose-300" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                      REGISTRATIONS · LEI & 80G
                    </span>
                    <span className="font-bold text-slate-800 text-[10.5px] font-mono">
                      DARPAN: JK/2018/0190361 · 80G · 12A
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatory & Rubber Stamp */}
              <div className="pt-2 border-t border-amber-400/40 flex items-center justify-between">
                <div className="text-left space-y-0.5">
                  <p className="font-serif italic text-base text-slate-800 font-bold leading-none">
                    Mohd Amin Ganai
                  </p>
                  <p style={{ color: themeBg }} className="text-[10px] font-black uppercase tracking-tight leading-none pt-0.5">
                    Mohd Amin Ganai
                  </p>
                  <p className="text-[8px] font-semibold text-slate-500 leading-none">
                    Founder & Chairman / Director General
                  </p>
                </div>

                <div className="w-14 h-14 rounded-full border-2 border-[#1E3A8A] text-[#1E3A8A] p-0.5 flex flex-col items-center justify-center text-center rotate-[-8deg] shadow-sm">
                  <div className="w-full h-full rounded-full border border-[#1E3A8A] flex flex-col items-center justify-center">
                    <span className="text-[5.5px] font-black uppercase tracking-tighter leading-none">
                      AL SHUJAIAT
                    </span>
                    <span className="text-[9px] font-black tracking-widest leading-none my-0.5 text-rose-700">
                      ASFJK
                    </span>
                    <span className="text-[5px] font-black uppercase tracking-tighter leading-none">
                      JAMMU & KASHMIR
                    </span>
                  </div>
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
                  {settings.taxExemptionNumber80G}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Actions Bar (Responsive Grid for Mobile & Desktop) */}
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
          <span>{t('membership.print', 'Print Badge')}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPDF}
          style={{ backgroundColor: themeBg }}
          className="btn-primary !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-pink-glow border-none text-white w-full sm:col-span-1"
        >
          <Download className="w-4 h-4" />
          <span>{t('membership.download_pdf', 'Download PDF')}</span>
        </button>
      </div>
    </div>
  );
};
