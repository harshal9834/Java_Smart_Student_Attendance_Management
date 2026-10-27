import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Shield,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Smartphone,
  Info,
  Radio,
  Send
} from 'lucide-react';
import type { AttendanceSession, User, Student } from '../../types';
import { api } from '../../services/api';

interface QrAttendanceViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const QrAttendanceView: React.FC<QrAttendanceViewProps> = ({
  user,
  onNavigate
}) => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [qrData, setQrData] = useState<{ token: string; expiresAt: string; validitySeconds: number } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [generating, setGenerating] = useState(false);

  // Student check-in simulator & status
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [simStudentId, setSimStudentId] = useState<string>('');
  const [checkInFeedback, setCheckInFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  // Live session check-in feed
  const [recentCheckIns, setRecentCheckIns] = useState<Array<{ name: string; roll: string; time: string }>>([]);

  useEffect(() => {
    loadSessionsAndStudents();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (qrData && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            // Auto refresh rotating token
            refreshQrToken();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrData, secondsRemaining]);

  const loadSessionsAndStudents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [allSessions, allStudents] = await Promise.all([
        api.getSessions({ date: today }),
        api.getStudents()
      ]);

      setSessions(allSessions);
      setStudentList(allStudents);

      if (allSessions.length > 0) {
        setSelectedSessionId(allSessions[0].id);
      } else {
        // Fallback to latest session if today has none
        const anySessions = await api.getSessions();
        if (anySessions.length > 0) {
          setSessions(anySessions);
          setSelectedSessionId(anySessions[0].id);
        }
      }

      if (user.studentId) {
        setSimStudentId(user.studentId);
      } else if (allStudents.length > 0) {
        setSimStudentId(allStudents[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartQr = async (sessId?: string) => {
    const id = sessId || selectedSessionId;
    if (!id) return;

    try {
      setGenerating(true);
      const res = await api.generateQrToken(id);
      setQrData(res);
      setSecondsRemaining(res.validitySeconds);
      setCheckInFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const refreshQrToken = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await api.generateQrToken(selectedSessionId);
      setQrData(res);
      setSecondsRemaining(res.validitySeconds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentCheckIn = async (studentIdToUse: string) => {
    if (!selectedSessionId || !qrData?.token) {
      setCheckInFeedback({
        success: false,
        message: 'No active QR token available. Please ask teacher to generate a token.'
      });
      return;
    }

    try {
      setCheckingIn(true);
      setCheckInFeedback(null);

      const res = await api.checkInWithQr(selectedSessionId, qrData.token, studentIdToUse);
      setCheckInFeedback({
        success: true,
        message: res.message
      });

      const st = studentList.find(s => s.id === studentIdToUse);
      if (st) {
        setRecentCheckIns(prev => [
          { name: st.fullName, roll: st.rollNumber, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9)
        ]);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setCheckInFeedback({
        success: false,
        message: error.message || 'Check-in failed'
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const currentSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="space-y-6">
      {/* Title & Info Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>Smart Dynamic QR Attendance</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Time-sensitive dynamic QR tokens with cryptographic freshness and duplicate check prevention
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Active Session:</span>
            <select
              value={selectedSessionId}
              onChange={e => {
                setSelectedSessionId(e.target.value);
                setQrData(null);
                setSecondsRemaining(0);
              }}
              className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 max-w-xs"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.sessionDate} • {s.subjectCode} ({s.sectionName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Institutional Safeguards & Policy Notice */}
        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-900">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Physical Presence Safeguards & Limitations:</span>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              Software QR tokens assist automated check-in but do not inherently prove physical presence without supervision.
              This platform generates <strong>rotating short-lived cryptographic tokens (45s validity)</strong> to prevent static screenshot sharing.
              Official presence records require faculty review and room supervision.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Teacher Dynamic QR Display */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Teacher Projection View
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                {currentSession ? `${currentSession.className} - ${currentSession.subjectName}` : 'Select a session'}
              </h2>
            </div>
            {qrData && (
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">LIVE BROADCAST</span>
              </div>
            )}
          </div>

          {!qrData ? (
            <div className="py-12 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <QrCode className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">No Active QR Session</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Click the button below to generate a rotating cryptographic QR token for this class.
                </p>
              </div>
              <button
                onClick={() => handleStartQr()}
                disabled={generating || !selectedSessionId}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{generating ? 'Generating Token...' : 'Start Dynamic QR Session'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-5">
              {/* QR Code Container with Rotating Countdown Badge */}
              <div className="relative p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 shadow-inner">
                <QRCodeSVG
                  value={JSON.stringify({
                    sessionId: selectedSessionId,
                    token: qrData.token,
                    ts: Date.now()
                  })}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Rotating in: <strong>{secondsRemaining}s</strong></span>
                </div>
                <button
                  onClick={refreshQrToken}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Refresh Now</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded max-w-md truncate">
                Token: {qrData.token}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Student Check-In Scanner & Live Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Student Scanner / Check-In Simulator */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Student Device Check-In Simulator</h2>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Test student check-in through camera scan or simulated authenticated payload:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrolled Student:
                </label>
                <select
                  value={simStudentId}
                  onChange={e => setSimStudentId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                >
                  {studentList
                    .filter(s => currentSession ? s.classId === currentSession.classId : true)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.rollNumber} - {s.fullName}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() => handleStudentCheckIn(simStudentId)}
                disabled={checkingIn || !qrData}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{checkingIn ? 'Validating Token...' : 'Confirm Student Check-In'}</span>
              </button>

              {checkInFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs font-medium flex items-start space-x-2 animate-in fade-in ${
                    checkInFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {checkInFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{checkInFeedback.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Check-In Event Feed */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Live Check-In Event Stream</h3>
              </div>
              <span className="text-[10px] text-slate-400">Audited in Real-Time</span>
            </div>

            {recentCheckIns.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No check-in events recorded during this active window yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentCheckIns.map((ci, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs animate-in slide-in-from-top-1"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{ci.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">({ci.roll})</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono">{ci.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
