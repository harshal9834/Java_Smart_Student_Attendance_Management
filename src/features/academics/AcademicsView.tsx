import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  BookOpen,
  Building2,
  Layers,
  Clock,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import type { Department, ClassRoom, Section, Subject, TimetableEntry, User } from '../../types';
import { api } from '../../services/api';

interface AcademicsViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({ user, onNavigate }) => {
  const [subTab, setSubTab] = useState<'TIMETABLE' | 'SUBJECTS' | 'DEPARTMENTS' | 'CLASSES'>('TIMETABLE');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClassId, setSelectedClassId] = useState('class-cs3');

  useEffect(() => {
    loadData();
  }, [selectedClassId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptList, clsList, secList, subList, ttList] = await Promise.all([
        api.getDepartments(),
        api.getClasses(),
        api.getSections(),
        api.getSubjects(),
        api.getTimetable({ classId: selectedClassId })
      ]);
      setDepartments(deptList);
      setClasses(clsList);
      setSections(secList);
      setSubjects(subList);
      setTimetable(ttList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' }
  ];

  const periods = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span>Academic Structure & Timetable</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curriculum mapping, departmental organization, and weekly period schedules
          </p>
        </div>

        {subTab === 'TIMETABLE' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Class Timetable:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSubTab('TIMETABLE')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'TIMETABLE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Weekly Timetable Grid
        </button>
        <button
          onClick={() => setSubTab('SUBJECTS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'SUBJECTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Course Subjects
        </button>
        <button
          onClick={() => setSubTab('DEPARTMENTS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'DEPARTMENTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setSubTab('CLASSES')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'CLASSES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Classes & Sections
        </button>
      </div>

      {/* Timetable Weekly Grid */}
      {subTab === 'TIMETABLE' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Weekly Period Grid: {classes.find(c => c.id === selectedClassId)?.name}
            </h2>
            <span className="text-xs text-slate-400">Semester 5 • Effective 2026-2027</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-28 border-r border-slate-200">Day</th>
                  <th className="py-3 px-4 font-semibold text-center border-r border-slate-200">
                    Period 1 (09:00 - 10:00)
                  </th>
                  <th className="py-3 px-4 font-semibold text-center border-r border-slate-200">
                    Period 2 (10:15 - 11:15)
                  </th>
                  <th className="py-3 px-4 font-semibold text-center border-r border-slate-200">
                    Period 3 (11:30 - 12:30)
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    Period 4 (14:00 - 15:00)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {days.map(d => (
                  <tr key={d.num} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                      {d.name}
                    </td>
                    {periods.map(p => {
                      const entry = timetable.find(t => t.dayOfWeek === d.num && t.periodNumber === p);
                      return (
                        <td
                          key={p}
                          className="py-3 px-3 border-r border-slate-200 last:border-r-0 align-top h-24"
                        >
                          {entry ? (
                            <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg h-full flex flex-col justify-between hover:bg-blue-100/60 transition-colors">
                              <div>
                                <div className="font-bold text-blue-950 font-mono text-[11px]">
                                  {entry.subjectCode}
                                </div>
                                <div className="text-[11px] font-semibold text-blue-900 line-clamp-1">
                                  {entry.subjectName}
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                                <span className="text-slate-700">{entry.teacherName}</span>
                                <span className="font-mono text-blue-700">{entry.roomNumber}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[10px]">
                              Recess / Open
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subjects */}
      {subTab === 'SUBJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {s.code}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">{s.credits} Credits</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-500">
                Department: {departments.find(d => d.id === s.departmentId)?.name || 'General'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Departments */}
      {subTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-sm text-slate-900">{d.code}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                  Apex Tech
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{d.name}</h3>
              <div className="text-xs text-slate-600 border-t border-slate-100 pt-2">
                Head of Department: <span className="font-semibold text-slate-800">{d.hodName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Classes */}
      {subTab === 'CLASSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map(c => {
            const classSecs = sections.filter(sec => sec.classId === c.id);
            return (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Semester {c.semester} • Academic Year {c.academicYear}
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                    Configured Class Sections:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {classSecs.map(sec => (
                      <span key={sec.id} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">
                        {sec.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
