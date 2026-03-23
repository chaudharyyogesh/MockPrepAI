import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import InterviewFeedbackPage from './pages/InterviewFeedbackPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <InterviewSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/room/:id"
          element={
            <ProtectedRoute>
              <InterviewRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/feedback/:id"
          element={
            <ProtectedRoute>
              <InterviewFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/history"
          element={
            <ProtectedRoute>
              <InterviewHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;

