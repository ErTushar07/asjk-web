import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProjectCard } from '../../components/project/ProjectCard';
import { Search, Filter } from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (route: string) => void;
  onOpenDonateModal: (projectId: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate, onOpenDonateModal }) => {
  const { projects } = useDatabase();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'funded'>('all');

  const categories = [
    'All',
    'Clean Water',
    'Education',
    'Healthcare',
    'Emergency Relief',
    'Orphan Sponsorship',
    'Winter Relief',
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.status === 'active') ||
      (statusFilter === 'funded' && (p.status === 'funded' || p.amountRaisedUSD >= p.fundingGoalUSD));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('projects.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('projects.title', 'Humanitarian Projects & Field Programs')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t('projects.subtitle', 'Every project is backed by verified ground data, measurable outcomes, and independent financial auditing. 100% of your gift reaches the chosen program.')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-content-border dark:border-slate-800 shadow-brand-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('projects.search_placeholder', 'Search projects or locations...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-800 text-content-primary focus:border-brand-purple outline-none"
          />
        </div>

        {/* Category & Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-purple text-white shadow-brand-sm'
                  : 'bg-surface-soft dark:bg-slate-800 text-content-secondary hover:bg-surface-card dark:hover:bg-slate-700 hover:text-content-primary'
              }`}
            >
              {t(cat, cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-content-border dark:border-slate-800">
          <p className="text-content-muted text-sm font-medium">
            {t('projects.no_match', 'No projects found matching your search criteria.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelectProject={(slug) => onNavigate(`/projects/${slug}`)}
              onDonateToProject={(id) => onOpenDonateModal(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
