import React, { useState } from 'react';
import { VolunteerApplication, SystemSettings } from '../../types';
import { VolunteerIdCardService } from '../../services/volunteerIdCardService';
import { 
  Download, Printer, RotateCw, User, Phone, 
  Calendar, Shield, QrCode, Heart, Award, MapPin, Globe, Mail 
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

  // Fallback photo
  const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const photoSrc = volunteer.photoUrl || defaultPhoto;

  return (
    <div className="space-y-6 max-w-sm mx-auto select-none">
      {/* 3D Vertical Card Container */}
      <div className="relative group perspective-1000">
        {!showBackSide ? (
          /* =========================================================
             FRONT SIDE (EXACT MATCH TO REFERENCE DESIGN)
             ========================================================= */
          <div className="w-full bg-white text-slate-800 rounded-[2.5rem] border-2 border-emerald-800/20 shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01] flex flex-col justify-between min-h-[600px]">
            
            {/* Top Lanyard Slot */}
            <div className="flex justify-center pt-3.5 z-20">
              <div className="w-16 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center">
                <div className="w-10 h-1.5 rounded-full bg-slate-400/80" />
              </div>
            </div>

            {/* Top-Left Green Diagonal Accent with Gold Trim */}
            <div className="absolute top-0 left-0 w-44 h-36 bg-[#0A4D3C] rounded-br-[4rem] overflow-hidden pointer-events-none z-0">
              {/* Gold Divider Line */}
              <div className="absolute bottom-0 right-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
              {/* Subtle Topo / Wave Texture */}
              <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <path d="M-20,20 Q40,60 100,10 T200,80" fill="none" stroke="#FFFFFF" strokeWidth="1" />
                <path d="M-20,50 Q60,100 120,40 T220,110" fill="none" stroke="#FFFFFF" strokeWidth="1" />
                <path d="M-20,80 Q80,140 140,70 T240,140" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              </svg>
            </div>

            {/* Left Edge Vertical Micro-Text */}
            <div className="absolute left-2.5 top-28 -rotate-90 origin-left text-[7.5px] font-black uppercase tracking-[0.25em] text-[#0A4D3C]/70 z-10 select-none">
              SERVICE | COMPASSION | EMPOWERMENT
            </div>

            {/* Header Content */}
            <div className="text-center pt-3 px-6 space-y-1 z-10">
              {/* Center Emblem Logo */}
              <div className="w-14 h-14 mx-auto flex items-center justify-center">
                <img 
                  src="/images/logo.png" 
                  alt="Al Shujaiat Foundation Emblem" 
                  className="w-full h-full object-contain filter drop-shadow-md" 
                />
              </div>

              {/* Foundation Brand Header */}
              <h2 className="text-2xl font-black text-[#0A4D3C] tracking-tight leading-none">
                ASFJK
              </h2>
              <p className="text-[8.5px] font-extrabold uppercase tracking-wider text-[#0A4D3C] leading-tight">
                AL SHUJAIAT FOUNDATION
              </p>
              <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                JAMMU & KASHMIR
              </p>
              <p className="text-[9.5px] text-amber-700 font-bold font-serif pt-0.5 leading-none">
                خدمتِ انسانیت، ہماری پہچان
              </p>

              {/* Title Section */}
              <div className="pt-2">
                <h3 className="text-lg font-black tracking-wider text-[#0A4D3C] uppercase leading-none">
                  VOLUNTEER
                </h3>
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <div className="w-8 h-[1.5px] bg-amber-500" />
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600">
                    IDENTITY CARD
                  </span>
                  <div className="w-8 h-[1.5px] bg-amber-500" />
                </div>
              </div>
            </div>

            {/* Center Area: Circular Framed Portrait Photo */}
            <div className="relative py-2 flex justify-center items-center z-10">
              {/* Circular Photo with Gold Outer Ring */}
              <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-100 flex items-center justify-center">
                  <img 
                    src={photoSrc} 
                    alt={volunteer.fullName} 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Subtle background watermark icon */}
              <div className="absolute right-4 opacity-5 pointer-events-none">
                <img src="/images/logo.png" alt="watermark" className="w-28 h-28 object-contain" />
              </div>
            </div>

            {/* Bottom Section: Deep Green Wave with Name, Role, ID & QR */}
            <div className="bg-[#0A4D3C] text-white pt-4 pb-0 rounded-t-[2.5rem] rounded-b-[2.2rem] relative z-10 shadow-lg border-t-2 border-amber-400/40">
              {/* Candidate Info */}
              <div className="text-center px-4 space-y-0.5">
                <h4 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                  {volunteer.fullName}
                </h4>
                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                  {volunteer.roleDesignation || 'Community Outreach Volunteer'}
                </p>
                <p className="text-xs font-black tracking-widest text-amber-300 font-mono pt-1">
                  VOL ID : {volunteer.membershipNumber || `ASFJK${new Date().getFullYear().toString().slice(-2)}V${volunteer.id.slice(-3)}`}
                </p>
              </div>

              {/* Bottom Split Bar: QR Code (Left) & Gold Slogan Box (Right) */}
              <div className="mt-3.5 flex items-stretch border-t border-emerald-800/60 bg-[#063B2E] rounded-b-[2.2rem] overflow-hidden">
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
                <div className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-[#1E1B4B] p-2 flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6 text-[#1E1B4B] fill-[#1E1B4B]/20 flex-shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[9.5px] font-black uppercase tracking-wider block text-[#1E1B4B]">
                      TOGETHER
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-wide block text-[#1E1B4B]/90">
                      WE MAKE A DIFFERENCE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             BACK SIDE (EXACT MATCH TO REFERENCE DESIGN)
             ========================================================= */
          <div className="w-full bg-white text-slate-800 rounded-[2.5rem] border-2 border-emerald-800/20 shadow-2xl overflow-hidden relative transition-all duration-500 transform hover:scale-[1.01] flex flex-col justify-between min-h-[600px]">
            
            {/* Top Lanyard Slot */}
            <div className="flex justify-center pt-3.5 z-20">
              <div className="w-16 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center">
                <div className="w-10 h-1.5 rounded-full bg-slate-400/80" />
              </div>
            </div>

            {/* Top-Left Green Diagonal Accent with Gold Trim */}
            <div className="absolute top-0 left-0 w-36 h-28 bg-[#0A4D3C] rounded-br-[3.5rem] overflow-hidden pointer-events-none z-0">
              <div className="absolute bottom-0 right-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
            </div>

            {/* Header Content */}
            <div className="text-center pt-3 px-6 space-y-1 z-10">
              <div className="w-12 h-12 mx-auto flex items-center justify-center">
                <img src="/images/logo.png" alt="ASFJK Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg font-black text-[#0A4D3C] leading-none">ASFJK</h3>
              <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">
                AL SHUJAIAT FOUNDATION · JAMMU & KASHMIR
              </p>

              {/* Divider Header */}
              <div className="flex items-center justify-center gap-2 pt-1.5">
                <div className="w-10 h-[1.5px] bg-amber-500" />
                <span className="text-xs font-black uppercase tracking-widest text-[#0A4D3C]">
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
                  <div className="w-7 h-7 rounded-lg bg-[#0A4D3C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
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
                  <div className="w-7 h-7 rounded-lg bg-[#0A4D3C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
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
                  <div className="w-7 h-7 rounded-lg bg-[#0A4D3C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
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
                  <div className="w-7 h-7 rounded-lg bg-[#0A4D3C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
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

              {/* Signatory & Rubber Stamp Section */}
              <div className="pt-2 border-t border-amber-400/40 flex items-center justify-between">
                {/* Left Signature */}
                <div className="text-left space-y-0.5">
                  <p className="font-serif italic text-base text-slate-800 font-bold leading-none">
                    Mohd Amin Ganai
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-tight text-[#0A4D3C] leading-none pt-0.5">
                    Mohd Amin Ganai
                  </p>
                  <p className="text-[8px] font-semibold text-slate-500 leading-none">
                    Founder & Chairman / Director General
                  </p>
                </div>

                {/* Right Rubber Stamp */}
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

            {/* Bottom Footer Bar (Deep Green) */}
            <div className="bg-[#0A4D3C] text-white px-5 py-2.5 rounded-b-[2.2rem] flex items-center justify-between text-[8px] z-10">
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

      {/* Control Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowBackSide(!showBackSide)}
          className="btn-outline !py-2.5 !px-4 text-xs font-bold flex items-center gap-1.5 text-[#0A4D3C] hover:bg-emerald-50"
        >
          <RotateCw className="w-4 h-4 text-amber-600" />
          <span>Flip Card ({showBackSide ? 'Front Side' : 'Back Side'})</span>
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
            className="btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5 shadow-pink-glow bg-[#0A4D3C] hover:bg-[#063B2E] border-none text-white"
          >
            <Download className="w-4 h-4" />
            <span>Download Identity Card (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
