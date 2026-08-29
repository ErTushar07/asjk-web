import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { HeartHandshake, CheckCircle2, Shield, ArrowRight, UploadCloud, FileText, X, Paperclip } from 'lucide-react';

export const VolunteerPage: React.FC = () => {
  const { addVolunteerApplication } = useDatabase();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [qualification, setQualification] = useState('');
  const [degreeLevel, setDegreeLevel] = useState("Bachelor's Degree");
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKB = (file.size / 1024).toFixed(1);
      const reader = new FileReader();
      reader.onload = () => {
        setResumeFile({
          name: file.name,
          size: `${sizeKB} KB`,
          dataUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const fullQualification = qualification.trim()
      ? `${degreeLevel} - ${qualification.trim()}`
      : degreeLevel;

    addVolunteerApplication({
      fullName,
      email,
      phone,
      city,
      country,
      qualification: fullQualification,
      resumeFileName: resumeFile?.name || `${fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      resumeDataUrl: resumeFile?.dataUrl,
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
            Thank you for stepping forward, <span className="font-bold text-brand-purple">{fullName}</span>. Your qualifications and attached resume (<span className="font-mono text-brand-pink">{resumeFile?.name || 'Resume Attached'}</span>) have been received. Our volunteer coordination desk led by Sarah Mitchell will review your application and contact you at <span className="font-mono">{email}</span>.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setResumeFile(null);
              setQualification('');
            }}
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

          {/* Educational Qualification Section */}
          <div className="bg-surface-soft p-4 sm:p-5 rounded-2xl border border-content-border space-y-3">
            <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-pink" /> Educational & Professional Qualification *
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">Highest Degree Level</label>
                <select
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-content-border bg-white focus:border-brand-purple outline-none"
                >
                  <option value="Bachelor's Degree">Bachelor's Degree (B.A / B.Sc / B.Tech / B.E)</option>
                  <option value="Master's Degree">Master's Degree (M.A / M.Sc / M.Tech / MBA / MSW)</option>
                  <option value="Medical / Healthcare">Medical / Healthcare Degree (MBBS / MD / B.Sc Nursing / BDS)</option>
                  <option value="Doctorate / PhD">Doctorate / Ph.D / Post-Doctoral</option>
                  <option value="Diploma / Vocational">Diploma / Technical Vocational Certification</option>
                  <option value="Higher Secondary / High School">Higher Secondary / High School</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">Field of Study / Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Engineering, Nursing, Social Work, Education"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-content-border bg-white focus:border-brand-purple outline-none"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="bg-surface-soft p-4 sm:p-5 rounded-2xl border border-content-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-brand-pink" /> Attach Resume / Curriculum Vitae (CV) *
              </h4>
              <span className="text-[10px] text-content-muted">PDF, DOC, DOCX up to 10MB</span>
            </div>

            {resumeFile ? (
              <div className="bg-white p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-content-primary truncate">{resumeFile.name}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{resumeFile.size} · Uploaded Ready</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  className="p-1.5 text-content-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-content-border hover:border-brand-purple/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:bg-surface-highlight transition-all group">
                <UploadCloud className="w-8 h-8 text-content-muted group-hover:text-brand-purple group-hover:scale-110 transition-all" />
                <div className="text-center">
                  <span className="text-xs font-bold text-brand-purple block">Click to upload your resume</span>
                  <span className="text-[11px] text-content-muted">or drag and drop your PDF / Word document</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
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
