import type {
  User,
  Department,
  ClassRoom,
  Section,
  Subject,
  Teacher,
  Student,
  TimetableEntry,
  AttendanceSession,
  AttendanceRecord,
  CorrectionRequest,
  AuditLog,
  NotificationItem,
  AttendancePolicy,
  DashboardMetrics,
  UserRole,
  AttendanceStatus
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.error) errorMsg = errData.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth & Role
  getMe: () => fetchJson<{ user: User; institution: Record<string, unknown>; policy: AttendancePolicy }>('/auth/me'),
  switchRole: (role: UserRole) => fetchJson<{ user: User }>('/auth/switch-role', {
    method: 'POST',
    body: JSON.stringify({ role })
  }),

  // Students
  getStudents: (params?: { search?: string; departmentId?: string; classId?: string; sectionId?: string; defaultersOnly?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.departmentId) q.append('departmentId', params.departmentId);
    if (params?.classId) q.append('classId', params.classId);
    if (params?.sectionId) q.append('sectionId', params.sectionId);
    if (params?.defaultersOnly) q.append('defaultersOnly', 'true');
    return fetchJson<Student[]>(`/students?${q.toString()}`);
  },
  getStudentDetails: (id: string) => fetchJson<Student & { stats: Record<string, unknown>; records: AttendanceRecord[] }>(`/students/${id}`),
  createStudent: (student: Partial<Student>) => fetchJson<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(student)
  }),
  updateStudent: (id: string, data: Partial<Student>) => fetchJson<Student>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  bulkImportStudents: (rows: Array<{ rollNumber: string; fullName: string; email?: string; departmentId: string; classId: string; sectionId: string; semester?: number }>) =>
    fetchJson<{ success: boolean; importedCount: number; errors: Array<{ row: number; reason: string }> }>('/students/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ rows })
    }),

  // Teachers
  getTeachers: () => fetchJson<Teacher[]>('/teachers'),
  createTeacher: (teacher: Partial<Teacher>) => fetchJson<Teacher>('/teachers', {
    method: 'POST',
    body: JSON.stringify(teacher)
  }),

  // Academics
  getDepartments: () => fetchJson<Department[]>('/departments'),
  getClasses: () => fetchJson<ClassRoom[]>('/classes'),
  getSections: () => fetchJson<Section[]>('/sections'),
  getSubjects: () => fetchJson<Subject[]>('/subjects'),
  getTimetable: (params?: { classId?: string; teacherId?: string }) => {
    const q = new URLSearchParams();
    if (params?.classId) q.append('classId', params.classId);
    if (params?.teacherId) q.append('teacherId', params.teacherId);
    return fetchJson<TimetableEntry[]>(`/timetable?${q.toString()}`);
  },

  // Attendance Sessions & Records
  getSessions: (params?: { date?: string; classId?: string; subjectId?: string; teacherId?: string }) => {
    const q = new URLSearchParams();
    if (params?.date) q.append('date', params.date);
    if (params?.classId) q.append('classId', params.classId);
    if (params?.subjectId) q.append('subjectId', params.subjectId);
    if (params?.teacherId) q.append('teacherId', params.teacherId);
    return fetchJson<AttendanceSession[]>(`/attendance/sessions?${q.toString()}`);
  },
  getSessionDetails: (id: string) => fetchJson<{ session: AttendanceSession; students: Array<{ studentId: string; rollNumber: string; fullName: string; email: string; status: AttendanceStatus; remarks: string; checkInMethod: string; markedAt?: string }> }>(`/attendance/sessions/${id}`),
  createSession: (session: Partial<AttendanceSession>) => fetchJson<AttendanceSession>('/attendance/sessions', {
    method: 'POST',
    body: JSON.stringify(session)
  }),
  saveSessionRecords: (id: string, marks: Array<{ studentId: string; status: AttendanceStatus; remarks?: string }>) =>
    fetchJson<{ success: boolean; session: AttendanceSession; recordsSaved: number }>(`/attendance/sessions/${id}/records`, {
      method: 'PUT',
      body: JSON.stringify({ marks })
    }),
  submitSession: (id: string) => fetchJson<{ success: boolean; session: AttendanceSession }>(`/attendance/sessions/${id}/submit`, {
    method: 'POST'
  }),
  reopenSession: (id: string, reason: string) => fetchJson<{ success: boolean; session: AttendanceSession }>(`/attendance/sessions/${id}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),

  // QR Attendance
  generateQrToken: (sessionId: string) => fetchJson<{ sessionId: string; token: string; expiresAt: string; validitySeconds: number }>('/attendance/qr-token', {
    method: 'POST',
    body: JSON.stringify({ sessionId })
  }),
  checkInWithQr: (sessionId: string, token: string, studentId: string) => fetchJson<{ success: boolean; message: string; record: AttendanceRecord }>('/attendance/qr-checkin', {
    method: 'POST',
    body: JSON.stringify({ sessionId, token, studentId })
  }),

  // Reports
  getStudentReport: (studentId: string, subjectId?: string) => {
    const q = new URLSearchParams();
    q.append('studentId', studentId);
    if (subjectId && subjectId !== 'ALL') q.append('subjectId', subjectId);
    return fetchJson<{
      student: Student;
      stats: {
        totalEligibleSessions: number;
        attendedCount: number;
        presentCount: number;
        absentCount: number;
        lateCount: number;
        excusedCount: number;
        percentage: number;
        isDefaulter: boolean;
        classesNeeded: number;
      };
      records: Array<AttendanceRecord & { sessionDate?: string; subjectName?: string; subjectCode?: string; periodNumber?: number }>;
      policy: AttendancePolicy;
    }>(`/reports/student-attendance?${q.toString()}`);
  },
  getClassReport: (params?: { classId?: string; sectionId?: string; subjectId?: string }) => {
    const q = new URLSearchParams();
    if (params?.classId) q.append('classId', params.classId);
    if (params?.sectionId) q.append('sectionId', params.sectionId);
    if (params?.subjectId) q.append('subjectId', params.subjectId);
    return fetchJson<{
      classId?: string;
      sectionId?: string;
      totalStudents: number;
      classAverage: number;
      defaultersCount: number;
      policy: AttendancePolicy;
      students: Array<Student & { percentage: number; isDefaulter: boolean; classesNeeded: number; attendedCount: number; totalEligibleSessions: number; presentCount: number; absentCount: number; lateCount: number; excusedCount: number }>;
    }>(`/reports/class-attendance?${q.toString()}`);
  },
  getLowAttendanceReport: (threshold?: number) => {
    const q = new URLSearchParams();
    if (threshold) q.append('threshold', threshold.toString());
    return fetchJson<{
      threshold: number;
      totalDefaulters: number;
      defaulters: Array<{
        student: Student;
        stats: {
          totalEligibleSessions: number;
          attendedCount: number;
          percentage: number;
          classesNeeded: number;
          presentCount: number;
          absentCount: number;
        };
      }>;
    }>(`/reports/low-attendance?${q.toString()}`);
  },
  getAnalytics: () => fetchJson<DashboardMetrics>('/reports/analytics'),

  // Corrections
  getCorrectionRequests: (params?: { studentId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.status) q.append('status', params.status);
    return fetchJson<CorrectionRequest[]>(`/correction-requests?${q.toString()}`);
  },
  createCorrectionRequest: (data: { studentId: string; sessionId: string; requestedStatus: AttendanceStatus; explanation: string }) =>
    fetchJson<CorrectionRequest>('/correction-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  reviewCorrectionRequest: (id: string, decision: 'APPROVED' | 'REJECTED', comments?: string) =>
    fetchJson<{ success: boolean; correctionRequest: CorrectionRequest }>(`/correction-requests/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments })
    }),

  // Audit Logs
  getAuditLogs: () => fetchJson<AuditLog[]>('/audit-logs'),

  // Notifications
  getNotifications: () => fetchJson<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) => fetchJson<{ success: boolean }>(`/notifications/${id}/read`, {
    method: 'PATCH'
  }),
  broadcastLowAttendance: () => fetchJson<{ success: boolean; count: number }>('/notifications/broadcast-low-attendance', {
    method: 'POST'
  }),

  // Settings
  getSettings: () => fetchJson<{
    institution: Record<string, unknown>;
    policy: AttendancePolicy;
    counts: Record<string, number>;
  }>('/settings'),
  updateSettings: (policy: Partial<AttendancePolicy>) => fetchJson<{ success: boolean; policy: AttendancePolicy }>('/settings', {
    method: 'PUT',
    body: JSON.stringify(policy)
  }),

  // System
  getSystemStatus: () => fetchJson<{
    status: string;
    version: string;
    runtime: string;
    databaseEngine: string;
    activeSessions: number;
    totalRecords: number;
    uptimeSeconds: number;
    timestamp: string;
  }>('/system/status')
};
