import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  FileSpreadsheet
} from 'lucide-react';
import type { Student, Department, ClassRoom, Section, User } from '../../types';
import { api } from '../../services/api';

interface StudentsViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ user, onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterDefaulters, setFilterDefaulters] = useState(false);

  // Modals & Profile Drawer
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add Student Form State
  const [formData, setFormData] = useState({
    rollNumber: '',
    fullName: '',
    email: '',
    contactNumber: '',
    departmentId: 'dept-cse',
    classId: 'class-cs3',
    sectionId: 'sec-cs3-a',
    semester: 5
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Bulk Import state
  const [csvContent, setCsvContent] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; importedCount: number; errors: Array<{ row: number; reason: string }> } | null>(null);

  useEffect(() => {
    loadData();
  }, [filterDept, filterClass, filterDefaulters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stdList, deptList, clsList, secList] = await Promise.all([
        api.getStudents({
          search: search || undefined,
          departmentId: filterDept !== 'ALL' ? filterDept : undefined,
          classId: filterClass !== 'ALL' ? filterClass : undefined,
          defaultersOnly: filterDefaulters
        }),
        api.getDepartments(),
        api.getClasses(),
        api.getSections()
      ]);
      setStudents(stdList);
      setDepartments(deptList);
      setClasses(clsList);
      setSections(secList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenStudent = async (id: string) => {
    try {
      setSelectedStudentId(id);
      setDetailsLoading(true);
      const data = await api.getStudentDetails(id);
      setStudentDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rollNumber || !formData.fullName) {
      setFormError('Roll number and Full Name are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      await api.createStudent(formData);
      setAddModalOpen(false);
      setFormData({
        rollNumber: '',
        fullName: '',
        email: '',
        contactNumber: '',
        departmentId: 'dept-cse',
        classId: 'class-cs3',
        sectionId: 'sec-cs3-a',
        semester: 5
      });
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || 'Failed to register student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!csvContent.trim()) return;

    try {
      setSubmitting(true);
      setImportResult(null);

      // Parse CSV rows
      const lines = csvContent.trim().split('\n');
      const rows: Array<{ rollNumber: string; fullName: string; email?: string; departmentId: string; classId: string; sectionId: string; semester?: number }> = [];

      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('roll')) return; // skip header
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2 && parts[0] && parts[1]) {
          rows.push({
            rollNumber: parts[0],
            fullName: parts[1],
            email: parts[2] || `${parts[0].toLowerCase()}@student.aite.edu`,
            departmentId: parts[3] || 'dept-cse',
            classId: parts[4] || 'class-cs3',
            sectionId: parts[5] || 'sec-cs3-a',
            semester: parts[6] ? Number(parts[6]) : 5
          });
        }
      });

      const res = await api.bulkImportStudents(rows);
      setImportResult(res);
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setImportResult({
        success: false,
        importedCount: 0,
        errors: [{ row: 1, reason: error.message || 'CSV parse failed' }]
      });
    } finally {
      setSubmitting(false);
    }
  };

  const exportStudentsCsv = () => {
    // RFC 4180 safe CSV generation with formula injection prevention
    const headers = ['Roll Number', 'Full Name', 'Email', 'Department', 'Class', 'Attendance %', 'Total Sessions', 'Attended'];
    const rows = students.map(s => [
      `"${s.rollNumber.replace(/"/g, '""')}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${(s.departmentName || '').replace(/"/g, '""')}"`,
      `"${(s.className || '').replace(/"/g, '""')}"`,
      `"${s.attendancePercentage || 0}%"`,
      `"${s.totalSessions || 0}"`,
      `"${s.attendedSessions || 0}"`
    ]);

    const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Students_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Student Academic Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional directory of enrolled students with real-time calculated attendance records
          </p>
        </div>

        {user.role !== 'STUDENT' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setImportModalOpen(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk CSV Import</span>
            </button>

            <button
              onClick={exportStudentsCsv}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
          >
            <option value="ALL">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterDefaulters(!filterDefaulters)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center space-x-1.5 ${
              filterDefaulters
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Defaulters (&lt;75%) Only</span>
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading registered students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Roll Number</th>
                  <th className="py-3 px-4 font-semibold">Full Name</th>
                  <th className="py-3 px-4 font-semibold">Class & Section</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold text-center">Attendance %</th>
                  <th className="py-3 px-4 font-semibold text-center">Compliance</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => {
                  const pct = s.attendancePercentage || 0;
                  const isDefaulter = (s as any).isDefaulter;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.rollNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.fullName}</div>
                        <div className="text-[11px] text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{s.className}</div>
                        <div className="text-[11px] text-slate-500">{s.sectionName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.departmentName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${pct >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {pct}%
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {s.attendedSessions || 0} / {s.totalSessions || 0} held
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isDefaulter ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            DEFAULTER
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ELIGIBLE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenStudent(s.id)}
                          className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-medium transition-colors"
                        >
                          View Profile
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

      {/* Add Student Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Register New Student</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS23B120"
                    value={formData.rollNumber}
                    onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Miller"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="student@aite.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0100"
                    value={formData.contactNumber}
                    onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={formData.sectionId}
                    onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-slate-900">Bulk CSV Student Import</h2>
                <p className="text-xs text-slate-500">Paste comma-separated rows or load template</p>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 font-mono">
              <span className="font-bold block text-slate-800 mb-1 font-sans">CSV Format:</span>
              rollNumber,fullName,email,departmentId,classId,sectionId,semester
            </div>

            <textarea
              rows={6}
              value={csvContent}
              onChange={e => setCsvContent(e.target.value)}
              placeholder="CS23B116,Diana Prince,diana.p@student.aite.edu,dept-cse,class-cs3,sec-cs3-a,5&#10;CS23B117,Bruce Wayne,bruce.w@student.aite.edu,dept-cse,class-cs3,sec-cs3-a,5"
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            ></textarea>

            {importResult && (
              <div className={`p-3 rounded-lg border text-xs ${importResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                <p className="font-bold">Successfully imported {importResult.importedCount} student(s).</p>
                {importResult.errors.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {importResult.errors.map((e, idx) => (
                      <p key={idx} className="text-[11px] text-red-600">Row {e.row}: {e.reason}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCsvContent(
                    `rollNumber,fullName,email,departmentId,classId,sectionId,semester\nCS23B116,Diana Prince,diana.p@student.aite.edu,dept-cse,class-cs3,sec-cs3-a,5\nCS23B117,Bruce Wayne,bruce.w@student.aite.edu,dept-cse,class-cs3,sec-cs3-a,5`
                  );
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Insert Sample Rows
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={submitting || !csvContent.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Run Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Drawer */}
      {selectedStudentId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Profile</span>
                <h2 className="text-lg font-bold text-slate-900">{studentDetails?.fullName}</h2>
                <p className="text-xs text-slate-500 font-mono">{studentDetails?.rollNumber}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetails(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading || !studentDetails ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading profile records...</div>
            ) : (
              <>
                {/* Attendance Summary Cards */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-600 font-semibold uppercase">Percentage</span>
                    <div className="text-xl font-bold text-blue-900 mt-1">
                      {studentDetails.stats?.percentage}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Attended</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                      {studentDetails.stats?.attendedCount}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Held</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                      {studentDetails.stats?.totalEligibleSessions}
                    </div>
                  </div>
                </div>

                {/* Deficit calculation if below threshold */}
                {studentDetails.stats?.isDefaulter && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Deficit Analysis: Below 75% Requirement</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      This student must attend at least <strong>{studentDetails.stats.classesNeeded} consecutive sessions</strong> without absence to regain compliance.
                    </p>
                  </div>
                )}

                {/* Academic Enrollment Meta */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-800">{studentDetails.departmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class & Section:</span>
                    <span className="font-semibold text-slate-800">{studentDetails.className} - {studentDetails.sectionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Semester:</span>
                    <span className="font-semibold text-slate-800">Semester {studentDetails.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Institutional Email:</span>
                    <span className="font-semibold text-slate-800">{studentDetails.email}</span>
                  </div>
                </div>

                {/* Historical Date-Wise Records Table */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-2">Subject Attendance Log</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Subject</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentDetails.records?.map((r: any) => (
                          <tr key={r.id}>
                            <td className="py-2 px-3 font-mono text-slate-700">{r.sessionDate}</td>
                            <td className="py-2 px-3 font-medium text-slate-800">{r.subjectName}</td>
                            <td className="py-2 px-3">
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
                            <td className="py-2 px-3 text-slate-500 text-[10px] font-mono">{r.checkInMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
