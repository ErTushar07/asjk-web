import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { MapPin, Mail, Phone, Clock, CheckCircle2, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { addSupportTicket, settings } = useDatabase();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<any>('general_inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    addSupportTicket({
      name,
      email,
      subject: subject || 'General Query',
      category,
      priority: 'medium',
      message,
    });

    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Al Shujaiat Foundation · Jammu & Kashmir
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Contact Headquarters & Donor Support Desk
        </h1>
        <p className="text-content-secondary text-sm leading-relaxed">
          Have questions regarding project allocations, Section 80G receipts, recurring subscriptions, or field visits? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 bg-brand-purple text-white p-8 sm:p-10 rounded-3xl space-y-8 shadow-brand-md flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold tracking-tight">Foundation Offices & Helplines</h3>
            <div className="space-y-4 text-xs text-white/85">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-pink flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Registered Office:</span>
                  <p>{settings.registeredAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Operating / Field Office:</span>
                  <p>{settings.operatingAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">General & Donor Inquiries:</span>
                  <p className="font-mono">{settings.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Helplines & WhatsApp:</span>
                  <p className="font-mono">{settings.phone} / {settings.emergencyPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5 text-xs text-white/90">
            <span className="font-bold text-brand-blue block">Direct Desk Hours</span>
            <p className="text-[11px] text-white/75">
              Monday – Saturday: 9:00 AM – 6:00 PM IST (GMT+5:30)
            </p>
          </div>
        </div>

        {/* Right: Support Ticket Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-content-border shadow-brand-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-content-primary">Message Dispatched Successfully</h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto">
                Your support inquiry has been submitted to our Donor Desk. A support representative will respond within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-primary !py-2 !px-4 text-xs font-bold mt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-extrabold text-content-primary">
                Send an Inquiry or Support Request
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Thompson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. david.thompson@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white"
                  >
                    <option value="general_inquiry">General Inquiry</option>
                    <option value="receipt_request">Tax Receipt Request (80G)</option>
                    <option value="recurring_support">Recurring Subscription Support</option>
                    <option value="field_visit">Field Visit / Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Brief description of your inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
