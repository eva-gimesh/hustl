import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TalentProvider } from './context/TalentContext';
import { FreelanceProvider } from './context/FreelanceContext';
import { RecruitProvider } from './context/RecruitContext';
import { TeamUpProvider } from './context/TeamUpContext';
import { CommunicationProvider } from './context/CommunicationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { FreelancePage } from './pages/FreelancePage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { RecruitPage } from './pages/RecruitPage';
import { RecruitOpportunitiesPage } from './pages/RecruitOpportunitiesPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { RecruitApplicationsPage } from './pages/RecruitApplicationsPage';
import { RecruitTalentPage } from './pages/RecruitTalentPage';
import { ManageCandidatesPage } from './pages/ManageCandidatesPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { TeamUpPage } from './pages/TeamUpPage';
import { DiscoverIdeasPage } from './pages/DiscoverIdeasPage';
import { IdeaDetailsPage } from './pages/IdeaDetailsPage';
import { CreateIdeaPage } from './pages/CreateIdeaPage';
import { TeamManagePage } from './pages/TeamManagePage';
import { TeamInvitationsPage } from './pages/TeamInvitationsPage';
import { ExplorePage } from './pages/ExplorePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { TalentPage } from './pages/TalentPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotificationSettingsPage } from './pages/NotificationSettingsPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <TalentProvider>
        <FreelanceProvider>
          <RecruitProvider>
            <TeamUpProvider>
              <CommunicationProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<AppShell />}>
                      {/* Public Brand Routes */}
                      <Route index element={<HomePage />} />
                      
                      {/* Freelance Marketplace Routes */}
                      <Route path="freelance" element={<FreelancePage />} />
                      <Route path="freelance/create" element={<CreateProjectPage />} />
                      <Route path="freelance/applications" element={<FreelancePage />} />
                      <Route path="freelance/my-projects" element={<FreelancePage />} />
                      <Route path="freelance/:projectId" element={<ProjectDetailsPage />} />
                      
                      {/* Recruitment & Hiring System Routes (Part 6) */}
                      <Route path="recruit" element={<RecruitPage />} />
                      <Route path="recruit/opportunities" element={<RecruitOpportunitiesPage />} />
                      <Route path="recruit/opportunities/:jobId" element={<JobDetailsPage />} />
                      <Route path="recruit/create" element={<CreateJobPage />} />
                      <Route path="recruit/applications" element={<RecruitApplicationsPage />} />
                      <Route path="recruit/talent" element={<RecruitTalentPage />} />
                      <Route path="recruit/manage/:jobId" element={<ManageCandidatesPage />} />
                      <Route path="company/:companyId" element={<CompanyProfilePage />} />

                      {/* TeamUp Co-Founder & Team Building Routes (Part 7) */}
                      <Route path="teamup" element={<TeamUpPage />} />
                      <Route path="teamup/discover" element={<DiscoverIdeasPage />} />
                      <Route path="teamup/ideas" element={<DiscoverIdeasPage />} />
                      <Route path="teamup/ideas/:ideaId" element={<IdeaDetailsPage />} />
                      <Route path="teamup/create" element={<CreateIdeaPage />} />
                      <Route path="teamup/teams/:teamId" element={<TeamManagePage />} />
                      <Route path="teamup/invitations" element={<TeamInvitationsPage />} />

                      {/* Explore Routes */}
                      <Route path="explore" element={<ExplorePage />} />
                      <Route path="talent" element={<TalentPage />} />

                      {/* Public Profile View Route */}
                      <Route path="profile/:userId" element={<ProfilePage />} />
                      <Route path="profile" element={<ProfilePage />} />

                      {/* Unified Communication Routes (Part 9) */}
                      <Route
                        path="messages"
                        element={
                          <ProtectedRoute requireOnboarded={false}>
                            <MessagesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="messages/:conversationId"
                        element={
                          <ProtectedRoute requireOnboarded={false}>
                            <MessagesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="notifications"
                        element={
                          <ProtectedRoute requireOnboarded={false}>
                            <NotificationsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="settings/notifications"
                        element={
                          <ProtectedRoute requireOnboarded={false}>
                            <NotificationSettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Authentication Routes */}
                      <Route path="login" element={<LoginPage />} />
                      <Route path="signup" element={<SignupPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />

                      {/* Onboarding Flow (Requires Authenticated Session) */}
                      <Route
                        path="onboarding"
                        element={
                          <ProtectedRoute requireOnboarded={false}>
                            <OnboardingPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected User Dashboard */}
                      <Route
                        path="dashboard"
                        element={
                          <ProtectedRoute requireOnboarded={true}>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch-all fallback */}
                      <Route path="*" element={<HomePage />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CommunicationProvider>
            </TeamUpProvider>
          </RecruitProvider>
        </FreelanceProvider>
      </TalentProvider>
    </AuthProvider>
  );
}
