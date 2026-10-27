export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNMARKED';

export type SessionState = 'DRAFT' | 'SUBMITTED' | 'LOCKED' | 'REOPENED';

export type CorrectionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  institutionId: string;
  studentId?: string;
  teacherId?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodName: string;
}

export interface AcademicYear {
  id: string;
  yearName: string; // e.g. "2026-2027"
  isCurrent: boolean;
}

export interface Semester {
  id: string;
  number: number;
  academicYearId: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "B.Tech CSE - 3rd Year"
  code: string;
  departmentId: string;
  semester: number;
  academicYear: string;
}

export interface Section {
  id: string;
  name: string; // e.g. "Section A"
  classId: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Database Management Systems"
  credits: number;
  departmentId: string;
  semester: number;
}

export interface Teacher {
  id: string;
  staffId: string; // e.g. "TCH-101"
  fullName: string;
  email: string;
  contactNumber?: string;
  departmentId: string;
  departmentName?: string;
  isActive: boolean;
  assignedSubjectIds: string[];
  assignedClassIds: string[];
}

export interface Student {
  id: string;
  rollNumber: string; // e.g. "CS23B101"
  fullName: string;
  email: string;
  contactNumber?: string;
  departmentId: string;
  departmentName?: string;
  classId: string;
  className?: string;
  sectionId: string;
  sectionName?: string;
  semester: number;
  academicYear: string;
  enrollmentDate: string;
  isActive: boolean;
  attendancePercentage?: number;
  totalSessions?: number;
  attendedSessions?: number;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  className?: string;
  sectionId: string;
  sectionName?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  teacherId: string;
  teacherName?: string;
  dayOfWeek: number; // 1 = Monday ... 6 = Saturday
  periodNumber: number;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  roomNumber: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className?: string;
  sectionId: string;
  sectionName?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  teacherId: string;
  teacherName?: string;
  sessionDate: string; // YYYY-MM-DD
  periodNumber: number;
  startTime?: string;
  endTime?: string;
  state: SessionState;
  qrToken?: string;
  qrExpiresAt?: string;
  totalEligible: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  unmarkedCount: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  submittedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentRollNumber?: string;
  studentName?: string;
  status: AttendanceStatus;
  remarks?: string;
  checkInMethod: 'MANUAL' | 'QR_CODE' | 'CORRECTION';
  markedAt: string;
  markedBy: string;
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentRollNumber: string;
  studentName: string;
  sessionId: string;
  sessionDate: string;
  subjectName: string;
  existingStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  explanation: string;
  submittedAt: string;
  status: CorrectionRequestStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewComments?: string;
  decisionAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  details: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // user id or 'ALL'
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ALERT';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface AttendancePolicy {
  minimumThresholdPercentage: number; // default 75
  countLateAsAttended: boolean; // default true
  lateWeight: number; // e.g. 1.0 or 0.5
  excludeExcusedFromDenominator: boolean; // default true
  qrTokenValiditySeconds: number; // default 30
}

export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayMarkedSessions: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  todayOverallPercentage: number;
  defaultersCount: number; // students < threshold
  pendingCorrectionsCount: number;
  classSummaries: {
    className: string;
    totalStudents: number;
    attendancePercentage: number;
    defaultersCount: number;
  }[];
  recentSessions: AttendanceSession[];
  weeklyTrends: {
    date: string;
    day: string;
    presentPercentage: number;
    totalMarked: number;
  }[];
}
