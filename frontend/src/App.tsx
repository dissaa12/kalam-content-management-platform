import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ColorModeProvider } from './hooks/useColorMode';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { PublicLayout } from './layouts/PublicLayout';

import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';

// Public Marketing Pages
import { PublicHome } from './pages/public/PublicHome';
import { PublicAbout } from './pages/public/PublicAbout';
import { PublicBlog } from './pages/public/PublicBlog';
import { PublicBlogDetails } from './pages/public/PublicBlogDetails';
import { PublicCampaignDetails } from './pages/public/PublicCampaignDetails';
import { PublicContact } from './pages/public/PublicContact';

// CMS Admin Portal Pages
import { Dashboard } from './pages/Dashboard';
import { ContentList } from './pages/ContentList';
import { ContentCreate } from './pages/ContentCreate';
import { ContentEdit } from './pages/ContentEdit';
import { ContentReview } from './pages/ContentReview';
import { Campaigns } from './pages/Campaigns';
import { Calendar } from './pages/Calendar';
import { MediaLibrary } from './pages/MediaLibrary';
import { Analytics } from './pages/Analytics';
import { AIAssistant } from './pages/AIAssistant';
import { Users } from './pages/Users';
import { Categories } from './pages/Categories';
import { Tags } from './pages/Tags';
import { ActivityLogs } from './pages/ActivityLogs';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <ColorModeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Marketing Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHome />} />
              <Route path="/about" element={<PublicAbout />} />
              <Route path="/blog" element={<PublicBlog />} />
              <Route path="/blog/:slug" element={<PublicBlogDetails />} />
              <Route path="/campaigns/:id" element={<PublicCampaignDetails />} />
              <Route path="/contact" element={<PublicContact />} />
            </Route>

            {/* Public Unauthenticated Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected CMS Admin Portal Workspace Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />

                {/* Content & Editorial */}
                <Route path="/content" element={<ContentList />} />
                <Route path="/content/new" element={<ContentCreate />} />
                <Route path="/content/edit/:id" element={<ContentEdit />} />
                <Route path="/content/review/:id" element={<ContentReview />} />
                <Route path="/calendar" element={<Calendar />} />

                {/* Role Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'marketing_manager', 'content_editor', 'content_author']} />}>
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/admin-campaigns" element={<Navigate to="/campaigns" replace />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin', 'marketing_manager', 'content_editor']} />}>
                  <Route path="/media" element={<MediaLibrary />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/tags" element={<Tags />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin', 'marketing_manager', 'content_author', 'content_editor']} />}>
                  <Route path="/ai-assistant" element={<AIAssistant />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/users" element={<Users />} />
                  <Route path="/activity" element={<ActivityLogs />} />
                </Route>

                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ColorModeProvider>
  );
};
