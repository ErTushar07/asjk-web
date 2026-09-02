import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { VolunteerApplication } from '../../types';
import { VolunteerIdCardPreview } from '../../components/volunteer/VolunteerIdCardPreview';
import {
  Heart,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  Search,
  IdCard,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  Lock,
} from 'lucide-react';

export const PRIMARY_VOLUNTEER_ROLES = [
  'Emergency Relief & Field Logistics',
  'Healthcare & Medical Support Specialist',
  'Clean Water & Civil Engineering Lead',
  'Education, STEM & Youth Mentor',
  'Media, Photography & Storytelling',
  'Community Outreach & Field Coordinator',
  'Disaster First Responder & Rescue Specialist',
  'Accounting, Audit & Logistics Officer',
  'Humanitarian Field Volunteer',
];

export const VolunteerPage: React.FC = () => {
  const { t } = useLanguage();
  const { addVolunteerApplication, lookupVolunteerStatus, settings } = useDatabase();

  const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<VolunteerApplication | 'not_found' | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Srinagar');
  const [country, setCountry] = useState('India');
  const [primaryRole, setPrimaryRole] = useState(PRIMARY_VOLUNTEER_ROLES[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [qualification, setQualification] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('Bachelor of Technology (B.Tech / B.E.)');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'weekdays' | 'weekends' | 'full_time' | 'flexible'>('weekends');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [statement, setStatement] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [createdVolunteer, setCreatedVolunteer] = useState<VolunteerApplication | null>(null);

  const availableSkills = [
    'Emergency Relief & Field Logistics',
    'Healthcare & Medical Support',
    'Clean Water & Civil Engineering',
    'Education, STEM & Tutoring',
    'Media, Photography & Storytelling',
    'Community Outreach & Translation',
    'Accounting, Audit & Governance',
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
      reader.onload = () => setPhotoUrl(reader.result as string);
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

    try {
      // Primary role is set verbatim as chosen by the candidate and printed directly onto the ID badge
      const newApp = addVolunteerApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 94193 01319',
        city: city.trim() || 'Jammu & Kashmir',
        country: country || 'India',
        photoUrl: photoUrl || undefined,
        qualification: fullQualification,
        roleDesignation: primaryRole.trim(), // Explicit applicant selected role
        bloodGroup: bloodGroup || 'O+',
        resumeFileName: resumeFile?.name || `${fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        resumeDataUrl: resumeFile?.dataUrl,
        skills: selectedSkills.length ? selectedSkills : [primaryRole],
        availability,
        experienceYears,
        statement: statement || 'Dedicated volunteer ready to serve the community.',
        status: 'submitted', // Awaiting Admin Review & Approval
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
              {lookupResult.status === 'approved' ? (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900 uppercase">
                          APPLICATION APPROVED & VOLUNTEER ID ACTIVE
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          Volunteer ID: <span className="font-mono font-bold">{lookupResult.membershipNumber}</span> · Role: {lookupResult.roleDesignation || 'Humanitarian Volunteer'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1 rounded-full uppercase">
                      APPROVED
                    </span>
                  </div>

                  <VolunteerIdCardPreview volunteer={lookupResult} settings={settings} />
                </>
              ) : lookupResult.status === 'rejected' ? (
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-3 text-rose-900">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase">Application Not Approved</h4>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      Thank you for your interest in the Al Shujaiat Foundation. At this time, your application has not been approved for active deployment. For inquiries, please contact <span className="font-bold">volunteer@asfjk.org</span>.
                    </p>
                  </div>
                </div>
              ) : (
                /* PENDING / UNDER REVIEW STATE */
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                          Application Under Administrative Review
                        </h4>
                        <p className="text-[11px] text-amber-800">
                          Application Ref: <span className="font-mono font-bold">{lookupResult.membershipNumber}</span> · Candidate: {lookupResult.fullName} · Role: {lookupResult.roleDesignation}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Pending Admin Review
                    </span>
                  </div>

                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Your volunteer application and credentials have been received. An authorized Volunteer Coordinator from the Foundation Board is currently evaluating your profile. Your official Digital Volunteer Identity Card will be unlocked as soon as administrative approval is granted.
                  </p>

                  <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Volunteer ID Badge: <strong>Locked until approved</strong></span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700">Average review: 24–48 Hours</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : submitted ? (
        /* APPLICATION SUBMITTED — UNDER ADMIN REVIEW */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-lg space-y-6 animate-fadeIn max-w-2xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              APPLICATION SUBMITTED · AWAITING ADMIN REVIEW
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-content-primary">
              Application Received & Queued for Review
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary max-w-lg mx-auto leading-relaxed">
              Thank you, <span className="font-bold text-brand-purple">{fullName}</span>. Your volunteer application has been submitted to the Al Shujaiat Foundation Board under reference <span className="font-mono font-bold text-brand-pink">{createdVolunteer?.membershipNumber}</span>.
            </p>
          </div>

          {/* Application Summary Card */}
          <div className="bg-surface-soft p-5 sm:p-6 rounded-2xl border border-content-border space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-content-border">
              <span className="text-content-secondary">Primary Designation on Badge:</span>
              <span className="font-bold text-brand-purple">{createdVolunteer?.roleDesignation}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-content-border">
              <span className="text-content-secondary">Qualification:</span>
              <span className="font-bold text-content-primary">{createdVolunteer?.qualification}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-content-border">
              <span className="text-content-secondary">Location:</span>
              <span className="font-bold text-content-primary">{createdVolunteer?.city}, {createdVolunteer?.country}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-content-secondary">Status:</span>
              <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                Pending Administrative Review
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">What happens next?</p>
              <p className="text-blue-800 text-[11px] mt-0.5">
                Our Volunteer Coordinator will inspect your qualifications and uploaded resume. Once verified and approved by the administrator, your official Volunteer Identity Card with your designation <strong className="text-brand-purple">"{createdVolunteer?.roleDesignation}"</strong> will be activated.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setActiveTab('status');
                if (createdVolunteer?.email) {
                  setLookupEmail(createdVolunteer.email);
                  setLookupResult(createdVolunteer);
                }
              }}
              className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Track Application Status</span>
            </button>
          </div>
        </div>
      ) : (
        /* APPLICATION FORM */
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-md space-y-8 animate-fadeIn">
          <div className="border-b border-content-border pb-4">
            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-pink" />
              {t('volunteer.form_header', 'Volunteer Enrollment Application')}
            </h2>
            <p className="text-xs text-content-secondary mt-1">
              {t('volunteer.form_sub', 'Please select your exact primary role. This will be the official designation printed on your Volunteer Identity Badge.')}
            </p>
          </div>

          {/* Primary Role Selector (High Priority) */}
          <div className="bg-surface-soft p-4 sm:p-5 rounded-2xl border-2 border-brand-purple/20 space-y-2">
            <label className="text-xs font-extrabold text-brand-purple uppercase flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-brand-pink" />
              Primary Volunteer Role & Designation (Printed on ID Badge) <span className="text-rose-500">*</span>
            </label>
            <select
              value={primaryRole}
              onChange={(e) => setPrimaryRole(e.target.value)}
              className="w-full px-4 py-3 text-xs font-bold rounded-xl border border-brand-purple/40 bg-white text-content-primary focus:border-brand-purple outline-none shadow-sm"
            >
              {PRIMARY_VOLUNTEER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-content-secondary">
              This designation will be verified by the admin board and printed directly on your official Volunteer Identity Card.
            </p>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">
                {t('volunteer.full_name', 'Full Legal Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ishfaq Ahmad Ganai"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">
                {t('volunteer.email', 'Email Address')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="ishfaq.ganai@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">
                {t('volunteer.phone', 'Phone Number (WhatsApp Active)')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 94193 01319"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">
                {t('volunteer.blood_group', 'Blood Group (For Emergency First-Responders)')}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white font-mono"
              >
                <option value="A+">A+ (Positive)</option>
                <option value="A-">A- (Negative)</option>
                <option value="B+">B+ (Positive)</option>
                <option value="B-">B- (Negative)</option>
                <option value="AB+">AB+ (Positive)</option>
                <option value="AB-">AB- (Negative)</option>
                <option value="O+">O+ (Positive)</option>
                <option value="O-">O- (Negative)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">
                {t('volunteer.city', 'City / District / Tehsil')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Srinagar / Pulwama / Anantnag"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">
                {t('volunteer.country', 'Country of Residence')}
              </label>
              <input
                type="text"
                placeholder="India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>

          {/* Academic & Photo Section */}
          <div className="space-y-4 pt-4 border-t border-content-border">
            <h3 className="text-xs font-bold text-content-secondary uppercase flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-purple" />
              {t('volunteer.academic_sec', 'Academic Background & ID Photo')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary uppercase">Highest Qualification Level</label>
                <select
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white"
                >
                  <option value="Bachelor of Medicine / Surgery (MBBS / MD)">Bachelor of Medicine / Surgery (MBBS / MD)</option>
                  <option value="Bachelor of Technology (B.Tech / B.E.)">Bachelor of Technology (B.Tech / B.E.)</option>
                  <option value="Master of Science (M.Sc / M.Tech)">Master of Science (M.Sc / M.Tech)</option>
                  <option value="Bachelor of Arts / Science (B.A. / B.Sc / B.Com)">Bachelor of Arts / Science (B.A. / B.Sc / B.Com)</option>
                  <option value="Master of Business Administration (MBA / MSW)">Master of Business Administration (MBA / MSW)</option>
                  <option value="Higher Secondary (12th Grade)">Higher Secondary (12th Grade)</option>
                  <option value="Doctor of Philosophy (Ph.D)">Doctor of Philosophy (Ph.D)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary uppercase">Specialization / University</label>
                <input
                  type="text"
                  placeholder="e.g. Civil Engineering (NIT Srinagar)"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            {/* Photo & Resume Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary uppercase">Passport ID Photograph (Face Clear)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-purple/30 bg-surface-soft hover:bg-brand-purple/10 text-brand-purple text-xs font-bold transition-colors">
                    <Camera className="w-4 h-4 text-brand-pink" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {photoUrl && (
                    <div className="flex items-center gap-2">
                      <img src={photoUrl} alt="Preview" className="w-9 h-9 rounded-xl object-cover border border-brand-purple" />
                      <span className="text-[11px] text-emerald-600 font-bold">Photo Attached</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary uppercase">Curriculum Vitae / Resume (PDF)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-blue/30 bg-surface-soft hover:bg-brand-blue/10 text-brand-blue text-xs font-bold transition-colors">
                    <Upload className="w-4 h-4 text-brand-blue" />
                    <span>Attach CV</span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                  </label>
                  {resumeFile && (
                    <div className="flex items-center gap-1.5 text-[11px] text-content-primary truncate font-mono">
                      <FileText className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" />
                      <span className="truncate">{resumeFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Skills Checklist */}
          <div className="space-y-3 pt-4 border-t border-content-border">
            <label className="text-xs font-bold text-content-secondary uppercase block">
              {t('volunteer.skills_label', 'Additional Skills & Areas of Assistance')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-brand-purple bg-brand-purple/5 text-brand-purple font-bold shadow-sm'
                        : 'border-content-border hover:border-slate-300 text-content-secondary'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-brand-purple border-brand-purple text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Statement */}
          <div className="space-y-1.5 pt-4 border-t border-content-border">
            <label className="text-xs font-bold text-content-secondary uppercase">
              {t('volunteer.statement_label', 'Statement of Motivation')}
            </label>
            <textarea
              rows={3}
              placeholder="Why do you wish to join the Al Shujaiat Foundation Volunteer Network?"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-md"
          >
            <span>{t('volunteer.submit_btn', 'Submit Volunteer Application for Admin Review')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
