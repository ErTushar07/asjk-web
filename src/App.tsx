import React, { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DonationModal } from './components/donation/DonationModal';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { OurWorkPage } from './pages/public/OurWorkPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailsPage } from './pages/public/ProjectDetailsPage';
import { CampaignsPage } from './pages/public/CampaignsPage';
import { CampaignDetailsPage } from './pages/public/CampaignDetailsPage';
import { ImpactPage } from './pages/public/ImpactPage';
import { TransparencyPage } from './pages/public/TransparencyPage';
import { StoriesPage } from './pages/public/StoriesPage';
import { NewsPage } from './pages/public/NewsPage';
import { VolunteerPage } from './pages/public/VolunteerPage';
import { MembershipPage } from './pages/public/MembershipPage';
import { PartnersPage } from './pages/public/PartnersPage';
import { DonatePage } from './pages/public/DonatePage';
import { ContactPage } from './pages/public/ContactPage';
import { FAQPage } from './pages/public/FAQPage';
import { LegalPage } from './pages/public/LegalPages';

// Donor Pages
import { AuthPage } from './pages/donor/AuthPages';
import { DonorDashboardPage } from './pages/donor/DonorDashboardPage';
import { MyDonationsPage } from './pages/donor/MyDonationsPage';
import { MyRecurringPage } from './pages/donor/MyRecurringPage';
import { MyReceiptsPage } from './pages/donor/MyReceiptsPage';
import { DonorProfilePage } from './pages/donor/DonorProfilePage';

// Admin Portal
import { AdminPortal } from './pages/admin/AdminPortal';
import { AdminAuthGate } from './pages/admin/AdminAuthGate';

export const App: React.FC = () => {
  const { currentLanguage, isRTL } = useLanguage();
  const { user, isAdmin, twoFactorVerified, role } = useAuth();

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
    // Admin Routes - Strictly protected by Defense-in-Depth Authentication Gate
    if (currentRoute.startsWith('/admin')) {
      if (!user || !isAdmin || !twoFactorVerified) {
        return <AdminAuthGate onSuccess={() => navigate('/admin/dashboard')} onNavigate={navigate} />;
      }
      const parts = currentRoute.split('/');
      const tab = parts[2] || 'dashboard';
      return <AdminPortal initialTab={tab} onNavigate={navigate} />;
    }

    // Donor Routes
    if (currentRoute === '/login') return <AuthPage mode="login" onNavigate={navigate} />;
    if (currentRoute === '/register') return <AuthPage mode="register" onNavigate={navigate} />;
    if (currentRoute === '/forgot-password') return <AuthPage mode="forgot-password" onNavigate={navigate} />;
    if (currentRoute === '/dashboard') return <DonorDashboardPage onNavigate={navigate} onOpenDonateModal={() => handleOpenDonateModal()} />;
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

    // Default Home
    return <HomePage onNavigate={navigate} onOpenDonateModal={handleOpenDonateModal} />;
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

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {renderCurrentPage()}
      </main>

      {!isAdminRoute && <Footer onNavigate={navigate} />}

      {/* Global Modal Instance */}
      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        initialProjectId={donateTargetProjectId}
        initialCampaignId={donateTargetCampaignId}
        onNavigate={navigate}
      />
    </div>
  );
};
