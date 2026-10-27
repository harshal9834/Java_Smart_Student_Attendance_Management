import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  BellRing
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import type { DashboardMetrics, User } from '../../types';
import { api } from '../../services/api';

interface DashboardViewProps {
  user: User;
  onNavigate: (tab: string) => void;
  onBroadcastDefaulters: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onBroadcastDefaulters
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastSent, setBroadcastSent] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    try {
      await api.broadcastLowAttendance();
      setBroadcastSent(true);
      onBroadcastDefaulters();
      setTimeout(() => setBroadcastSent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading verified attendance aggregates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Institutional Academic Portal
              </span>
              <span className="text-xs text-slate-400">Semester 5 (2026-2027)</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white">
              Welcome back, {user.fullName}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Centralized attendance management with audit-verified records, dynamic check-in safeguards, and strict policy threshold calculations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {user.role !== 'STUDENT' && (
              <button
                onClick={() => onNavigate('take-attendance')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center space-x-2 transition-all active:scale-95"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Take Attendance</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/15 flex items-center space-x-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Defaulter Urgent Notice Banner if any */}
      {metrics.defaultersCount > 0 && user.role !== 'STUDENT' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                {metrics.defaultersCount} Students Below 75% Attendance Requirement
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                Students below the institutional threshold are barred from mid-term examinations under ordinance 4.2.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('low-attendance')}
              className="text-xs font-semibold px-3 py-1.5 bg-white text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors"
            >
              Review Defaulters
            </button>
            <button
              onClick={handleBroadcast}
              disabled={broadcastSent}
              className="text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-1.5"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{broadcastSent ? 'Alerts Dispatched!' : 'Send In-App Warnings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalStudents}</div>
            <span className="text-xs text-slate-500 flex items-center mt-1">
              Across {metrics.totalClasses} academic classes
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.todayOverallPercentage}%
            </div>
            <span className="text-xs text-emerald-600 flex items-center font-medium mt-1">
              {metrics.todayPresentCount} Present • {metrics.todayAbsentCount} Absent
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Defaulters (&lt;75%)</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{metrics.defaultersCount}</div>
            <span className="text-xs text-amber-700 flex items-center mt-1">
              Requires faculty attention
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Correction Disputes</span>
            <div className="text-2xl font-bold text-purple-600 mt-1">{metrics.pendingCorrectionsCount}</div>
            <span className="text-xs text-purple-700 flex items-center mt-1">
              Pending review & approval
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily Attendance Rate Trend (%)</h2>
              <p className="text-xs text-slate-500">Calculated over past 7 active academic days</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              Daily Aggregate
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Present Rate']}
                  labelFormatter={(label) => `Day: ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="presentPercentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Performance Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Class Performance</h2>
              <p className="text-xs text-slate-500">Average attendance percentage by batch</p>
            </div>
          </div>
          <div className="space-y-4">
            {metrics.classSummaries.map((cls, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cls.className}</span>
                  <span className={`font-bold ${cls.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {cls.attendancePercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cls.attendancePercentage >= 80
                        ? 'bg-emerald-500'
                        : cls.attendancePercentage >= 75
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, cls.attendancePercentage)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{cls.totalStudents} students</span>
                  {cls.defaultersCount > 0 ? (
                    <span className="text-amber-600 font-medium">{cls.defaultersCount} below 75%</span>
                  ) : (
                    <span className="text-emerald-600">All eligible</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attendance Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Attendance Sessions</h2>
            <p className="text-xs text-slate-500">Latest class sessions recorded with status and completion counts</p>
          </div>
          <button
            onClick={() => onNavigate('attendance-history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View All Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">Date & Period</th>
                <th className="py-3 px-4 font-semibold">Class & Section</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Faculty</th>
                <th className="py-3 px-4 font-semibold">Present / Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recentSessions.map((s) => {
                const totalMarked = s.presentCount + s.absentCount + s.lateCount + s.excusedCount;
                const completionPct = s.totalEligible > 0 ? Math.round((totalMarked / s.totalEligible) * 100) : 0;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.sessionDate}</div>
                      <div className="text-[11px] text-slate-500">Period {s.periodNumber} ({s.startTime || '09:00'})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{s.className}</div>
                      <div className="text-[11px] text-slate-500">{s.sectionName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{s.subjectName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.subjectCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{s.teacherName}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {s.presentCount} / {s.totalEligible}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {completionPct}% marked ({s.absentCount} abs, {s.lateCount} late)
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                          s.state === 'SUBMITTED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : s.state === 'LOCKED'
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : s.state === 'REOPENED'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {s.state}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('attendance-history')}
                        className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-medium transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
