import React, { useState, useEffect } from 'react';
import { TOTPService, TOTPEnrollmentResult } from '../../services/totpService';
import { Shield, Key, CheckCircle2, AlertTriangle, X, Copy, Check } from 'lucide-react';

interface TOTPSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  onSuccess: (secret: string) => void;
}

export const TOTPSetupModal: React.FC<TOTPSetupModalProps> = ({
  isOpen,
  onClose,
  adminEmail,
  onSuccess,
}) => {
  const [enrollment, setEnrollment] = useState<TOTPEnrollmentResult | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const data = TOTPService.generateEnrollment(adminEmail);
      setEnrollment(data);
      setVerificationCode('');
      setError(null);
    }
  }, [isOpen, adminEmail]);

  if (!isOpen || !enrollment) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(enrollment.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyAndActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const isValid = TOTPService.verifyTOTP(verificationCode, enrollment.secret);

    if (isValid) {
      onSuccess(enrollment.secret);
      onClose();
    } else {
      setError('Invalid 6-digit verification code. Please make sure your authenticator clock is accurate and retry.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-white relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 text-brand-pink flex items-center justify-center mx-auto shadow-pink-glow">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Enroll Two-Factor Auth (2FA)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scan the QR code or enter the secret key into your Authenticator app (Google Authenticator, Microsoft Authenticator, 1Password).
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Secret Key Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Manual Entry Secret Key:</span>
            <button
              onClick={handleCopySecret}
              className="text-brand-pink hover:text-pink-300 font-bold flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono text-xs font-bold text-slate-200 tracking-wider break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            {enrollment.secret}
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerifyAndActivate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Enter 6-Digit Code to Confirm
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center font-mono text-xl tracking-[0.5em] font-black py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-brand-pink outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-1/2 py-3 rounded-xl bg-gradient-brand text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-pink-glow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Activate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
