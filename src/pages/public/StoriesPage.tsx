import React from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

export const StoriesPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { stories } = useDatabase();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('stories.badge', 'Field Realities & Impact Stories')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('stories.title', 'Voices of Transformation Across Jammu & Kashmir')}
        </h1>
        <p className="text-content-secondary text-sm leading-relaxed">
          {t('stories.subtitle', 'Behind every project metric is a family whose life was renewed through clean water, emergency heating, medical access, or education scholarships.')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
        {stories.map((s) => (
          <article
            key={s.id}
            className="bg-white rounded-2xl sm:rounded-3xl border border-content-border overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all flex flex-col justify-between min-w-0"
          >
            <div>
              <div className="relative h-32 sm:h-64 w-full">
                <img src={s.coverImage} alt={s.title} loading="lazy" width="600" height="350" className="w-full h-full object-cover" />
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-brand-purple/90 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-pink" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{s.location}</span>
                </div>
              </div>

              <div className="p-3 sm:p-8 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-content-muted">
                  <span className="font-bold text-brand-pink uppercase tracking-wide truncate max-w-[100px]">{s.beneficiaryName}</span>
                  <span className="flex items-center gap-0.5 font-mono"><Clock className="w-2.5 h-2.5" /> {s.readTime}</span>
                </div>

                <h2 className="text-xs sm:text-xl font-bold sm:font-extrabold text-content-primary hover:text-brand-purple transition-colors line-clamp-2">
                  {s.title}
                </h2>

                <p className="text-[10px] sm:text-sm text-content-secondary leading-relaxed line-clamp-3">
                  {s.content}
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-8 pt-0">
              <span className="text-[9px] sm:text-xs text-content-muted font-mono">
                {new Date(s.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
