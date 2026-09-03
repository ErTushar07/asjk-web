import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { MapPin, Clock, ArrowRight, Search, MessageCircle, Twitter, Link as LinkIcon, Check } from 'lucide-react';

export const StoriesPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  usePageMeta('Impact Stories', 'Read inspiring transformation stories from families, students, and communities across Jammu & Kashmir.');
  const { stories } = useDatabase();
  const { t } = useLanguage();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, []);

  const filteredStories = stories.filter((s) => {
    return (
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.beneficiaryName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleShareWhatsApp = (s: typeof stories[0]) => {
    const url = `${window.location.origin}/stories#story-${s.id}`;
    const text = encodeURIComponent(`Read this transformation story from Kashmir: "${s.title}"\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTwitter = (s: typeof stories[0]) => {
    const url = `${window.location.origin}/stories#story-${s.id}`;
    const text = encodeURIComponent(`Read this inspiring impact story from Al Shujaiat Foundation: "${s.title}"`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyLink = (s: typeof stories[0]) => {
    const url = `${window.location.origin}/stories#story-${s.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(s.id);
    toast.success('Story link copied to clipboard!', 'Link Copied');
    setTimeout(() => {
      setCopiedId((prev) => (prev === s.id ? null : prev));
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
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

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search transformation stories by name, village, or impact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-900 text-content-primary focus:border-brand-purple outline-none shadow-brand-sm"
        />
      </div>

      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-content-border dark:border-slate-800">
          <p className="text-content-muted text-sm font-medium">
            No impact stories found matching "{search}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
          {filteredStories.map((s) => (
            <article
              key={s.id}
              id={`story-${s.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-content-border dark:border-slate-800 overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all flex flex-col justify-between min-w-0"
            >
              <div>
                <div className="relative h-32 sm:h-64 w-full">
                  <img src={s.coverImage} alt={s.title} loading="lazy" width="600" height="350" className="w-full h-full object-cover" />
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-brand-purple/90 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-pink" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{t(`story.${s.id}.location`, s.location)}</span>
                  </div>
                </div>

                <div className="p-3 sm:p-8 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-content-muted">
                    <span className="font-bold text-brand-pink uppercase tracking-wide truncate max-w-[100px]">
                      {t(`story.${s.id}.beneficiary`, s.beneficiaryName)}
                    </span>
                    <span className="flex items-center gap-0.5 font-mono"><Clock className="w-2.5 h-2.5" /> {s.readTime}</span>
                  </div>

                  <h2 className="text-xs sm:text-xl font-bold sm:font-extrabold text-content-primary hover:text-brand-purple dark:hover:text-purple-300 transition-colors line-clamp-2">
                    {t(`story.${s.id}.title`, s.title)}
                  </h2>

                  <p className="text-[10px] sm:text-sm text-content-secondary leading-relaxed line-clamp-3">
                    {t(`story.${s.id}.summary`, s.summary)}
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-8 pt-0 flex items-center justify-between border-t border-content-border/60 dark:border-slate-800/80 mt-2">
                <span className="text-[9px] sm:text-xs text-content-muted font-mono">
                  {new Date(s.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>

                {/* Social Share Buttons for each story */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(s)}
                    title="Share on WhatsApp"
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareTwitter(s)}
                    title="Share on X"
                    className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 hover:bg-sky-100 transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(s)}
                    title="Copy Story Link"
                    className="p-1.5 rounded-lg bg-surface-soft dark:bg-slate-800 text-content-secondary hover:text-brand-purple transition-colors"
                  >
                    {copiedId === s.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <LinkIcon className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
