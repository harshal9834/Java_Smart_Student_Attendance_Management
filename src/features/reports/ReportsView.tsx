import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  BookOpen
} from 'lucide-react';
import type { Student, ClassRoom, Subject, User } from '../../types';
import { api } from '../../services/api';

interface ReportsViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'CLASS' | 'STUDENT' | 'DEFAULTERS'>('CLASS');

  // Filters
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedClassId, setSelectedClassId] = useState('class-cs3');
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState('std-1');
  const [thresholdInput, setThresholdInput] = useState(75);

  // Data states
  const [classReport, setClassReport] = useState<any>(null);
  const [studentReport, setStudentReport] = useState<any>(null);
  const [defaulterReport, setDefaulterReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'CLASS') {
      loadClassReport();
    } else if (activeTab === 'STUDENT' && selectedStudentId) {
      loadStudentReport();
    } else if (activeTab === 'DEFAULTERS') {
      loadDefaulterReport();
    }
  }, [activeTab, selectedClassId, selectedSubjectId, selectedStudentId, thresholdInput]);

  const loadFilterOptions = async () => {
    try {
      const [clsList, subList, stdList] = await Promise.all([
        api.getClasses(),
        api.getSubjects(),
        api.getStudents()
      ]);
      setClasses(clsList);
      setSubjects(subList);
      setStudents(stdList);
      if (stdList.length > 0) setSelectedStudentId(stdList[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClassReport = async () => {
    try {
      setLoading(true);
      const data = await api.getClassReport({
        classId: selectedClassId,
        subjectId: selectedSubjectId !== 'ALL' ? selectedSubjectId : undefined
      });
      setClassReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentReport = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentReport(
        selectedStudentId,
        selectedSubjectId !== 'ALL' ? selectedSubjectId : undefined
      );
      setStudentReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaulterReport = async () => {
    try {
      setLoading(true);
      const data = await api.getLowAttendanceReport(thresholdInput);
      setDefaulterReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Safe RFC 4180 CSV export with formula injection sanitization
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = 'Attendance_Report';

    if (activeTab === 'CLASS' && classReport) {
      filename = `Class_Attendance_${selectedClassId}`;
      headers = ['Roll Number', 'Full Name', 'Department', 'Class', 'Attendance %', 'Total Sessions', 'Attended', 'Status'];
      rows = classReport.students.map((s: any) => [
        `"${s.rollNumber}"`,
        `"${s.fullName}"`,
        `"${s.departmentName || ''}"`,
        `"${s.className || ''}"`,
        `"${s.percentage}%"`,
        `"${s.totalEligibleSessions}"`,
        `"${s.attendedCount}"`,
        `"${s.isDefaulter ? 'DEFAULTER (<75%)' : 'ELIGIBLE'}"`
      ]);
    } else if (activeTab === 'STUDENT' && studentReport) {
      filename = `Student_Attendance_${studentReport.student.rollNumber}`;
      headers = ['Date', 'Subject Code', 'Subject Name', 'Period', 'Status', 'Check-In Method', 'Remarks'];
      rows = studentReport.records.map((r: any) => [
        `"${r.sessionDate}"`,
        `"${r.subjectCode || ''}"`,
        `"${r.subjectName || ''}"`,
        `"${r.periodNumber || 1}"`,
        `"${r.status}"`,
        `"${r.checkInMethod}"`,
        `"${(r.remarks || '').replace(/"/g, '""')}"`
      ]);
    } else if (activeTab === 'DEFAULTERS' && defaulterReport) {
      filename = `Attendance_Defaulters_Below_${thresholdInput}pct`;
      headers = ['Roll Number', 'Full Name', 'Email', 'Class', 'Attendance %', 'Attended', 'Total Held', 'Classes Needed for 75%'];
      rows = defaulterReport.defaulters.map((d: any) => [
        `"${d.student.rollNumber}"`,
        `"${d.student.fullName}"`,
        `"${d.student.email}"`,
        `"${d.student.className || ''}"`,
        `"${d.stats.percentage}%"`,
        `"${d.stats.attendedCount}"`,
        `"${d.stats.totalEligibleSessions}"`,
        `"${d.stats.classesNeeded}"`
      ]);
    }

    // Formula injection safeguard: prefix formula trigger chars (=, +, -, @) with single quote
    const safeRows = rows.map(row =>
      row.map(cell => {
        const cleaned = cell.replace(/^"(.*)"$/, '$1');
        if (/^[=+\-@]/.test(cleaned)) {
          return `"'${cleaned.replace(/"/g, '""')}"`;
        }
        return cell;
      })
    );

    const csvContent = [headers.join(','), ...safeRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Attendance Reports & Statistical Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict percentage evaluation: (Counted Attended / Eligible Recorded) × 100 with policy rules
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('CLASS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'CLASS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Class Performance Report
        </button>
        <button
          onClick={() => setActiveTab('STUDENT')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'STUDENT'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Individual Student Audit
        </button>
        <button
          onClick={() => setActiveTab('DEFAULTERS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'DEFAULTERS'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Low Attendance Defaulters List
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        {activeTab === 'CLASS' && (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class:</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Filter:</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
              >
                <option value="ALL">All Subjects Combined</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {activeTab === 'STUDENT' && (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Student:</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 min-w-64"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.rollNumber} - {s.fullName} ({s.className})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Scope:</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {activeTab === 'DEFAULTERS' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">Minimum Threshold (%):</span>
            <input
              type="number"
              min={50}
              max={100}
              value={thresholdInput}
              onChange={e => setThresholdInput(Number(e.target.value))}
              className="w-20 text-xs border border-slate-300 rounded-lg p-1.5 font-bold text-center bg-slate-50"
            />
          </div>
        )}
      </div>

      {/* REPORT CONTENT VIEWS */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-xs text-slate-500 border border-slate-200">
          Generating verified attendance statistics...
        </div>
      ) : activeTab === 'CLASS' && classReport ? (
        <div className="space-y-4">
          {/* Class Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Class Average</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{classReport.classAverage}%</div>
              <span className="text-xs text-slate-500">Based on all held sessions</span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Eligible Students</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{classReport.totalStudents}</div>
              <span className="text-xs text-slate-500">Active enrollments</span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-amber-700 font-semibold uppercase">Defaulters (&lt;75%)</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">{classReport.defaultersCount}</div>
              <span className="text-xs text-amber-700">Non-compliant students</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Roll Number</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold text-center">Attended / Held</th>
                  <th className="py-3 px-4 font-semibold text-center">Percentage</th>
                  <th className="py-3 px-4 font-semibold text-center">Present / Absent / Late / Excused</th>
                  <th className="py-3 px-4 font-semibold text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classReport.students.map((s: any) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{s.fullName}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {s.attendedCount} / {s.totalEligibleSessions}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${s.percentage >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {s.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                      {s.presentCount}P • {s.absentCount}A • {s.lateCount}L • {s.excusedCount}E
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.isDefaulter ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          DEFAULTER
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ELIGIBLE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'STUDENT' && studentReport ? (
        <div className="space-y-4">
          {/* Student KPI Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Record</span>
              <h2 className="text-lg font-bold text-slate-900">{studentReport.student.fullName}</h2>
              <p className="text-xs text-slate-500 font-mono">{studentReport.student.rollNumber} • {studentReport.student.className}</p>
            </div>

            <div className="flex items-center space-x-6 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Attendance Rate</span>
                <div className={`text-3xl font-extrabold ${studentReport.stats.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {studentReport.stats.percentage}%
                </div>
              </div>
              <div className="text-left text-xs text-slate-600 space-y-0.5 border-l border-slate-200 pl-4">
                <p>Attended: <strong>{studentReport.stats.attendedCount}</strong> sessions</p>
                <p>Total Eligible Held: <strong>{studentReport.stats.totalEligibleSessions}</strong></p>
                <p>Absences: <strong className="text-red-600">{studentReport.stats.absentCount}</strong></p>
              </div>
            </div>
          </div>

          {/* Session by session table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentReport.records.map((r: any) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{r.sessionDate}</td>
                    <td className="py-2.5 px-4 text-slate-800 font-medium">{r.subjectName}</td>
                    <td className="py-2.5 px-4 text-slate-600">Period {r.periodNumber || 1}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500">{r.checkInMethod}</td>
                    <td className="py-2.5 px-4 text-slate-500">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'DEFAULTERS' && defaulterReport ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  {defaulterReport.totalDefaulters} Students Below {thresholdInput}% Attendance Requirement
                </h3>
                <p className="text-xs text-amber-700">
                  Subject to exam debarment notice unless deficit is resolved through verified medical leave or compensatory lectures.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Roll Number</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Class</th>
                  <th className="py-3 px-4 font-semibold text-center">Attended / Held</th>
                  <th className="py-3 px-4 font-semibold text-center">Current %</th>
                  <th className="py-3 px-4 font-semibold text-center">Classes Needed to Reach 75%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaulterReport.defaulters.map((d: any) => (
                  <tr key={d.student.id} className="hover:bg-amber-50/30">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.student.rollNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.student.fullName}</td>
                    <td className="py-3 px-4 text-slate-600">{d.student.className}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {d.stats.attendedCount} / {d.stats.totalEligibleSessions}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {d.stats.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700">
                      +{d.stats.classesNeeded} consecutive sessions
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
