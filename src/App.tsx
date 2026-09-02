import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DonationModal } from './components/donation/DonationModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeShortcutIndicator } from './components/common/ThemeShortcutIndicator';
import { ScrollToTop } from './components/common/ScrollToTop';

// 1. Code Splitting: Lazy-load all public pages
const HomePage = lazy(() => import('./pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const LeadershipPage = lazy(() => import('./pages/public/LeadershipPage').then((m) => ({ default: m.LeadershipPage })));
const OurWorkPage = lazy(() => import('./pages/public/OurWorkPage').then((m) => ({ default: m.OurWorkPage })));
const ProjectsPage = lazy(() => import('./pages/public/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailsPage = lazy(() => import('./pages/public/ProjectDetailsPage').then((m) => ({ default: m.ProjectDetailsPage })));
const CampaignsPage = lazy(() => import('./pages/public/CampaignsPage').then((m) => ({ default: m.CampaignsPage })));
const CampaignDetailsPage = lazy(() => import('./pages/public/CampaignDetailsPage').then((m) => ({ default: m.CampaignDetailsPage })));
const ImpactPage = lazy(() => import('./pages/public/ImpactPage').then((m) => ({ default: m.ImpactPage })));
const TransparencyPage = lazy(() => import('./pages/public/TransparencyPage').then((m) => ({ default: m.TransparencyPage })));
const StoriesPage = lazy(() => import('./pages/public/StoriesPage').then((m) => ({ default: m.StoriesPage })));
const NewsPage = lazy(() => import('./pages/public/NewsPage').then((m) => ({ default: m.NewsPage })));
const VolunteerPage = lazy(() => import('./pages/public/VolunteerPage').then((m) => ({ default: m.VolunteerPage })));
const MembershipPage = lazy(() => import('./pages/public/MembershipPage').then((m) => ({ default: m.MembershipPage })));
const PartnersPage = lazy(() => import('./pages/public/PartnersPage').then((m) => ({ default: m.PartnersPage })));
const DonatePage = lazy(() => import('./pages/public/DonatePage').then((m) => ({ default: m.DonatePage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then((m) => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/public/FAQPage').then((m) => ({ default: m.FAQPage })));
const LegalPage = lazy(() => import('./pages/public/LegalPages').then((m) => ({ default: m.LegalPage })));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-load donor pages
const AuthPage = lazy(() => import('./pages/donor/AuthPages').then((m) => ({ default: m.AuthPage })));
const DonorDashboardPage = lazy(() => import('./pages/donor/DonorDashboardPage').then((m) => ({ default: m.DonorDashboardPage })));
const MyDonationsPage = lazy(() => import('./pages/donor/MyDonationsPage').then((m) => ({ default: m.MyDonationsPage })));
const MyRecurringPage = lazy(() => import('./pages/donor/MyRecurringPage').then((m) => ({ default: m.MyRecurringPage })));
const MyReceiptsPage = lazy(() => import('./pages/donor/MyReceiptsPage').then((m) => ({ default: m.MyReceiptsPage })));
const DonorProfilePage = lazy(() => import('./pages/donor/DonorProfilePage').then((m) => ({ default: m.DonorProfilePage })));

// Lazy-load admin portal
const AdminPortal = lazy(() => import('./pages/admin/AdminPortal').then((m) => ({ default: m.AdminPortal })));
const AdminAuthGate = lazy(() => import('./pages/admin/AdminAuthGate').then((m) => ({ default: m.AdminAuthGate })));

// Smooth Skeleton Fallback Component for Suspense
const PageSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
    <div className="h-8 bg-surface-soft rounded-2xl w-48 mx-auto" />
    <div className="h-12 bg-surface-soft rounded-3xl w-3/4 max-w-xl mx-auto" />
    <div className="h-4 bg-surface-soft rounded-xl w-1/2 max-w-md mx-auto" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
      <div className="h-64 bg-surface-soft rounded-3xl border border-content-border/40" />
      <div className="h-64 bg-surface-soft rounded-3xl border border-content-border/40" />
      <div className="h-64 bg-surface-soft rounded-3xl border border-content-border/40" />
    </div>
  </div>
);

export const App: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user, isAdmin, twoFactorVerified } = useAuth();

  // Simple, robust client router that supports back/forward navigation and direct links
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateTargetProjectId, setDonateTargetProjectId] = useState<string | undefined>(undefined);
  const [donateTargetCampaignId, setDonateTargetCampaignId] = useState<string | undefined>(undefined);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDonateModal = (projectId?: string, campaignId?: string) => {
    setDonateTargetProjectId(projectId);
    setDonateTargetCampaignId(campaignId);
    setDonateModalOpen(true);
  };

  // Determine which page to render
  const renderCurrentPage = () => {
    // Admin Routes - Stealth protection: Completely hidden as 404 to the public
    if (currentRoute.startsWith('/admin')) {
      const isStaffKeyPresent =
        typeof window !== 'undefined' &&
        (window.location.search.includes('staff=asfjk') ||
          window.location.search.includes('access=staff') ||
          window.sessionStorage.getItem('asfjk_staff_gate_unlocked') === 'true');

      if (user && isAdmin && twoFactorVerified) {
        const parts = currentRoute.split('/');
        const tab = parts[2] || 'dashboard';
        return <AdminPortal initialTab={tab} onNavigate={navigate} />;
      }

      if (isStaffKeyPresent) {
        try {
          window.sessionStorage.setItem('asfjk_staff_gate_unlocked', 'true');
        } catch (e) {}
        return <AdminAuthGate onSuccess={() => navigate('/admin/dashboard')} onNavigate={navigate} />;
      }

      // Public visitors attempting to access /admin see standard 404 Page Not Found
      return <NotFoundPage onNavigate={navigate} />;
    }

    // Donor Routes
    if (currentRoute === '/login') return <AuthPage mode="login" onNavigate={navigate} />;
    if (currentRoute === '/register') return <AuthPage mode="register" onNavigate={navigate} />;
    if (currentRoute === '/forgot-password') return <AuthPage mode="forgot-password" onNavigate={navigate} />;
    if (currentRoute === '/dashboard')
      return <DonorDashboardPage onNavigate={navigate} onOpenDonateModal={() => handleOpenDonateModal()} />;
    if (currentRoute === '/donations') return <MyDonationsPage onNavigate={navigate} />;
    if (currentRoute === '/recurring-donations') return <MyRecurringPage onNavigate={navigate} />;
    if (currentRoute === '/receipts') return <MyReceiptsPage onNavigate={navigate} />;
    if (currentRoute === '/profile' || currentRoute === '/settings' || currentRoute === '/security') {
      return <DonorProfilePage onNavigate={navigate} />;
    }

    // Public Project & Campaign Details
    if (currentRoute.startsWith('/projects/')) {
      const slug = currentRoute.replace('/projects/', '');
      return <ProjectDetailsPage slug={slug} onNavigate={navigate} onOpenDonateModal={(id) => handleOpenDonateModal(id)} />;
    }
    if (currentRoute.startsWith('/campaigns/')) {
      const slug = currentRoute.replace('/campaigns/', '');
      return <CampaignDetailsPage slug={slug} onNavigate={navigate} onOpenDonateModal={(pId, cId) => handleOpenDonateModal(pId, cId)} />;
    }

    // Public Root & Catalogs
    if (currentRoute === '/about') return <AboutPage onNavigate={navigate} />;
    if (currentRoute === '/leadership') return <LeadershipPage onNavigate={navigate} />;
    if (currentRoute.startsWith('/leadership/')) {
      const slug = currentRoute.replace('/leadership/', '');
      return <LeadershipPage selectedSlug={slug} onNavigate={navigate} />;
    }
    if (currentRoute === '/our-work') return <OurWorkPage onNavigate={navigate} onOpenDonateModal={() => handleOpenDonateModal()} />;
    if (currentRoute === '/projects') return <ProjectsPage onNavigate={navigate} onOpenDonateModal={(id) => handleOpenDonateModal(id)} />;
    if (currentRoute === '/campaigns') return <CampaignsPage onNavigate={navigate} onOpenDonateModal={(pId, cId) => handleOpenDonateModal(pId, cId)} />;
    if (currentRoute === '/impact') return <ImpactPage onNavigate={navigate} />;
    if (currentRoute === '/transparency') return <TransparencyPage onNavigate={navigate} />;
    if (currentRoute === '/stories') return <StoriesPage onNavigate={navigate} />;
    if (currentRoute === '/news') return <NewsPage onNavigate={navigate} />;
    if (currentRoute === '/volunteer') return <VolunteerPage />;
    if (currentRoute === '/membership') return <MembershipPage />;
    if (currentRoute === '/partners') return <PartnersPage />;
    if (currentRoute === '/donate') return <DonatePage onNavigate={navigate} />;
    if (currentRoute === '/contact') return <ContactPage />;
    if (currentRoute === '/faq') return <FAQPage />;

    // Legal
    if (currentRoute === '/privacy') return <LegalPage type="privacy" />;
    if (currentRoute === '/terms') return <LegalPage type="terms" />;
    if (currentRoute === '/refund-policy') return <LegalPage type="refund-policy" />;
    if (currentRoute === '/donation-policy') return <LegalPage type="donation-policy" />;
    if (currentRoute === '/cookie-policy') return <LegalPage type="cookie-policy" />;

    // Root Home
    if (currentRoute === '/' || currentRoute === '') {
      return <HomePage onNavigate={navigate} onOpenDonateModal={handleOpenDonateModal} />;
    }

    // Unrecognized routes render 404
    return <NotFoundPage onNavigate={navigate} />;
  };

  const isAdminRoute = currentRoute.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col w-full max-w-full overflow-x-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {!isAdminRoute && (
        <Navbar
          onNavigate={navigate}
          currentRoute={currentRoute}
          onOpenDonateModal={() => handleOpenDonateModal()}
        />
      )}

      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-16 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            {renderCurrentPage()}
          </Suspense>
        </ErrorBoundary>
      </main>

      {!isAdminRoute && (
        <>
          <Footer onNavigate={navigate} />
          <MobileBottomNav
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenDonateModal={() => handleOpenDonateModal()}
          />
        </>
      )}

      {/* Global Modal Instance */}
      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        initialProjectId={donateTargetProjectId}
        initialCampaignId={donateTargetCampaignId}
        onNavigate={navigate}
      />

      {/* Global Theme Shortcut Indicator on all pages */}
      <ThemeShortcutIndicator />

      {/* Global Scroll-to-Top Floating Button */}
      <ScrollToTop />
    </div>
  );
};
