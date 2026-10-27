import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Send,
  QrCode,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import type {
  ClassRoom,
  Section,
  Subject,
  Teacher,
  Student,
  AttendanceStatus,
  AttendanceSession,
  User
} from '../../types';
import { api } from '../../services/api';

interface TakeAttendanceViewProps {
  user: User;
  onNavigate: (tab: string) => void;
  onSessionSubmitted?: () => void;
}

export const TakeAttendanceView: React.FC<TakeAttendanceViewProps> = ({
  user,
  onNavigate,
  onSessionSubmitted
}) => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Selection states
  const [selectedClassId, setSelectedClassId] = useState('class-cs3');
  const [selectedSectionId, setSelectedSectionId] = useState('sec-cs3-a');
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-cs301');
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Active Session & Student Marks
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [studentMarks, setStudentMarks] = useState<
    Array<{
      studentId: string;
      rollNumber: string;
      fullName: string;
      email: string;
      status: AttendanceStatus;
      remarks: string;
      checkInMethod?: string;
    }>
  >([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadAcademics();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSectionId && selectedSubjectId && sessionDate) {
      loadOrInitSession();
    }
  }, [selectedClassId, selectedSectionId, selectedSubjectId, selectedPeriod, sessionDate]);

  const loadAcademics = async () => {
    try {
      const [clsList, secList, subList, tchList] = await Promise.all([
        api.getClasses(),
        api.getSections(),
        api.getSubjects(),
        api.getTeachers()
      ]);
      setClasses(clsList);
      setSections(secList);
      setSubjects(subList);
      setTeachers(tchList);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrInitSession = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      // Check if session already exists for this date, class, section, subject, period
      const existingSessions = await api.getSessions({
        date: sessionDate,
        classId: selectedClassId,
        subjectId: selectedSubjectId
      });

      const matched = existingSessions.find(
        s => s.sectionId === selectedSectionId && s.periodNumber === Number(selectedPeriod)
      );

      if (matched) {
        const details = await api.getSessionDetails(matched.id);
        setActiveSession(details.session);
        setStudentMarks(details.students);
      } else {
        // Fetch enrolled students for this class and section
        const allStudents = await api.getStudents({
          classId: selectedClassId,
          sectionId: selectedSectionId
        });

        // Initialize unmarked list
        setActiveSession(null);
        setStudentMarks(
          allStudents.map(s => ({
            studentId: s.id,
            rollNumber: s.rollNumber,
            fullName: s.fullName,
            email: s.email,
            status: 'UNMARKED',
            remarks: ''
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to initialize attendance session' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (activeSession?.state === 'SUBMITTED' && user.role !== 'SUPER_ADMIN') {
      setFeedback({ type: 'error', message: 'Session is SUBMITTED. Reopen session first to make changes.' });
      return;
    }

    setStudentMarks(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudentMarks(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const markAll = (status: AttendanceStatus) => {
    if (activeSession?.state === 'SUBMITTED' && user.role !== 'SUPER_ADMIN') return;
    setStudentMarks(prev => prev.map(item => ({ ...item, status })));
  };

  // Calculations
  const presentCount = studentMarks.filter(s => s.status === 'PRESENT').length;
  const absentCount = studentMarks.filter(s => s.status === 'ABSENT').length;
  const lateCount = studentMarks.filter(s => s.status === 'LATE').length;
  const excusedCount = studentMarks.filter(s => s.status === 'EXCUSED').length;
  const unmarkedCount = studentMarks.filter(s => s.status === 'UNMARKED').length;
  const totalEligible = studentMarks.length;
  const totalMarked = presentCount + absentCount + lateCount + excusedCount;
  const completionPercentage = totalEligible > 0 ? Math.round((totalMarked / totalEligible) * 100) : 0;

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setFeedback(null);

      let sessionId = activeSession?.id;

      // Create session if it doesn't exist
      if (!sessionId) {
        const newSess = await api.createSession({
          classId: selectedClassId,
          sectionId: selectedSectionId,
          subjectId: selectedSubjectId,
          teacherId: user.teacherId || teachers[0]?.id || 'tch-1',
          sessionDate,
          periodNumber: Number(selectedPeriod),
          startTime: selectedPeriod === 1 ? '09:00' : selectedPeriod === 2 ? '10:15' : '11:30',
          endTime: selectedPeriod === 1 ? '10:00' : selectedPeriod === 2 ? '11:15' : '12:30'
        });
        sessionId = newSess.id;
        setActiveSession(newSess);
      }

      // Save records
      const res = await api.saveSessionRecords(
        sessionId,
        studentMarks.map(s => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks
        }))
      );

      setActiveSession(res.session);
      setFeedback({
        type: 'success',
        message: `Saved ${res.recordsSaved} records as draft. Transaction committed to database.`
      });
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: 'error', message: error.message || 'Failed to save attendance draft' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitSession = async () => {
    // Rule: Cannot submit if any student is unmarked
    if (unmarkedCount > 0) {
      setFeedback({
        type: 'error',
        message: `Cannot submit: ${unmarkedCount} student(s) remain UNMARKED. Institutional policy strictly requires a verified status for every enrolled student.`
      });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      // Save records first
      let sessionId = activeSession?.id;
      if (!sessionId) {
        const newSess = await api.createSession({
          classId: selectedClassId,
          sectionId: selectedSectionId,
          subjectId: selectedSubjectId,
          teacherId: user.teacherId || teachers[0]?.id || 'tch-1',
          sessionDate,
          periodNumber: Number(selectedPeriod)
        });
        sessionId = newSess.id;
      }

      await api.saveSessionRecords(
        sessionId,
        studentMarks.map(s => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks
        }))
      );

      // Finalize and lock session
      const submitRes = await api.submitSession(sessionId);
      setActiveSession(submitRes.session);
      setFeedback({
        type: 'success',
        message: 'Attendance finalized and locked successfully! Records are officially archived and student percentages updated.'
      });

      if (onSessionSubmitted) onSessionSubmitted();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: 'error', message: error.message || 'Submission failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Selector Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Record Class Attendance</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select class schedule and record student presence with multi-status verification
            </p>
          </div>

          {activeSession && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Session State:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activeSession.state === 'SUBMITTED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : activeSession.state === 'REOPENED'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {activeSession.state}
              </span>
            </div>
          )}
        </div>

        {/* Academic Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          {/* Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Program</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {sections
                .filter(s => s.classId === selectedClassId)
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Period & Timing</label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(Number(e.target.value))}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Period 1 (09:00 - 10:00)</option>
              <option value={2}>Period 2 (10:15 - 11:15)</option>
              <option value={3}>Period 3 (11:30 - 12:30)</option>
              <option value={4}>Period 4 (14:00 - 15:00)</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Progress & Quick Actions Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Counters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
            Total: <span className="text-slate-900">{totalEligible}</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
            Present: <span className="font-bold">{presentCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
            Absent: <span className="font-bold">{absentCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700">
            Late: <span className="font-bold">{lateCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
            Excused: <span className="font-bold">{excusedCount}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            unmarkedCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            Unmarked: <span className="font-bold">{unmarkedCount}</span>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => markAll('PRESENT')}
            disabled={activeSession?.state === 'SUBMITTED' && user.role !== 'SUPER_ADMIN'}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            disabled={activeSession?.state === 'SUBMITTED' && user.role !== 'SUPER_ADMIN'}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Mark All Absent
          </button>
          <button
            onClick={() => markAll('UNMARKED')}
            disabled={activeSession?.state === 'SUBMITTED' && user.role !== 'SUPER_ADMIN'}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Completion Rate Pill */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            completionPercentage === 100 ? 'bg-emerald-600' : 'bg-blue-600'
          }`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading class roster...</div>
        ) : studentMarks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No enrolled students found for the selected class and section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-16">#</th>
                  <th className="py-3 px-4 font-semibold w-32">Roll Number</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold text-center w-72">Attendance Status</th>
                  <th className="py-3 px-4 font-semibold w-56">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentMarks.map((s, idx) => {
                  return (
                    <tr
                      key={s.studentId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        s.status === 'ABSENT'
                          ? 'bg-red-50/20'
                          : s.status === 'LATE'
                          ? 'bg-amber-50/20'
                          : s.status === 'EXCUSED'
                          ? 'bg-blue-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.rollNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.fullName}</div>
                        <div className="text-[11px] text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100/80 space-x-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.studentId, 'PRESENT')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                              s.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.studentId, 'ABSENT')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                              s.status === 'ABSENT'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.studentId, 'LATE')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                              s.status === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.studentId, 'EXCUSED')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                              s.status === 'EXCUSED'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            E
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={s.remarks || ''}
                          onChange={e => handleRemarksChange(s.studentId, e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>
            P = Present (1.0) • A = Absent (0.0) • L = Late (1.0) • E = Excused (excluded from denominator)
          </span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => onNavigate('qr-attendance')}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Launch QR Session</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving || (activeSession?.state === 'SUBMITTED' && user.role !== 'SUPER_ADMIN')}
            className="px-4 py-2 border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleSubmitSession}
            disabled={saving || (activeSession?.state === 'SUBMITTED' && user.role !== 'SUPER_ADMIN')}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? 'Submitting...' : 'Finalize & Submit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
