import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { HeartHandshake, CheckCircle2, Shield, ArrowRight } from 'lucide-react';

export const VolunteerPage: React.FC = () => {
  const { addVolunteerApplication } = useDatabase();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'weekdays' | 'weekends' | 'full_time' | 'flexible'>('weekends');
  const [experienceYears, setExperienceYears] = useState(2);
  const [statement, setStatement] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const availableSkills = [
    'Clean Water & Civil Engineering',
    'Emergency Relief & Field Logistics',
    'Education, STEM & Tutoring',
    'Healthcare & Medical Support',
    'Media, Photography & Storytelling',
    'Community Mobilization & Coordination',
  ];

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    addVolunteerApplication({
      fullName,
      email,
      phone,
      city,
      country,
      skills: selectedSkills.length ? selectedSkills : ['General Community Support'],
      availability,
      experienceYears,
      statement,
    });

    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Al Shujaiat Foundation · Jammu & Kashmir
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Join Our Volunteer Network
        </h1>
        <p className="text-content-secondary text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Be a part of life-saving winter distributions, water engineering projects, and smart classroom tutoring in Jammu & Kashmir.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-content-border shadow-brand-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-extrabold text-content-primary">Application Submitted!</h3>
          <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
            Thank you for stepping forward, <span className="font-bold text-brand-purple">{fullName}</span>. Our volunteer coordination desk led by Sarah Mitchell will review your application and contact you at <span className="font-mono">{email}</span>.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-primary !py-2.5 !px-6 text-xs font-bold mt-4"
          >
            Submit Another Application
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Oliver Bennett"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. oliver.bennett@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+44 7700 900123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">City</label>
              <input
                type="text"
                placeholder="London / Boston / Srinagar"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>

          {/* Skills Checklist */}
          <div>
            <label className="block text-xs font-semibold text-content-primary mb-2">Areas of Interest & Skills</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableSkills.map((sk) => (
                <label key={sk} className="flex items-center gap-2 p-2.5 rounded-xl border border-content-border bg-surface-soft hover:bg-surface-card cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(sk)}
                    onChange={() => handleSkillToggle(sk)}
                    className="rounded text-brand-purple focus:ring-brand-purple"
                  />
                  <span>{sk}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1">Why would you like to volunteer with us?</label>
            <textarea
              rows={3}
              placeholder="Tell us about your background, motivations, or field experience..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
            />
          </div>

          <button
            type="submit"
            className="btn-secondary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-pink-glow"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Submit Volunteer Application</span>
          </button>
        </form>
      )}
    </div>
  );
};
