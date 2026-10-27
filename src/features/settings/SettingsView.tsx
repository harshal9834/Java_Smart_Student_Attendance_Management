import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  Database,
  Building,
  Clock,
  Sparkles
} from 'lucide-react';
import type { AttendancePolicy, User } from '../../types';
import { api } from '../../services/api';

interface SettingsViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onNavigate }) => {
  const [policy, setPolicy] = useState<AttendancePolicy>({
    minimumThresholdPercentage: 75,
    countLateAsAttended: true,
    lateWeight: 1.0,
    excludeExcusedFromDenominator: true,
    qrTokenValiditySeconds: 45
  });
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [institution, setInstitution] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setPolicy(data.policy);
      setCounts(data.counts);
      setInstitution(data.institution);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccess(false);
      await api.updateSettings(policy);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Institutional Policies & Configurations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional attendance calculation formulas, threshold rules, and QR token validity
          </p>
        </div>

        {success && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Policy updated successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Attendance Calculation Policy Parameters</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Minimum Threshold */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Minimum Attendance Threshold (%)
              </label>
              <p className="text-xs text-slate-500">
                Students below this percentage are classified as Defaulters and warned of examination debarment.
              </p>
              <input
                type="number"
                min={50}
                max={100}
                value={policy.minimumThresholdPercentage}
                onChange={e => setPolicy({ ...policy, minimumThresholdPercentage: Number(e.target.value) })}
                className="w-32 text-xs border border-slate-300 rounded-lg p-2 font-bold font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Late Policy */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-800">
                    Count "LATE" as Attended in Numerator
                  </span>
                  <p className="text-xs text-slate-500">
                    If enabled, late arrivals count towards student attendance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.countLateAsAttended}
                  onChange={e => setPolicy({ ...policy, countLateAsAttended: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {policy.countLateAsAttended && (
                <div className="pt-2 pl-4 border-l-2 border-blue-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Late Weight Credit (0.5 to 1.0)
                  </label>
                  <select
                    value={policy.lateWeight}
                    onChange={e => setPolicy({ ...policy, lateWeight: Number(e.target.value) })}
                    className="text-xs border border-slate-300 rounded-lg p-1.5 bg-slate-50"
                  >
                    <option value={1.0}>1.0 (Full presence credit)</option>
                    <option value={0.5}>0.5 (Half presence credit)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Excused Policy */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <span className="block text-xs font-semibold text-slate-800">
                  Exclude "EXCUSED" Absences from Denominator
                </span>
                <p className="text-xs text-slate-500">
                  Approved medical and official duty leaves will not penalize the student percentage.
                </p>
              </div>
              <input
                type="checkbox"
                checked={policy.excludeExcusedFromDenominator}
                onChange={e => setPolicy({ ...policy, excludeExcusedFromDenominator: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            {/* QR Validity */}
            <div className="space-y-1 border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-800">
                Dynamic QR Token Validity Window (Seconds)
              </label>
              <p className="text-xs text-slate-500">
                Tokens automatically expire and rotate after this duration to prevent replay attacks and screenshot sharing.
              </p>
              <input
                type="number"
                min={15}
                max={180}
                value={policy.qrTokenValiditySeconds}
                onChange={e => setPolicy({ ...policy, qrTokenValiditySeconds: Number(e.target.value) })}
                className="w-32 text-xs border border-slate-300 rounded-lg p-2 font-bold font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Apply Institutional Policy'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database & Institutional Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Campus Profile</span>
            </h3>
            <div className="text-xs space-y-1.5 text-slate-600">
              <p className="font-bold text-slate-900">{institution.name}</p>
              <p>Campus Code: <span className="font-mono">{institution.code}</span></p>
              <p>Timezone: <span className="font-mono">{institution.timezone}</span></p>
              <p>{institution.address}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Database Persistence Stats</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Total Active Students:</span>
                <span className="font-bold font-mono">{counts.totalStudents}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Teaching Faculty:</span>
                <span className="font-bold font-mono">{counts.totalTeachers}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Academic Classes:</span>
                <span className="font-bold font-mono">{counts.totalClasses}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Attendance Sessions:</span>
                <span className="font-bold font-mono">{counts.totalSessions}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Marked Student Records:</span>
                <span className="font-bold font-mono">{counts.totalRecords}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
