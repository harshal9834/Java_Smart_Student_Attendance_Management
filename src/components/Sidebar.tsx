import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  History,
  QrCode,
  BarChart3,
  AlertOctagon,
  FileEdit,
  ClipboardList,
  Settings,
  Code2,
  CalendarDays
} from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  pendingCorrectionsCount: number;
  defaultersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  pendingCorrectionsCount,
  defaultersCount
}) => {
  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    roles: UserRole[];
    badge?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']
    },
    {
      id: 'take-attendance',
      label: 'Take Attendance',
      icon: <CalendarCheck className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER']
    },
    {
      id: 'attendance-history',
      label: 'Attendance History',
      icon: <History className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER']
    },
    {
      id: 'qr-attendance',
      label: userRole === 'STUDENT' ? 'QR Check-In' : 'Smart QR Session',
      icon: <QrCode className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']
    },
    {
      id: 'students',
      label: 'Students Roster',
      icon: <Users className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER']
    },
    {
      id: 'student-profile',
      label: 'My Attendance Records',
      icon: <GraduationCap className="w-4 h-4" />,
      roles: ['STUDENT']
    },
    {
      id: 'teachers',
      label: 'Teachers & Faculty',
      icon: <GraduationCap className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      id: 'academics',
      label: 'Academics & Timetable',
      icon: <CalendarDays className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER']
    },
    {
      id: 'low-attendance',
      label: 'Defaulters (<75%)',
      icon: <AlertOctagon className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
      badge: defaultersCount,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200'
    },
    {
      id: 'corrections',
      label: 'Dispute / Corrections',
      icon: <FileEdit className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'],
      badge: pendingCorrectionsCount,
      badgeColor: 'bg-blue-100 text-blue-800 border border-blue-200'
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail',
      icon: <ClipboardList className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      id: 'settings',
      label: 'Institution Rules',
      icon: <Settings className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      id: 'backend-docs',
      label: 'Java Spring Architecture',
      icon: <Code2 className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 border-b border-slate-800/80">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Academic Management
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400">Spring Boot + MySQL</span>
          <span className="text-emerald-400 font-mono">v1.0-LTS</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Role-Enforced • Flyway Migrated • Audited
        </p>
      </div>
    </aside>
  );
};
