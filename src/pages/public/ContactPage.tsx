import React, { useState, useRef } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { MapPin, Mail, Phone, Clock, CheckCircle2, Send, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { addSupportTicket, settings } = useDatabase();
  const { t } = useLanguage();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<any>('general_inquiry');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const lastSubmitRef = useRef<number>(0);

  // Field Touched / Dirty tracking for inline validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  const errors = {
    name: touched.name && name.trim().length < 2 ? 'Please enter your full name (at least 2 characters).' : '',
    email: touched.email && (!email.trim() || !emailRegex.test(email.trim())) ? 'Please provide a valid email address for our reply.' : '',
    message: touched.message && message.trim().length < 10 ? 'Message must be at least 10 characters long.' : '',
  };

  const isFormValid = name.trim().length >= 2 && emailRegex.test(email.trim()) && message.trim().length >= 10 && message.trim().length <= 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot check (silently drop bot submissions)
    if (honeypot.trim().length > 0) {
      setSubmitted(true);
      return;
    }

    if (!isFormValid) {
      setTouched({ name: true, email: true, message: true });
      return;
    }

    // 2. Rate limit check (30 seconds)
    const now = Date.now();
    if (now - lastSubmitRef.current < 30000) {
      toast.error('Please wait 30 seconds before submitting again.', 'Rate Limited');
      return;
    }
    lastSubmitRef.current = now;

    const detailedMessage = phone.trim() 
      ? `${message.trim()}\n\n[Contact Phone/WhatsApp: ${phone.trim()}]`
      : message.trim();

    addSupportTicket({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || 'General Query',
      category,
      priority: 'medium',
      message: detailedMessage,
    });

    toast.success('Your inquiry has been logged. Our donor desk will respond within 24 hours.', 'Inquiry Submitted');
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('contact.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('contact.title', 'Contact Headquarters & Donor Support Desk')}
        </h1>
        <p className="text-content-secondary text-sm leading-relaxed">
          {t(
            'contact.subtitle',
            'Have questions regarding project allocations, Section 80G receipts, recurring subscriptions, or field visits? Reach out directly.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 bg-brand-purple text-white p-8 sm:p-10 rounded-3xl space-y-8 shadow-brand-md flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold tracking-tight">
              {t('contact.offices_helplines', 'Foundation Offices & Helplines')}
            </h3>
            <div className="space-y-4 text-xs text-white/85">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-pink flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    {t('contact.registered_office', 'Registered Office:')}
                  </span>
                  <p>{settings.registeredAddress || 'Main Town, Baramulla, Jammu & Kashmir 193101, India'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    {t('contact.liaison_office', 'Regional Liaison Office:')}
                  </span>
                  <p>Al Shujaiat Foundation, Rajbagh / Boulevard Road, Srinagar, J&K 190008, India</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Phone className="w-5 h-5 text-brand-pink flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block mb-0.5">{t('contact.phone_desk', 'Phone & WhatsApp:')}</span>
                  <a href={`tel:${settings.phone}`} className="hover:text-brand-pink transition-colors font-mono">
                    {settings.phone || '+91 94193 01319'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-blue flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block mb-0.5">{t('contact.email_desk', 'Support & General Inquiries:')}</span>
                  <a href={`mailto:${settings.email}`} className="hover:text-brand-blue transition-colors font-mono">
                    {settings.email || 'info@asfjk.org'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block mb-0.5">{t('contact.working_hours', 'Operating Hours:')}</span>
                  <p>Mon – Sat: 9:00 AM – 6:00 PM IST (Disaster helpline active 24/7)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-[11px] text-white/80">
            <span className="font-bold text-white block mb-1">Tax Exemption Verification Desk</span>
            <p>For custom CSR-1 filings, international wire transfer receipts, or statutory audit records, please direct queries to <span className="text-brand-pink font-bold">finance@asfjk.org</span>.</p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-content-primary">Inquiry Successfully Received</h3>
              <p className="text-xs text-content-secondary max-w-md mx-auto leading-relaxed">
                Thank you for reaching out, <span className="font-bold text-brand-purple">{name}</span>. A confirmation has been registered on our donor support desk. Our team will review your query and reply to <span className="font-mono font-bold text-content-primary">{email}</span> within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setSubject('');
                  setMessage('');
                  setHoneypot('');
                  setTouched({ name: false, email: false, message: false });
                }}
                className="btn-outline !py-2.5 !px-6 text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <h3 className="text-lg font-black text-content-primary">
                {t('contact.form_title', 'Send a Direct Message to Our Team')}
              </h3>

              {/* Honeypot field for bot protection */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aijaz Ahmad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                    className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-colors bg-white dark:bg-slate-800 text-content-primary ${
                      errors.name ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20' : 'border-content-border dark:border-slate-700 focus:border-brand-purple'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aijaz@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-colors bg-white dark:bg-slate-800 text-content-primary ${
                      errors.email ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20' : 'border-content-border dark:border-slate-700 focus:border-brand-purple'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 94193 01319"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-800 text-content-primary focus:border-brand-purple outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-800 text-content-primary focus:border-brand-purple outline-none"
                  >
                    <option value="general_inquiry">General Inquiry</option>
                    <option value="donation_tax_receipt">Section 80G Tax Receipt & Audit</option>
                    <option value="project_partnership">CSR / NGO Partnership</option>
                    <option value="field_visit">Field Project Visit Request</option>
                    <option value="volunteer_inquiry">Volunteer Network Query</option>
                    <option value="payment_issue">Subscription / Payment Support</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary uppercase">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Request for CSR Partnership Documentation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-800 text-content-primary focus:border-brand-purple outline-none"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-content-secondary uppercase">
                    Message / Details <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${message.length > 950 ? 'text-rose-500 font-bold' : 'text-content-muted'}`}>
                    {message.length} / 1000
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe your inquiry or request in detail (min 10 characters)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, message: true }))}
                  className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-colors bg-white dark:bg-slate-800 text-content-primary ${
                    errors.message ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20' : 'border-content-border dark:border-slate-700 focus:border-brand-purple'
                  }`}
                />
                {errors.message && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-brand-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
