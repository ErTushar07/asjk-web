import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ShieldCheck, Heart, Users, MapPin, Award, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const leadershipTeam = [
    {
      name: 'Mohd Amin Ganai',
      role: 'Executive Director',
      bio: 'Visionary leadership directing humanitarian initiatives, community development, and emergency relief operations across Jammu & Kashmir.'
    },
    {
      name: 'James Anderson',
      role: 'International Programs Director',
      bio: 'Oversees international donor alignment, cross-border development partnerships, and sustainable infrastructure programs.'
    },
    {
      name: 'Michael Carter',
      role: 'Finance Director',
      bio: 'Chartered financial specialist managing statutory compliance, independent audit integrity, and 100% financial transparency.'
    },
    {
      name: 'Sarah Mitchell',
      role: 'Operations Director',
      bio: 'Manages rapid response logistics, mountain disaster relief dispatch, and strategic reserve warehouses.'
    },
    {
      name: 'Emily Carter',
      role: 'Communications Director',
      bio: 'Leads public relations, field reporting, educational advocacy, and global stakeholder engagement.'
    },
    {
      name: 'Daniel Wilson',
      role: 'Project Manager',
      bio: 'Senior engineer coordinating groundwater surveys, solar filtration installations, and community water committees.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          About Al Shujaiat Foundation · Jammu & Kashmir
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Dedicated to Human Dignity & Sustainable Development
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          Founded in Srinagar, Al Shujaiat Foundation Jammu & Kashmir is a non-profit registered charitable trust working relentlessly across the Himalayan valley to alleviate poverty, deliver clean drinking water, educate children, and provide emergency disaster relief.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-brand-purple text-white p-8 sm:p-10 rounded-3xl space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-brand-pink fill-brand-pink" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">Our Mission</h3>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            To empower impoverished and disaster-vulnerable communities in Jammu & Kashmir through sustainable clean water access, world-class digital education, comprehensive child sponsorship, and rapid humanitarian disaster response.
          </p>
        </div>

        <div className="bg-surface-highlight text-content-primary p-8 sm:p-10 rounded-3xl border border-brand-blue/30 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-brand-purple" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-brand-purple">Our Vision</h3>
          <p className="text-content-secondary text-xs sm:text-sm leading-relaxed">
            A thriving, self-reliant Jammu & Kashmir where every child has access to quality schooling, every remote village has safe drinking water, and no family is left without warmth or survival support during winter crises.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <h2 className="text-2xl font-extrabold text-content-primary text-center">Our Core Operating Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: '100% Transparency', desc: 'Every rupee and dollar is audited by independent licensed chartered accountants.' },
            { title: 'Human Dignity', desc: 'Aid is delivered with respect and compassion, upholding beneficiary privacy.' },
            { title: 'Local Empowerment', desc: 'Villagers and youth committees are trained to maintain long-term infrastructure.' },
            { title: 'Rapid Response', desc: '24/7 disaster readiness teams deploy emergency aid within hours of any calamity.' },
          ].map((v, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-content-border space-y-2 shadow-brand-sm">
              <CheckCircle2 className="w-5 h-5 text-brand-pink" />
              <h4 className="font-bold text-sm text-content-primary">{v.title}</h4>
              <p className="text-xs text-content-secondary leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership & Staff Structure */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-pink uppercase tracking-wider block">
            Executive Governance
          </span>
          <h2 className="text-2xl font-extrabold text-content-primary">
            Leadership & Organizational Team
          </h2>
          <p className="text-xs text-content-secondary">
            Demonstration organizational profiles representing executive and program management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leadershipTeam.map((l, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-content-border text-center space-y-3 shadow-brand-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-brand-purple/10 mx-auto flex items-center justify-center text-brand-purple font-black text-lg">
                  {l.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-content-primary">{l.name}</h4>
                  <p className="text-xs font-bold text-brand-pink">{l.role}</p>
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">{l.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Credentials */}
      <div className="bg-surface-soft p-8 rounded-3xl border border-content-border space-y-4">
        <h3 className="font-extrabold text-base text-brand-purple flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-pink" /> Legal & Statutory Registrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-content-secondary font-mono">
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">NITI Aayog NGO-DARPAN</span>
            <span className="font-bold text-content-primary">JK/2018/0190361</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">Income Tax 80G</span>
            <span className="font-bold text-content-primary">AACTA8920E/80G/2021-22</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">FCRA Compliance</span>
            <span className="font-bold text-content-primary">FCRA-083420194</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-content-border">
            <span className="text-[10px] text-content-muted block uppercase">Section 12A</span>
            <span className="font-bold text-content-primary">Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
