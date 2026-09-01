import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { VolunteerApplication } from '../../types';
import { VolunteerIdCardPreview } from '../../components/volunteer/VolunteerIdCardPreview';
import { 
  HeartHandshake, CheckCircle2, Shield, ArrowRight, UploadCloud, 
  FileText, X, Paperclip, Award, IdCard, Search, Clock, AlertCircle 
} from 'lucide-react';

export const VolunteerPage: React.FC = () => {
  const { addVolunteerApplication, lookupVolunteerStatus, settings } = useDatabase();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [qualification, setQualification] = useState('');
  const [degreeLevel, setDegreeLevel] = useState("Bachelor's Degree");
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'weekdays' | 'weekends' | 'full_time' | 'flexible'>('weekends');
  const [experienceYears, setExperienceYears] = useState(2);
  const [statement, setStatement] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Status Lookup & Approved ID Card Retrieval
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<VolunteerApplication | null | 'not_found'>(null);
  const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');

  const [createdVolunteer, setCreatedVolunteer] = useState<VolunteerApplication | null>(null);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setResumeFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          dataUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const fullQualification = qualification
      ? `${qualification} (${degreeLevel})`
      : degreeLevel;

    let derivedRole = 'Humanitarian Aid Volunteer';
    if (selectedSkills.includes('Healthcare & Medical Support')) derivedRole = 'Medical Support Volunteer';
    else if (selectedSkills.includes('Clean Water & Civil Engineering')) derivedRole = 'Clean Water Infrastructure Lead';
    else if (selectedSkills.includes('Education, STEM & Tutoring')) derivedRole = 'Education & Youth Mentor';
    else if (selectedSkills.includes('Emergency Relief & Field Logistics')) derivedRole = 'Emergency Relief & Logistics';

    try {
      const newApp = addVolunteerApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 94193 01319',
        city: city.trim() || 'Jammu & Kashmir',
        country: country || 'India',
        photoUrl: photoUrl || undefined,
        qualification: fullQualification,
        roleDesignation: derivedRole,
        bloodGroup: bloodGroup || 'O+',
        resumeFileName: resumeFile?.name || `${fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        resumeDataUrl: resumeFile?.dataUrl,
        skills: selectedSkills.length ? selectedSkills : ['General Community Support'],
        availability,
        experienceYears,
        statement: statement || 'Dedicated volunteer ready to serve the community.',
        status: 'approved',
      });

      setCreatedVolunteer(newApp);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to submit volunteer application:', err);
    }
  };

  const handleLookupStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    const found = lookupVolunteerStatus(lookupEmail);
    setLookupResult(found || 'not_found');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('volunteer.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('volunteer.title', 'Volunteer Network & Identity Badges')}
        </h1>
        <p className="text-content-secondary text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {t('volunteer.subtitle', 'Be a part of life-saving winter distributions, water engineering projects, and smart classroom tutoring in Jammu & Kashmir.')}
        </p>

        {/* Tab Toggle */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex bg-surface-soft p-1 rounded-2xl border border-content-border shadow-inner">
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'apply' ? 'bg-brand-purple text-white shadow-md' : 'text-content-secondary hover:text-content-primary'}`}
            >
              {t('volunteer.tab_apply', 'Apply as Volunteer')}
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'status' ? 'bg-brand-purple text-white shadow-md' : 'text-content-secondary hover:text-content-primary'}`}
            >
              <Search className="w-3.5 h-3.5" /> {t('volunteer.tab_status', 'Check Status & Access ID Card')}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'status' ? (
        /* STATUS & ID CARD LOOKUP SECTION */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-md space-y-6 animate-fadeIn">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto">
              <IdCard className="w-6 h-6 text-brand-pink" />
            </div>
            <h3 className="text-xl font-extrabold text-content-primary">
              {t('volunteer.lookup_title', 'Volunteer Verification & ID Card Retrieval')}
            </h3>
            <p className="text-xs text-content-secondary">
              {t('volunteer.lookup_subtitle', 'Enter your registered email address to check your application review status or download your official approved Volunteer Identity Card.')}
            </p>
          </div>

          <form onSubmit={handleLookupStatus} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              required
              placeholder="Enter your registered email address..."
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
            />
            <button type="submit" className="btn-primary !py-2.5 !px-5 text-xs font-bold">
              {t('volunteer.verify_btn', 'Verify')}
            </button>
          </form>

          {/* Lookup Results */}
          {lookupResult === 'not_found' && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-center text-xs space-y-1">
              <p className="font-bold">No application record found for "{lookupEmail}"</p>
              <p className="text-[11px] text-rose-600">Please double check your email or submit a new volunteer application below.</p>
            </div>
          )}

          {lookupResult && lookupResult !== 'not_found' && (
            <div className="space-y-6 pt-4 border-t border-content-border">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase">
                      APPLICATION VERIFIED & VOLUNTEER ID ACTIVE
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Volunteer ID: <span className="font-mono font-bold">{lookupResult.membershipNumber || `ASFJK25V${lookupResult.id.slice(-3)}`}</span> · Role: {lookupResult.roleDesignation || 'Humanitarian Volunteer'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1 rounded-full uppercase">
                  VERIFIED
                </span>
              </div>

              <VolunteerIdCardPreview volunteer={lookupResult} settings={settings} />
            </div>
          )}
        </div>
      ) : submitted ? (
        /* APPLICATION SUBMITTED & VOLUNTEER ID CARD GENERATED */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-lg space-y-8 animate-fadeIn max-w-3xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              REGISTRATION COMPLETE · OFFICIAL ID CARD ISSUED
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-content-primary">
              Welcome to the Al Shujaiat Volunteer Brigade!
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary max-w-lg mx-auto leading-relaxed">
              Congratulations <span className="font-bold text-brand-purple">{fullName}</span>. Your volunteer enrollment has been registered with ID <span className="font-mono font-bold text-brand-pink">{createdVolunteer?.membershipNumber || 'ASFJK25V01'}</span>. Your official digital Volunteer Identity Badge is generated below.
            </p>
          </div>

          {/* Volunteer ID Card Preview Component */}
          <div className="bg-surface-soft p-6 sm:p-8 rounded-3xl border border-content-border space-y-6">
            <div className="flex items-center justify-between border-b border-content-border pb-3">
              <div className="flex items-center gap-2 text-brand-purple font-bold text-xs uppercase tracking-wider">
                <IdCard className="w-4 h-4 text-brand-pink" />
                <span>Official Digital Volunteer ID Credential</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                ID: {createdVolunteer?.membershipNumber || 'ASFJK25V01'}
              </span>
            </div>

            {createdVolunteer ? (
              <VolunteerIdCardPreview volunteer={createdVolunteer} settings={settings} />
            ) : (
              <VolunteerIdCardPreview
                volunteer={{
                  id: `vol_${Date.now()}`,
                  membershipNumber: 'ASFJK25V01',
                  fullName: fullName || 'Authorized Volunteer',
                  email: email || 'volunteer@asfjk.org',
                  phone: phone || '+91 94193 01319',
                  city: city || 'Jammu & Kashmir',
                  country: country || 'India',
                  qualification: qualification || "Bachelor's Degree",
                  roleDesignation: 'Humanitarian Aid Volunteer',
                  bloodGroup: bloodGroup || 'O+',
                  skills: selectedSkills.length ? selectedSkills : ['General Community Support'],
                  availability: availability || 'weekends',
                  experienceYears: experienceYears || 2,
                  statement: statement || '',
                  status: 'approved',
                  validFrom: '01 May 2025',
                  validThru: '30 Apr 2026',
                  submittedAt: new Date().toISOString()
                }}
                settings={settings}
              />
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setCreatedVolunteer(null);
                setResumeFile(null);
                setQualification('');
                setFullName('');
                setEmail('');
                setPhone('');
              }}
              className="btn-outline !py-2.5 !px-6 text-xs font-bold"
            >
              Submit Another Application
            </button>
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Blood Group (ID Badge)</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white font-mono"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>
          </div>

          {/* Volunteer Photo Upload for ID Card */}
          <div className="bg-surface-soft p-4 sm:p-5 rounded-2xl border border-content-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-brand-pink" /> Passport Size Photograph (for Official ID Card Badge) *
              </h4>
              <span className="text-[10px] text-content-muted">JPG, PNG up to 5MB</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-content-border">
              {/* Circular Preview */}
              <div className="relative w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-amber-300 shadow-md flex-shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden border border-white bg-slate-100 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Photo Preview" className="w-full h-full object-cover object-top" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 text-center px-1">No Photo</span>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full text-center sm:text-left space-y-1">
                <p className="text-xs font-bold text-content-primary">
                  {photoUrl ? 'Photo Uploaded Successfully' : 'Upload your formal portrait photo'}
                </p>
                <p className="text-[11px] text-content-secondary">
                  This photo will be framed inside your official Volunteer Identity Card badge upon administrative vetting.
                </p>
                <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <label className="btn-outline !py-1.5 !px-3 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-brand-purple" />
                    <span>{photoUrl ? 'Change Photo' : 'Choose Photo File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
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
                  onChange={handleResumeUpload}
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
            <span>{t('volunteer.submit_btn', 'Submit Volunteer Application')}</span>
          </button>
        </form>
      )}
    </div>
  );
};
