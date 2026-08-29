import React from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Users, Droplets, GraduationCap, HeartHandshake, Activity, Home, CheckCircle2 } from 'lucide-react';

export const ImpactPage: React.FC<{ onNavigate: (route: string) => void }> = () => {
  const { impactMetrics } = useDatabase();

  const iconMap: Record<string, any> = {
    Users,
    Droplets,
    GraduationCap,
    HeartHandshake,
    Activity,
    Home,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Al Shujaiat Foundation · Jammu & Kashmir
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Quantifiable Impact & Sustainable Transformation
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          We measure our success not simply in funds raised, but in verifiable metrics: liters of clean water pumped, classrooms digitalized, patients treated, and families sheltered.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {impactMetrics.map((m) => {
          const Icon = iconMap[m.iconName] || Users;
          return (
            <div
              key={m.id}
              className="bg-white rounded-3xl border border-content-border p-8 shadow-brand-sm hover:shadow-brand-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-soft flex items-center justify-center text-brand-purple">
                  <Icon className="w-6 h-6 text-brand-pink" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-brand-purple flex items-baseline flex-wrap">
                  <span>{m.value.toLocaleString()}</span>
                  <span className="text-brand-pink text-2xl sm:text-3xl font-extrabold ml-1">
                    {m.unit && !['Units', 'Children', 'Meals', 'Patients', 'Villages'].includes(m.unit) ? m.unit : '+'}
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-content-primary">{m.label}</h4>
                <p className="text-xs text-content-secondary leading-relaxed">{m.description}</p>
              </div>

              <div className="pt-3 border-t border-content-border/60 flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Field Verified in J&K</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sustainable Development Goals */}
      <div className="bg-surface-card rounded-3xl p-8 sm:p-12 border border-content-border space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">
            Global Development Alignment
          </span>
          <h3 className="text-2xl font-extrabold text-content-primary">
            Aligned with United Nations Sustainable Development Goals (SDGs)
          </h3>
          <p className="text-xs text-content-secondary">
            Our programs in Jammu & Kashmir directly support global targets for clean water, zero hunger, good health, and quality education.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-content-primary">
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1">
            <span className="text-brand-pink font-mono block text-sm">SDG 6</span>
            <span>Clean Water & Sanitation</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1">
            <span className="text-brand-purple font-mono block text-sm">SDG 4</span>
            <span>Quality Education</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1">
            <span className="text-brand-blue font-mono block text-sm">SDG 3</span>
            <span>Good Health & Well-being</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-content-border space-y-1">
            <span className="text-brand-orange font-mono block text-sm">SDG 1 & 2</span>
            <span>No Poverty & Zero Hunger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
