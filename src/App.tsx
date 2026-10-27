import React, { useState, useEffect } from 'react';
import type { User, UserRole, NotificationItem } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './features/dashboard/DashboardView';
import { TakeAttendanceView } from './features/attendance/TakeAttendanceView';
import { AttendanceHistoryView } from './features/attendance/AttendanceHistoryView';
import { QrAttendanceView } from './features/attendance/QrAttendanceView';
import { StudentsView } from './features/students/StudentsView';
import { StudentProfileView } from './features/students/StudentProfileView';
import { TeachersView } from './features/teachers/TeachersView';
import { AcademicsView } from './features/academics/AcademicsView';
import { ReportsView } from './features/reports/ReportsView';
import { CorrectionsView } from './features/corrections/CorrectionsView';
import { AuditLogsView } from './features/audit/AuditLogsView';
import { SettingsView } from './features/settings/SettingsView';
import { BackendDocsView } from './features/backend-docs/BackendDocsView';

export function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-admin',
    email: 'admin@aite.edu',
    fullName: 'Prof. Sarah Jenkins (Admin)',
    role: 'ADMIN',
    isActive: true,
    institutionId: 'inst-1'
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingCorrectionsCount, setPendingCorrectionsCount] = useState<number>(1);
  const [defaultersCount, setDefaultersCount] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndNotifs();
  }, []);

  const loadUserAndNotifs = async () => {
    try {
      setLoading(true);
      const [authData, notifList, analytics] = await Promise.all([
        api.getMe(),
        api.getNotifications(),
        api.getAnalytics()
      ]);
      setCurrentUser(authData.user);
      setNotifications(notifList);
      setPendingCorrectionsCount(analytics.pendingCorrectionsCount);
      setDefaultersCount(analytics.defaultersCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (role: UserRole) => {
    try {
      const res = await api.switchRole(role);
      setCurrentUser(res.user);

      // Navigate to sensible default tab for that role
      if (role === 'STUDENT') {
        setCurrentTab('student-profile');
      } else if (role === 'TEACHER') {
        setCurrentTab('take-attendance');
      } else {
        setCurrentTab('dashboard');
      }

      // Refresh notifications & metrics
      const [notifList, analytics] = await Promise.all([
        api.getNotifications(),
        api.getAnalytics()
      ]);
      setNotifications(notifList);
      setPendingCorrectionsCount(analytics.pendingCorrectionsCount);
      setDefaultersCount(analytics.defaultersCount);
    } catch (err) {
      console.error('Role switch failed', err);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const refreshMetrics = async () => {
    try {
      const [analytics, notifList] = await Promise.all([
        api.getAnalytics(),
        api.getNotifications()
      ]);
      setPendingCorrectionsCount(analytics.pendingCorrectionsCount);
      setDefaultersCount(analytics.defaultersCount);
      setNotifications(notifList);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        user={currentUser}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotifRead}
        onNavigate={setCurrentTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={currentUser.role}
          pendingCorrectionsCount={pendingCorrectionsCount}
          defaultersCount={defaultersCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              user={currentUser}
              onNavigate={setCurrentTab}
              onBroadcastDefaulters={refreshMetrics}
            />
          )}

          {currentTab === 'take-attendance' && (
            <TakeAttendanceView
              user={currentUser}
              onNavigate={setCurrentTab}
              onSessionSubmitted={refreshMetrics}
            />
          )}

          {currentTab === 'attendance-history' && (
            <AttendanceHistoryView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'qr-attendance' && (
            <QrAttendanceView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'student-profile' && (
            <StudentProfileView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'teachers' && (
            <TeachersView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'academics' && (
            <AcademicsView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'low-attendance' && (
            <ReportsView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'corrections' && (
            <CorrectionsView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'audit-logs' && (
            <AuditLogsView
              user={currentUser}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'backend-docs' && (
            <BackendDocsView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
