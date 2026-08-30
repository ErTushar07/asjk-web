import React, { useState } from 'react';
import { VolunteerApplication, SystemSettings } from '../../types';
import { VolunteerIdCardService } from '../../services/volunteerIdCardService';
import { 
  Download, Printer, ShieldCheck, CheckCircle2, QrCode, 
  MapPin, Phone, Mail, Award, RotateCw, User 
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
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Interactive ID Card Container */}
      <div className="relative group perspective-1000">
        {!showBackSide ? (
          /* FRONT SIDE */
          <div className="w-full bg-gradient-to-br from-white via-white to-purple-50/40 rounded-2xl border-2 border-brand-purple/20 shadow-2xl overflow-hidden relative transition-all duration-300 transform hover:scale-[1.01]">
            {/* Top Brand Header */}
            <div className="bg-brand-purple px-4 py-3 text-white flex items-center justify-between border-b-2 border-brand-pink relative overflow-hidden">
              <div className="flex items-center gap-2.5 z-10">
                <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-md">
                  <img src="/images/logo.png" alt="ASFJK Emblem" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase leading-none">
                    AL SHUJAIAT FOUNDATION
                  </h4>
                  <p className="text-[10px] text-white/80 font-medium tracking-wide">
                    JAMMU & KASHMIR · HUMANITARIAN WING
                  </p>
                </div>
              </div>
              <div className="text-right z-10">
                <span className="inline-block bg-brand-pink text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                  VOLUNTEER ID
                </span>
              </div>
              {/* Subtle background glow */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-brand-pink/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Card Body */}
            <div className="p-5 grid grid-cols-12 gap-4 items-center">
              {/* Left Column: Photo & Verified Badge */}
              <div className="col-span-4 flex flex-col items-center text-center space-y-2">
                <div className="w-24 h-28 rounded-xl bg-gradient-to-b from-surface-soft to-purple-100/50 border-2 border-brand-purple/30 p-1 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple mb-1">
                    <User className="w-10 h-10" />
                  </div>
                  <span className="text-[9px] font-extrabold text-brand-purple tracking-widest uppercase">
                    ACTIVE
                  </span>
                  <div className="absolute top-1 right-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {volunteer.bloodGroup || 'Blood: O+'}
                </div>
              </div>

              {/* Right Column: Key Details */}
              <div className="col-span-8 space-y-2 text-left">
                <div>
                  <h3 className="text-base font-black text-content-primary leading-tight uppercase">
                    {volunteer.fullName}
                  </h3>
                  <p className="text-xs font-bold text-brand-pink tracking-wide uppercase">
                    {volunteer.roleDesignation || 'Humanitarian Field Specialist'}
                  </p>
                </div>

                <div className="space-y-1 text-xs border-t border-b border-content-border/60 py-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-content-muted text-[10px] font-sans uppercase font-bold">Volunteer ID:</span>
                    <span className="font-extrabold text-brand-purple">{volunteer.membershipNumber || `ASF-VOL-2026-${volunteer.id.slice(-4)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted text-[10px] font-sans uppercase font-bold">Qualification:</span>
                    <span className="text-content-primary truncate max-w-[140px] text-right font-sans font-semibold text-[11px]">
                      {volunteer.qualification || "Bachelor's Degree"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted text-[10px] font-sans uppercase font-bold">Location:</span>
                    <span className="text-content-primary font-sans font-medium text-[11px]">{volunteer.city}, {volunteer.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted text-[10px] font-sans uppercase font-bold">Valid Thru:</span>
                    <span className="text-emerald-700 font-bold text-[11px]">{volunteer.validThru || '2027-08-31'}</span>
                  </div>
                </div>

                {/* Skills Preview */}
                <div className="flex flex-wrap gap-1">
                  {volunteer.skills?.slice(0, 2).map((sk, idx) => (
                    <span key={idx} className="text-[9px] bg-brand-purple/10 text-brand-purple font-bold px-2 py-0.5 rounded">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Hologram & Security Seal Bar */}
            <div className="bg-surface-soft px-4 py-2 border-t border-content-border flex items-center justify-between text-[10px]">
              <div className="text-content-muted font-mono text-[9px]">
                NGO-DARPAN: <span className="text-content-primary font-bold">JK/2018/0190361</span> · 80G · 12A · LEI
              </div>
              <div className="flex items-center gap-1.5 font-bold text-brand-purple">
                <Award className="w-3.5 h-3.5 text-brand-pink" />
                <span className="text-[10px] uppercase tracking-wider">Authorized Seal</span>
              </div>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="w-full bg-gradient-to-br from-purple-900 via-brand-purple to-slate-900 text-white rounded-2xl border-2 border-brand-purple/30 shadow-2xl p-5 space-y-3.5 relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="ASFJK Logo" className="w-6 h-6 object-contain bg-white rounded-full p-0.5" />
                <span className="font-extrabold text-xs uppercase tracking-wider">AL SHUJAIAT FOUNDATION</span>
              </div>
              <span className="text-[10px] font-mono text-brand-pink font-bold">STATUTORY BADGE</span>
            </div>

            {/* Statutory Grid */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 text-[10px] font-mono">
              <div>NGO-DARPAN: <span className="text-white font-bold">{settings.registrationNumber}</span></div>
              <div>80G Tax: <span className="text-white font-bold">{settings.taxExemptionNumber80G}</span></div>
              <div>12A Reg: <span className="text-white font-bold">{settings.taxExemptionNumber12A || 'DEL-AR26932-27022018/8830'}</span></div>
              <div>FCRA Reg: <span className="text-white font-bold">{settings.fcraRegistrationNumber}</span></div>
              <div className="col-span-2">LEI ID: <span className="text-white font-bold">{settings.leiNumber || '9845008779YC3EE0IE41'}</span></div>
            </div>

            {/* Office Addresses */}
            <div className="space-y-1 text-[10px] text-white/80">
              <p><span className="font-bold text-white">Reg. Office:</span> {settings.registeredAddress}</p>
              <p><span className="font-bold text-white">Operating Office:</span> {settings.operatingAddress}</p>
              <p><span className="font-bold text-white">Helplines:</span> {settings.phone} / {settings.emergencyPhone}</p>
            </div>

            {/* Authorization Disclaimer */}
            <div className="bg-brand-pink/10 border border-brand-pink/30 p-2.5 rounded-xl text-[9px] text-white/90 leading-relaxed">
              This identity card confirms that the bearer is a certified humanitarian volunteer of Al Shujaiat Foundation Jammu & Kashmir. Authorized for field relief, medical distribution, and educational mentorship.
            </div>
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowBackSide(!showBackSide)}
          className="btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Flip to {showBackSide ? 'Front Side' : 'Back Side (Credentials)'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Badge</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="btn-primary !py-2 !px-5 text-xs font-bold flex items-center gap-1.5 shadow-pink-glow"
          >
            <Download className="w-4 h-4" />
            <span>Download Identity Card (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
