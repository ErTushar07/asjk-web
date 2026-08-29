import React from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

export const NewsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { news } = useDatabase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Media & Press Releases
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Latest News & Operational Bulletins
        </h1>
        <p className="text-content-secondary text-sm leading-relaxed">
          Stay informed on project inaugurations, winter logistics, and institutional initiatives conducted by Al Shujaiat Foundation Jammu & Kashmir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-3xl border border-content-border overflow-hidden shadow-brand-sm hover:shadow-brand-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-60 w-full">
                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-brand-pink text-white text-xs font-bold px-3 py-1 rounded-full shadow-pink-glow flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {item.category}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-4 text-xs text-content-muted">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-brand-purple" />
                    {item.author}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-content-primary hover:text-brand-purple transition-colors">
                  {item.title}
                </h2>

                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <span className="text-xs font-bold text-brand-purple">
                Al Shujaiat Foundation Jammu & Kashmir Official Release
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
