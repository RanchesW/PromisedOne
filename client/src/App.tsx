import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, UserRole } from './contexts/AuthContext';
import { RouteTransitionProvider } from './contexts/RouteTransitionContext';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RouteTransitionWrapper from './components/UI/RouteTransitionWrapper';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import GamesPage from './pages/Games/GamesPage';
import GameDetailPage from './pages/Games/GameDetailPage';
import JoinCampaignPage from './pages/Games/JoinCampaignPage';
import GameMastersPage from './pages/GameMasters/GameMastersPage';
import GameSystemsPage from './pages/GameSystems/GameSystemsPage';
import PlatformsPage from './pages/Platforms/PlatformsPage';

// Protected Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import PublicProfilePage from './pages/Profile/PublicProfilePage';
import CreateGamePage from './pages/Games/CreateGamePage';
import MyGamesPage from './pages/Games/MyGamesPage';
import BookingsPage from './pages/Bookings/BookingsPage';
import MessagesPage from './pages/Messages/MessagesPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import BecomeGM from './pages/BecomeGM/BecomeGM';
import ApplicationConfirmation from './pages/BecomeGM/ApplicationConfirmation';

// Admin Pages
import AdminLayout from './components/Admin/AdminLayout';
import AdminOverview from './pages/Admin/AdminOverview';
import GMApplications from './pages/Admin/GMApplications';
import Users from './pages/Admin/Users';
import Games from './pages/Admin/Games';
import SystemNotifications from './pages/Admin/SystemNotifications';
import Settings from './pages/Admin/Settings';

// Components
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <RouteTransitionProvider>
        <RouteTransitionWrapper>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="games/:id" element={<GameDetailPage />} />
            <Route path="games/:id/join" element={<JoinCampaignPage />} />
            <Route path="games/:id/edit" element={<CreateGamePage />} />
            <Route path="find-game-masters" element={<GameMastersPage />} />
            <Route path="game-systems" element={<GameSystemsPage />} />
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="profile/:userId" element={<PublicProfilePage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/public" element={<PublicProfilePage />} />
              <Route path="settings/profile" element={<ProfilePage />} />
              <Route path="settings/featured-prompts" element={<ProfilePage />} />
              <Route path="settings/payment" element={<ProfilePage />} />
              <Route path="settings/refer-a-friend" element={<ProfilePage />} />
              <Route path="settings/notifications" element={<ProfilePage />} />
              <Route path="settings/privacy" element={<ProfilePage />} />
              <Route path="settings/social-login" element={<ProfilePage />} />
              <Route path="my-games" element={<MyGamesPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="become-gm" element={<BecomeGM />} />
              <Route path="become-gm/confirmation" element={<ApplicationConfirmation />} />
            </Route>
            
            {/* Dashboard redirect - redirect to games */}
            <Route path="dashboard" element={<Navigate to="/games" replace />} />
            
            {/* GM Routes */}
            <Route element={<ProtectedRoute roles={[UserRole.APPROVED_GM]} />}>
              <Route path="create-game" element={<CreateGamePage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute roles={[UserRole.ADMIN]} />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="gm-applications" element={<GMApplications />} />
                <Route path="users" element={<Users />} />
                <Route path="games" element={<Games />} />
                <Route path="notifications" element={<SystemNotifications />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-fantasy font-bold text-orange-500 mb-4">404</h1>
                  <p className="text-xl text-slate-400 mb-8">Page not found</p>
                  <a 
                    href="/" 
                    className="btn-primary"
                  >
                    Return Home
                  </a>
                </div>
              </div>
            </Layout>
          } />
        </Routes>
        </RouteTransitionWrapper>
      </RouteTransitionProvider>
    </div>
  );
}

export default App;
