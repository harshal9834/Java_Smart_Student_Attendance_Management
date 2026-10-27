import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Filter,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  X,
  FileSpreadsheet
} from 'lucide-react';
import type { AttendanceSession, AttendanceStatus, User } from '../../types';
import { api } from '../../services/api';

interface AttendanceHistoryViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  user,
  onNavigate
}) => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Inspection Drawer
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [inspectSession, setInspectSession] = useState<{
    session: AttendanceSession;
    students: Array<{ studentId: string; rollNumber: string; fullName: string; email: string; status: AttendanceStatus; remarks: string; checkInMethod: string }>;
  } | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Reopen Modal
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenError, setReopenError] = useState('');
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [filterClass, filterDate]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await api.getSessions({
        classId: filterClass !== 'ALL' ? filterClass : undefined,
        date: filterDate || undefined
      });
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (id: string) => {
    try {
      setSelectedSessionId(id);
      setInspectLoading(true);
      const details = await api.getSessionDetails(id);
      setInspectSession(details);
    } catch (err) {
      console.error(err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!selectedSessionId || reopenReason.trim().length < 5) {
      setReopenError('A valid explanation reason of at least 5 characters is required by audit policy.');
      return;
    }

    try {
      setReopening(true);
      setReopenError('');
      await api.reopenSession(selectedSessionId, reopenReason.trim());
      setReopenModalOpen(false);
      setReopenReason('');
      await loadSessions();
      if (selectedSessionId) {
        await handleInspect(selectedSessionId);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setReopenError(error.message || 'Failed to reopen session');
    } finally {
      setReopening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Attendance History & Archives</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of all past attendance sessions across academic periods
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Class:</span>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
            >
              <option value="ALL">All Classes</option>
              <option value="class-cs3">B.Tech CSE - 3rd Year</option>
              <option value="class-cs4">B.Tech CSE - 4th Year</option>
              <option value="class-it3">B.Tech IT - 3rd Year</option>
              <option value="class-ec3">B.Tech ECE - 3rd Year</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg p-1.5 bg-slate-50"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading archived attendance sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No attendance sessions found matching the specified filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Date & Period</th>
                  <th className="py-3 px-4 font-semibold">Class & Section</th>
                  <th className="py-3 px-4 font-semibold">Subject & Code</th>
                  <th className="py-3 px-4 font-semibold">Faculty / Submitter</th>
                  <th className="py-3 px-4 font-semibold text-center">Present / Eligible</th>
                  <th className="py-3 px-4 font-semibold">Session State</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map(s => {
                  const totalMarked = s.presentCount + s.absentCount + s.lateCount + s.excusedCount;
                  const pct = s.totalEligible > 0 ? Math.round((s.presentCount / s.totalEligible) * 100) : 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
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
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-600">
                          {s.subjectCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {s.teacherName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-slate-900">
                          {s.presentCount} / {s.totalEligible}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {pct}% attended ({s.absentCount} abs, {s.lateCount} late)
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
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
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleInspect(s.id)}
                          className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-medium transition-colors"
                        >
                          Inspect Roster
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection Drawer Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Attendance Session Roster: {inspectSession?.session.subjectName}
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectSession?.session.sessionDate} • Period {inspectSession?.session.periodNumber} • {inspectSession?.session.className}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSessionId(null);
                  setInspectSession(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {inspectLoading || !inspectSession ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading student attendance details...</div>
              ) : (
                <>
                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <span className="text-slate-500 text-[10px]">Total</span>
                      <p className="font-bold text-slate-800">{inspectSession.session.totalEligible}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-emerald-600 text-[10px]">Present</span>
                      <p className="font-bold text-emerald-800">{inspectSession.session.presentCount}</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-red-600 text-[10px]">Absent</span>
                      <p className="font-bold text-red-800">{inspectSession.session.absentCount}</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-amber-600 text-[10px]">Late</span>
                      <p className="font-bold text-amber-800">{inspectSession.session.lateCount}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-blue-600 text-[10px]">Excused</span>
                      <p className="font-bold text-blue-800">{inspectSession.session.excusedCount}</p>
                    </div>
                  </div>

                  {inspectSession.session.reopenReason && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
                      <span className="font-bold">Reopen Audit Reason:</span> {inspectSession.session.reopenReason} (by {inspectSession.session.reopenedBy})
                    </div>
                  )}

                  {/* Student Records List */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="py-2.5 px-3">Roll No</th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Check-In Method</th>
                          <th className="py-2.5 px-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspectSession.students.map(s => (
                          <tr key={s.studentId} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{s.rollNumber}</td>
                            <td className="py-2.5 px-3 text-slate-800">{s.fullName}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.status === 'PRESENT'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.status === 'ABSENT'
                                    ? 'bg-red-100 text-red-800'
                                    : s.status === 'LATE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : s.status === 'EXCUSED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{s.checkInMethod}</td>
                            <td className="py-2.5 px-3 text-slate-500">{s.remarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Session ID: <span className="font-mono">{inspectSession?.session.id}</span>
              </div>

              <div className="flex items-center space-x-2">
                {inspectSession?.session.state === 'SUBMITTED' && user.role !== 'STUDENT' && (
                  <button
                    onClick={() => setReopenModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Session</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedSessionId(null);
                    setInspectSession(null);
                  }}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Reopen Reason Dialog */}
      {reopenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Reopen Attendance Session (Audit Required)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Institutional governance requires a formal justification before unlocking submitted attendance records.
              </p>
            </div>

            {reopenError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {reopenError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Reopening:
              </label>
              <textarea
                rows={3}
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
                placeholder="e.g., Corrected 2 absent marks for students who arrived during lab demonstration..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setReopenModalOpen(false);
                  setReopenReason('');
                  setReopenError('');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReopenSubmit}
                disabled={reopening}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {reopening ? 'Auditing...' : 'Confirm & Reopen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
