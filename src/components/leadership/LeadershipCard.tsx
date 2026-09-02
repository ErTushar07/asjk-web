import React, { useState } from 'react';
import { LeadershipMember } from '../../types';
import { 
  User, Mail, Linkedin, ExternalLink, X, 
  GraduationCap, Briefcase, CheckCircle2, Shield, Award 
} from 'lucide-react';

interface LeadershipCardProps {
  member: LeadershipMember;
  onSelectSlug?: (slug: string) => void;
  isInitialOpen?: boolean;
}

export const LeadershipCard: React.FC<LeadershipCardProps> = ({ 
  member, 
  onSelectSlug,
  isInitialOpen = false 
}) => {
  const [modalOpen, setModalOpen] = useState(isInitialOpen);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'trustee':
        return { label: 'Board of Trustees', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'executive':
        return { label: 'Executive Leadership', color: 'bg-pink-100 text-pink-900 border-pink-200' };
      case 'team':
        return { label: 'Core Team', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'advisor':
        return { label: 'Advisory Board', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'volunteer_leader':
        return { label: 'Volunteer Leadership', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      default:
        return { label: 'Leadership', color: 'bg-slate-100 text-slate-900 border-slate-200' };
    }
  };

  const badge = getCategoryBadge(member.category);

  const handleOpenModal = () => {
    setModalOpen(true);
    if (onSelectSlug) onSelectSlug(member.slug);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-content-border p-6 shadow-brand-sm hover:shadow-brand-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
        <div className="space-y-4">
          {/* Avatar Container */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-surface-soft border border-content-border flex-shrink-0 flex items-center justify-center group-hover:border-brand-pink/50 transition-colors">
              {member.photoUrl ? (
                <img 
                  src={member.photoUrl} 
                  alt={member.name} 
                  loading="lazy"
                  width="80"
                  height="80"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-black text-lg sm:text-xl">
                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block mb-1 ${badge.color}`}>
                {badge.label}
              </span>
              <h3 className="text-base sm:text-lg font-black text-content-primary truncate group-hover:text-brand-purple transition-colors">
                {member.name}
              </h3>
              <p className="text-xs font-bold text-brand-pink line-clamp-1">
                {member.role}
              </p>
              {member.department && (
                <p className="text-[11px] text-content-muted truncate">
                  {member.department}
                </p>
              )}
            </div>
          </div>

          {/* Short Bio */}
          <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
            {member.bio}
          </p>

          {/* Responsibilities Chips */}
          {member.responsibilities && member.responsibilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {member.responsibilities.slice(0, 2).map((resp, i) => (
                <span 
                  key={i} 
                  className="text-[10px] bg-surface-soft text-content-secondary font-medium px-2.5 py-0.5 rounded-lg border border-content-border truncate max-w-full"
                >
                  {resp}
                </span>
              ))}
              {member.responsibilities.length > 2 && (
                <span className="text-[10px] text-brand-purple font-bold px-1 py-0.5">
                  +{member.responsibilities.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-content-border flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleOpenModal}
            className="text-xs font-bold text-brand-purple hover:text-brand-pink transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
            aria-label={`Read full biography of ${member.name}`}
          >
            <span>Read Full Profile</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1.5">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-surface-soft text-content-secondary hover:text-brand-purple hover:bg-brand-purple/10 flex items-center justify-center transition-colors"
                title="LinkedIn Profile"
                aria-label={`${member.name} LinkedIn Profile`}
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}

            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="w-7 h-7 rounded-lg bg-surface-soft text-content-secondary hover:text-brand-pink hover:bg-pink-50 flex items-center justify-center transition-colors"
                title={`Email: ${member.email}`}
                aria-label={`Email ${member.name}`}
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Accessible Detail Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${member.id}`}
        >
          <div className="bg-white rounded-3xl border border-content-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative animate-scaleUp">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-soft text-content-secondary hover:text-content-primary hover:bg-slate-200 flex items-center justify-center transition-colors"
              aria-label="Close profile modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-soft border border-content-border flex-shrink-0 flex items-center justify-center shadow-md">
                {member.photoUrl ? (
                  <img 
                    src={member.photoUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-black text-3xl">
                    {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border inline-block ${badge.color}`}>
                  {badge.label}
                </span>
                <h2 id={`modal-title-${member.id}`} className="text-xl sm:text-2xl font-black text-content-primary">
                  {member.name}
                </h2>
                <p className="text-sm font-bold text-brand-pink">
                  {member.role}
                </p>
                {member.department && (
                  <p className="text-xs text-content-muted font-medium">
                    {member.department}
                  </p>
                )}
              </div>
            </div>

            {/* Detailed Biography */}
            <div className="space-y-2 border-t border-content-border pt-4 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-pink" /> Executive Biography & Leadership Vision
              </h4>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed whitespace-pre-line">
                {member.bio}
              </p>
            </div>

            {/* Responsibilities & Governance Remit */}
            {member.responsibilities && member.responsibilities.length > 0 && (
              <div className="space-y-2.5 border-t border-content-border pt-4 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-brand-pink" /> Key Governance & Areas of Responsibility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {member.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-content-primary bg-surface-soft p-2.5 rounded-xl border border-content-border">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Background & Education */}
            {(member.education || member.professionalBackground) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-content-border pt-4 text-left">
                {member.education && (
                  <div className="bg-surface-soft p-3.5 rounded-xl border border-content-border space-y-1">
                    <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-purple" /> Education & Qualifications
                    </span>
                    <p className="text-xs font-semibold text-content-primary">{member.education}</p>
                  </div>
                )}

                {member.professionalBackground && (
                  <div className="bg-surface-soft p-3.5 rounded-xl border border-content-border space-y-1">
                    <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-brand-pink" /> Professional Background
                    </span>
                    <p className="text-xs text-content-secondary leading-relaxed">{member.professionalBackground}</p>
                  </div>
                )}
              </div>
            )}

            {/* Public Contact / Engagement */}
            <div className="border-t border-content-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-content-muted">
                Official Leadership Credential · Al Shujaiat Foundation
              </span>

              <div className="flex items-center gap-2">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="btn-primary !py-1.5 !px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-pink-glow"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact via Email</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
