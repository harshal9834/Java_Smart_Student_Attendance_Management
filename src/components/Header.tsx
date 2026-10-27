import React, { useState } from 'react';
import {
  Bell,
  Shield,
  UserCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Layers,
  Check
} from 'lucide-react';
import type { User, UserRole, NotificationItem } from '../types';

interface HeaderProps {
  user: User;
  onSwitchRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSwitchRole,
  notifications,
  onMarkNotificationRead,
  onNavigate
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleLabels: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Shield className="w-3.5 h-3.5" /> },
    ADMIN: { label: 'Admin', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Shield className="w-3.5 h-3.5" /> },
    TEACHER: { label: 'Faculty / Teacher', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <UserCheck className="w-3.5 h-3.5" /> },
    STUDENT: { label: 'Student', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <GraduationCap className="w-3.5 h-3.5" /> }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Institution Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">SmartAttend</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">Enterprise</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Apex Institute of Technology & Engineering</p>
            </div>
          </div>

          {/* Quick Role Switcher Banner */}
          <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 space-x-1">
            <span className="text-xs font-semibold text-slate-500 px-2 flex items-center">
              Role Preview:
            </span>
            {(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] as UserRole[]).map((r) => {
              const active = user.role === r;
              return (
                <button
                  key={r}
                  onClick={() => onSwitchRole(r)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                    active
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {roleLabels[r].icon}
                  <span>{r === 'SUPER_ADMIN' ? 'Super Admin' : r === 'TEACHER' ? 'Faculty' : r.charAt(0) + r.slice(1).toLowerCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Right Actions: Notifications & Profile */}
          <div className="flex items-center space-x-3">
            {/* System Status Pill */}
            <div
              onClick={() => onNavigate('backend-docs')}
              className="cursor-pointer hidden lg:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              title="Click to view full Java Spring Boot & MySQL architecture"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Server className="w-3.5 h-3.5" />
              <span className="font-medium">Java Spring Boot Core</span>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors hover:bg-slate-50 flex items-start space-x-3 ${
                            !n.isRead ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                            {n.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="text-slate-400 hover:text-blue-600 p-1"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Capsule */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-none">{user.fullName}</p>
                <span className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleLabels[user.role].color}`}>
                  {roleLabels[user.role].label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
