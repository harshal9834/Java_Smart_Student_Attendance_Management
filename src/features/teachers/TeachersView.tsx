import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Mail,
  Phone,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import type { Teacher, Department, Subject, ClassRoom, User } from '../../types';
import { api } from '../../services/api';

interface TeachersViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ user, onNavigate }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // New Teacher Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '',
    fullName: '',
    email: '',
    contactNumber: '',
    departmentId: 'dept-cse'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tchList, deptList, subList, clsList] = await Promise.all([
        api.getTeachers(),
        api.getDepartments(),
        api.getSubjects(),
        api.getClasses()
      ]);
      setTeachers(tchList);
      setDepartments(deptList);
      setSubjects(subList);
      setClasses(clsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffId || !formData.fullName) return;

    try {
      setSubmitting(true);
      await api.createTeacher(formData);
      setModalOpen(false);
      setFormData({
        staffId: '',
        fullName: '',
        email: '',
        contactNumber: '',
        departmentId: 'dept-cse'
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Faculty & Teacher Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional directory of teaching faculty and their authorized subject and class assignments
          </p>
        </div>

        {user.role !== 'STUDENT' && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => {
          const assignedSubs = subjects.filter(s => t.assignedSubjectIds?.includes(s.id));
          const assignedCls = classes.filter(c => t.assignedClassIds?.includes(c.id));

          return (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{t.fullName}</h3>
                  <span className="text-xs font-mono text-slate-400 font-medium">Staff ID: {t.staffId}</span>
                  <div className="text-xs text-blue-600 font-medium mt-0.5">{t.departmentName}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  ACTIVE
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.email}</span>
                </div>
                {t.contactNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.contactNumber}</span>
                  </div>
                )}
              </div>

              {/* Assignments Matrix */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Assigned Teaching Scope
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {assignedSubs.length > 0 ? (
                    assignedSubs.map(s => (
                      <span key={s.id} className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-mono">
                        {s.code} ({s.name})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No subjects assigned</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Add Faculty Member</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff ID *</label>
                <input
                  type="text"
                  required
                  placeholder="EMP-105"
                  value={formData.staffId}
                  onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Jane Foster"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  placeholder="jane.foster@aite.edu"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

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

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
