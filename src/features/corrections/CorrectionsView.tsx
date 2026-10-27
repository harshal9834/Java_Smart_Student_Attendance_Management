import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import type { CorrectionRequest, AttendanceSession, User as UserType } from '../../types';
import { api } from '../../services/api';

interface CorrectionsViewProps {
  user: UserType;
  onNavigate: (tab: string) => void;
}

export const CorrectionsView: React.FC<CorrectionsViewProps> = ({ user, onNavigate }) => {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // New Request Form (for Students)
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [requestedStatus, setRequestedStatus] = useState<'PRESENT' | 'EXCUSED'>('PRESENT');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Review Dialog State (for Teachers / Admins)
  const [reviewRequestId, setReviewRequestId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [crList, sessList] = await Promise.all([
        api.getCorrectionRequests({
          studentId: user.role === 'STUDENT' ? user.studentId : undefined,
          status: filterStatus !== 'ALL' ? filterStatus : undefined
        }),
        api.getSessions()
      ]);
      setRequests(crList);
      setSessions(sessList);
      if (sessList.length > 0) setSelectedSessionId(sessList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !explanation.trim()) {
      setFeedback({ type: 'error', message: 'Please select a session and provide a detailed explanation.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      await api.createCorrectionRequest({
        studentId: user.studentId || 'std-1',
        sessionId: selectedSessionId,
        requestedStatus,
        explanation: explanation.trim()
      });
      setFeedback({
        type: 'success',
        message: 'Dispute submitted successfully! It has been routed to the course faculty for verification.'
      });
      setExplanation('');
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: 'error', message: error.message || 'Failed to submit request' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      setReviewing(true);
      await api.reviewCorrectionRequest(id, decision, reviewComments.trim());
      setReviewRequestId(null);
      setReviewComments('');
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Review action failed');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileEdit className="w-5 h-5 text-blue-600" />
            <span>Attendance Dispute & Correction Requests</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent dispute submission, faculty verification, and automatic attendance adjustment workflow
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Student Submission Card (Visible to students or anyone testing dispute creation) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Submit Attendance Correction Request</span>
            {user.role === 'STUDENT' && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                Student Account Active
              </span>
            )}
          </h2>
          <span className="text-xs text-slate-400">Institutional Appeal Form</span>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-lg border text-xs font-medium flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleCreateRequest} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disputed Attendance Session:
              </label>
              <select
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.sessionDate} • {s.subjectName} ({s.subjectCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested Corrected Status:
              </label>
              <select
                value={requestedStatus}
                onChange={e => setRequestedStatus(e.target.value as 'PRESENT' | 'EXCUSED')}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
              >
                <option value="PRESENT">Present (Full Attendance Credit)</option>
                <option value="EXCUSED">Excused (Medical / Official Duty)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Reason / Evidence Explanation:
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g., I was present during lab programming practice and submitted code on GitHub. Prof. Mitchell checked my task..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Dispute for Review'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Requests Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Submitted Correction Requests</h2>
          <span className="text-xs text-slate-400 font-medium">Total: {requests.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No correction requests found matching your current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Session Date & Subject</th>
                  <th className="py-3 px-4 font-semibold text-center">Status Change</th>
                  <th className="py-3 px-4 font-semibold">Student Explanation</th>
                  <th className="py-3 px-4 font-semibold">Request State</th>
                  <th className="py-3 px-4 font-semibold text-right">Faculty Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map(cr => (
                  <tr key={cr.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{cr.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{cr.studentRollNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{cr.subjectName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{cr.sessionDate}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">{cr.existingStatus}</span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{cr.requestedStatus}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 truncate" title={cr.explanation}>
                      {cr.explanation}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          cr.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cr.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {cr.status}
                      </span>
                      {cr.reviewerName && (
                        <div className="text-[10px] text-slate-400 mt-0.5">by {cr.reviewerName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {cr.status === 'PENDING' && user.role !== 'STUDENT' ? (
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleReviewDecision(cr.id, 'APPROVED')}
                            disabled={reviewing}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewDecision(cr.id, 'REJECTED')}
                            disabled={reviewing}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
