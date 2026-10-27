import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import type { User, Student, AttendanceRecord } from '../../types';
import { api } from '../../services/api';

interface StudentProfileViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ user, onNavigate }) => {
  const [data, setData] = useState<{
    student: Student;
    stats: any;
    records: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRecords();
  }, [user]);

  const loadMyRecords = async () => {
    try {
      setLoading(true);
      const studentId = user.studentId || 'std-1';
      const res = await api.getStudentReport(studentId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading personalized attendance profile...
      </div>
    );
  }

  const { student, stats, records } = data;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
            Student Academic Profile
          </span>
          <h1 className="text-2xl font-bold mt-1 text-white">{student.fullName}</h1>
          <p className="text-xs text-blue-200 mt-0.5 font-mono">
            Roll No: {student.rollNumber} • {student.className} ({student.sectionName})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('qr-attendance')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => onNavigate('corrections')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <FileEdit className="w-4 h-4" />
            <span>Dispute a Record</span>
          </button>
        </div>
      </div>

      {/* Low Attendance Warning Banner if Defaulter */}
      {stats.isDefaulter && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                Low Attendance Alert: You are below the 75% institutional requirement.
              </p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Current: <strong>{stats.percentage}%</strong>. You must attend the next <strong>{stats.classesNeeded} consecutive sessions</strong> to avoid examination debarment.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('corrections')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
          >
            Submit Dispute
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">My Attendance Rate</span>
          <div className={`text-3xl font-extrabold mt-1 ${stats.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {stats.percentage}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Target: 75.0% minimum
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Sessions Attended</span>
          <div className="text-3xl font-extrabold text-slate-800 mt-1">
            {stats.attendedCount}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Out of {stats.totalEligibleSessions} held
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Absences</span>
          <div className="text-3xl font-extrabold text-red-600 mt-1">
            {stats.absentCount}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {stats.lateCount} late marks recorded
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Excused Leave</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">
            {stats.excusedCount}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Exempt from denominator
          </span>
        </div>
      </div>

      {/* Date-Wise Records History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Official Attendance Log</h2>
            <p className="text-xs text-slate-500">Every held lecture period with marked verification status</p>
          </div>
          <button
            onClick={() => onNavigate('corrections')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Request Correction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Subject & Code</th>
                <th className="py-3 px-4 font-semibold">Period</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Check-In Method</th>
                <th className="py-3 px-4 font-semibold">Remarks / Faculty Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{r.sessionDate}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{r.subjectName}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">({r.subjectCode})</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">Period {r.periodNumber || 1}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'ABSENT'
                          ? 'bg-red-100 text-red-800'
                          : r.status === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{r.checkInMethod}</td>
                  <td className="py-3 px-4 text-slate-500">{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
