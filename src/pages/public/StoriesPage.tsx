import React from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

export const StoriesPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { stories } = useDatabase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Field Realities & Impact Stories
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Voices of Transformation Across Jammu & Kashmir
        </h1>
        <p className="text-content-secondary text-sm leading-relaxed">
          Behind every project metric is a family whose life was renewed through clean water, emergency heating, medical access, or education scholarships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stories.map((s) => (
          <article
            key={s.id}
            className="bg-white rounded-3xl border border-content-border overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-64 w-full">
                <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-brand-purple/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                  <span>{s.location}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center justify-between text-xs text-content-muted">
                  <span className="font-bold text-brand-pink uppercase tracking-wide">{s.beneficiaryName}</span>
                  <span className="flex items-center gap-1 font-mono"><Clock className="w-3 h-3" /> {s.readTime}</span>
                </div>

                <h2 className="text-xl font-extrabold text-content-primary hover:text-brand-purple transition-colors">
                  {s.title}
                </h2>

                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  {s.content}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <span className="text-xs text-content-muted font-mono">Published: {new Date(s.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
