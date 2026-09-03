import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Calendar, User, ArrowRight, Tag, Search } from 'lucide-react';

export const NewsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  usePageMeta('News & Press Releases', 'Stay informed on project inaugurations, winter relief logistics, and field operations across Jammu & Kashmir.');
  const { news } = useDatabase();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredNews = news.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('news.badge', 'Media & Press Releases')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('news.title', 'Latest News & Operational Bulletins')}
        </h1>
        <p className="text-content-secondary text-sm leading-relaxed">
          {t('news.subtitle', 'Stay informed on project inaugurations, winter logistics, and institutional initiatives conducted by Al Shujaiat Foundation Jammu & Kashmir.')}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          aria-label="Search news bulletins, topics, or authors"
          placeholder="Search news bulletins, topics, or authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-900 text-content-primary focus:border-brand-purple outline-none shadow-brand-sm"
        />
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-content-border dark:border-slate-800">
          <p className="text-content-muted text-sm font-medium">
            No bulletins found matching "{search}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-content-border dark:border-slate-800 overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all flex flex-col justify-between min-w-0"
            >
              <div>
                <div className="relative h-32 sm:h-60 w-full">
                  <img src={item.coverImage} alt={item.title} loading="lazy" width="600" height="350" className="w-full h-full object-cover" />
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-brand-pink text-white text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-pink-glow flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {t(item.category, item.category)}
                  </div>
                </div>

                <div className="p-3 sm:p-8 space-y-2 sm:space-y-3">
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-4 text-[9px] sm:text-xs text-content-muted">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {new Date(item.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 font-medium truncate max-w-[100px] sm:max-w-none">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-purple dark:text-purple-400" />
                      {t(`news.${item.id}.author`, item.author)}
                    </span>
                  </div>

                  <h2 className="text-xs sm:text-xl font-bold sm:font-extrabold text-content-primary hover:text-brand-purple dark:hover:text-purple-300 transition-colors line-clamp-2">
                    {t(`news.${item.id}.title`, item.title)}
                  </h2>

                  <p className="text-[10px] sm:text-sm text-content-secondary leading-relaxed line-clamp-3">
                    {t(`news.${item.id}.content`, item.content)}
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-8 pt-0">
                <span className="text-[9px] sm:text-xs font-bold text-brand-purple dark:text-purple-400 truncate block">
                  {t('news.official_release', 'Official Release')}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
