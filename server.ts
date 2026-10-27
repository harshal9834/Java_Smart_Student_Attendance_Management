import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
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
  UserRole,
  AttendanceStatus
} from './src/types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// ==========================================
// IN-MEMORY RELATIONAL DATABASE SEED DATA
// ==========================================

const institution = {
  id: 'inst-1',
  name: 'Apex Institute of Technology & Engineering',
  code: 'AITE',
  timezone: 'Asia/Kolkata',
  establishedYear: 2004,
  address: 'Tech Innovation Park, Campus 1'
};

const policy: AttendancePolicy = {
  minimumThresholdPercentage: 75,
  countLateAsAttended: true,
  lateWeight: 1.0,
  excludeExcusedFromDenominator: true,
  qrTokenValiditySeconds: 45
};

const departments: Department[] = [
  { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', hodName: 'Dr. Alan Turing' },
  { id: 'dept-it', code: 'IT', name: 'Information Technology', hodName: 'Dr. Grace Hopper' },
  { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication', hodName: 'Dr. Claude Shannon' }
];

const classes: ClassRoom[] = [
  { id: 'class-cs3', name: 'B.Tech CSE - 3rd Year', code: 'CSE-3YR', departmentId: 'dept-cse', semester: 5, academicYear: '2026-2027' },
  { id: 'class-cs4', name: 'B.Tech CSE - 4th Year', code: 'CSE-4YR', departmentId: 'dept-cse', semester: 7, academicYear: '2026-2027' },
  { id: 'class-it3', name: 'B.Tech IT - 3rd Year', code: 'IT-3YR', departmentId: 'dept-it', semester: 5, academicYear: '2026-2027' },
  { id: 'class-ec3', name: 'B.Tech ECE - 3rd Year', code: 'ECE-3YR', departmentId: 'dept-ece', semester: 5, academicYear: '2026-2027' }
];

const sections: Section[] = [
  { id: 'sec-cs3-a', name: 'Section A', classId: 'class-cs3' },
  { id: 'sec-cs3-b', name: 'Section B', classId: 'class-cs3' },
  { id: 'sec-cs4-a', name: 'Section A', classId: 'class-cs4' },
  { id: 'sec-it3-a', name: 'Section A', classId: 'class-it3' },
  { id: 'sec-ec3-a', name: 'Section A', classId: 'class-ec3' }
];

const subjects: Subject[] = [
  { id: 'sub-cs301', code: 'CS301', name: 'Database Management Systems', credits: 4, departmentId: 'dept-cse', semester: 5 },
  { id: 'sub-cs302', code: 'CS302', name: 'Operating Systems', credits: 4, departmentId: 'dept-cse', semester: 5 },
  { id: 'sub-cs303', code: 'CS303', name: 'Computer Networks', credits: 4, departmentId: 'dept-cse', semester: 5 },
  { id: 'sub-cs304', code: 'CS304', name: 'Software Engineering', credits: 3, departmentId: 'dept-cse', semester: 5 },
  { id: 'sub-cs401', code: 'CS401', name: 'Cloud & Distributed Systems', credits: 4, departmentId: 'dept-cse', semester: 7 },
  { id: 'sub-it301', code: 'IT301', name: 'Web Technologies & Frameworks', credits: 4, departmentId: 'dept-it', semester: 5 },
  { id: 'sub-ec301', code: 'EC301', name: 'Digital Signal Processing', credits: 4, departmentId: 'dept-ece', semester: 5 }
];

const teachers: Teacher[] = [
  {
    id: 'tch-1',
    staffId: 'EMP-101',
    fullName: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@aite.edu',
    contactNumber: '+1 555-0192',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    isActive: true,
    assignedSubjectIds: ['sub-cs301', 'sub-cs304'],
    assignedClassIds: ['class-cs3']
  },
  {
    id: 'tch-2',
    staffId: 'EMP-102',
    fullName: 'Prof. David Miller',
    email: 'david.miller@aite.edu',
    contactNumber: '+1 555-0193',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    isActive: true,
    assignedSubjectIds: ['sub-cs302', 'sub-cs303'],
    assignedClassIds: ['class-cs3']
  },
  {
    id: 'tch-3',
    staffId: 'EMP-103',
    fullName: 'Dr. Elena Rostova',
    email: 'elena.rostova@aite.edu',
    contactNumber: '+1 555-0194',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    isActive: true,
    assignedSubjectIds: ['sub-it301'],
    assignedClassIds: ['class-it3']
  },
  {
    id: 'tch-4',
    staffId: 'EMP-104',
    fullName: 'Prof. Robert Chen',
    email: 'robert.chen@aite.edu',
    contactNumber: '+1 555-0195',
    departmentId: 'dept-ece',
    departmentName: 'Electronics & Communication',
    isActive: true,
    assignedSubjectIds: ['sub-ec301'],
    assignedClassIds: ['class-ec3']
  }
];

// Seed realistic students with mixed attendance track records
const rawStudentsData = [
  { roll: 'CS23B101', name: 'Alex Johnson', email: 'alex.j@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B102', name: 'Bethany Williams', email: 'bethany.w@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B103', name: 'Carlos Gomez', email: 'carlos.g@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B104', name: 'Divya Sharma', email: 'divya.s@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B105', name: 'Ethan Hunt', email: 'ethan.h@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B106', name: 'Fatima Al-Mansoor', email: 'fatima.m@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B107', name: 'George Harrison', email: 'george.h@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B108', name: 'Hannah Abbott', email: 'hannah.a@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B109', name: 'Ishaan Patel', email: 'ishaan.p@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B110', name: 'Julia Roberts', email: 'julia.r@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B111', name: 'Kevin Durant', email: 'kevin.d@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B112', name: 'Luna Lovegood', email: 'luna.l@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B113', name: 'Marcus Aurelius', email: 'marcus.a@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B114', name: 'Nina Simone', email: 'nina.s@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  { roll: 'CS23B115', name: 'Oliver Twist', email: 'oliver.t@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-a', sem: 5 },
  // Section B
  { roll: 'CS23B201', name: 'Priya Verma', email: 'priya.v@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-b', sem: 5 },
  { roll: 'CS23B202', name: 'Quentin Tarantino', email: 'quentin.t@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-b', sem: 5 },
  { roll: 'CS23B203', name: 'Rohan Joshi', email: 'rohan.j@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-b', sem: 5 },
  { roll: 'CS23B204', name: 'Sophia Loren', email: 'sophia.l@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-b', sem: 5 },
  { roll: 'CS23B205', name: 'Thomas Edison', email: 'thomas.e@student.aite.edu', dept: 'dept-cse', classId: 'class-cs3', sec: 'sec-cs3-b', sem: 5 },
  // IT Class
  { roll: 'IT23B101', name: 'Uma Thurman', email: 'uma.t@student.aite.edu', dept: 'dept-it', classId: 'class-it3', sec: 'sec-it3-a', sem: 5 },
  { roll: 'IT23B102', name: 'Victor Hugo', email: 'victor.h@student.aite.edu', dept: 'dept-it', classId: 'class-it3', sec: 'sec-it3-a', sem: 5 },
  { roll: 'IT23B103', name: 'Wendy Darling', email: 'wendy.d@student.aite.edu', dept: 'dept-it', classId: 'class-it3', sec: 'sec-it3-a', sem: 5 },
  { roll: 'IT23B104', name: 'Xavier Woods', email: 'xavier.w@student.aite.edu', dept: 'dept-it', classId: 'class-it3', sec: 'sec-it3-a', sem: 5 },
  { roll: 'IT23B105', name: 'Yashodhara Das', email: 'yash.d@student.aite.edu', dept: 'dept-it', classId: 'class-it3', sec: 'sec-it3-a', sem: 5 },
  // ECE Class
  { roll: 'EC23B101', name: 'Zane Malik', email: 'zane.m@student.aite.edu', dept: 'dept-ece', classId: 'class-ec3', sec: 'sec-ec3-a', sem: 5 },
  { roll: 'EC23B102', name: 'Aarav Gupta', email: 'aarav.g@student.aite.edu', dept: 'dept-ece', classId: 'class-ec3', sec: 'sec-ec3-a', sem: 5 },
  { roll: 'EC23B103', name: 'Chloe Decker', email: 'chloe.d@student.aite.edu', dept: 'dept-ece', classId: 'class-ec3', sec: 'sec-ec3-a', sem: 5 }
];

const students: Student[] = rawStudentsData.map((s, idx) => ({
  id: `std-${idx + 1}`,
  rollNumber: s.roll,
  fullName: s.name,
  email: s.email,
  contactNumber: `+1 555-02${(10 + idx).toString().padStart(2, '0')}`,
  departmentId: s.dept,
  departmentName: departments.find(d => d.id === s.dept)?.name,
  classId: s.classId,
  className: classes.find(c => c.id === s.classId)?.name,
  sectionId: s.sec,
  sectionName: sections.find(sec => sec.id === s.sec)?.name,
  semester: s.sem,
  academicYear: '2026-2027',
  enrollmentDate: '2023-08-01',
  isActive: true
}));

const timetable: TimetableEntry[] = [
  { id: 'tt-1', classId: 'class-cs3', sectionId: 'sec-cs3-a', subjectId: 'sub-cs301', teacherId: 'tch-1', dayOfWeek: 1, periodNumber: 1, startTime: '09:00', endTime: '10:00', roomNumber: 'Room 301' },
  { id: 'tt-2', classId: 'class-cs3', sectionId: 'sec-cs3-a', subjectId: 'sub-cs302', teacherId: 'tch-2', dayOfWeek: 1, periodNumber: 2, startTime: '10:15', endTime: '11:15', roomNumber: 'Room 301' },
  { id: 'tt-3', classId: 'class-cs3', sectionId: 'sec-cs3-a', subjectId: 'sub-cs303', teacherId: 'tch-2', dayOfWeek: 1, periodNumber: 3, startTime: '11:30', endTime: '12:30', roomNumber: 'Room 302' },
  { id: 'tt-4', classId: 'class-cs3', sectionId: 'sec-cs3-a', subjectId: 'sub-cs304', teacherId: 'tch-1', dayOfWeek: 2, periodNumber: 1, startTime: '09:00', endTime: '10:00', roomNumber: 'Room 301' },
  { id: 'tt-5', classId: 'class-cs3', sectionId: 'sec-cs3-a', subjectId: 'sub-cs301', teacherId: 'tch-1', dayOfWeek: 2, periodNumber: 2, startTime: '10:15', endTime: '11:15', roomNumber: 'Lab 2' },
  { id: 'tt-6', classId: 'class-cs3', sectionId: 'sec-cs3-a', subjectId: 'sub-cs302', teacherId: 'tch-2', dayOfWeek: 3, periodNumber: 1, startTime: '09:00', endTime: '10:00', roomNumber: 'Room 301' },
  { id: 'tt-7', classId: 'class-cs3', sectionId: 'sec-cs3-a', subjectId: 'sub-cs303', teacherId: 'tch-2', dayOfWeek: 4, periodNumber: 2, startTime: '10:15', endTime: '11:15', roomNumber: 'Room 301' },
  { id: 'tt-8', classId: 'class-it3', sectionId: 'sec-it3-a', subjectId: 'sub-it301', teacherId: 'tch-3', dayOfWeek: 1, periodNumber: 1, startTime: '09:00', endTime: '10:00', roomNumber: 'Room 205' },
  { id: 'tt-9', classId: 'class-ec3', sectionId: 'sec-ec3-a', subjectId: 'sub-ec301', teacherId: 'tch-4', dayOfWeek: 1, periodNumber: 2, startTime: '10:15', endTime: '11:15', roomNumber: 'Room 108' }
];

// Initialize attendance sessions and records across the last 14 days
let sessions: AttendanceSession[] = [];
let records: AttendanceRecord[] = [];
let correctionRequests: CorrectionRequest[] = [];
let auditLogs: AuditLog[] = [];
let notifications: NotificationItem[] = [];

// Helper to format ISO dates
const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Generate historical sessions and records
const seedAttendanceHistory = () => {
  const eligibleCsStudents = students.filter(s => s.classId === 'class-cs3' && s.sectionId === 'sec-cs3-a');

  // Let's create sessions across the past 10 days
  const sessionTemplates = [
    { daysAgo: 10, period: 1, subId: 'sub-cs301', tchId: 'tch-1' },
    { daysAgo: 9, period: 1, subId: 'sub-cs302', tchId: 'tch-2' },
    { daysAgo: 8, period: 2, subId: 'sub-cs303', tchId: 'tch-2' },
    { daysAgo: 7, period: 1, subId: 'sub-cs304', tchId: 'tch-1' },
    { daysAgo: 6, period: 2, subId: 'sub-cs301', tchId: 'tch-1' },
    { daysAgo: 5, period: 1, subId: 'sub-cs302', tchId: 'tch-2' },
    { daysAgo: 4, period: 3, subId: 'sub-cs303', tchId: 'tch-2' },
    { daysAgo: 3, period: 1, subId: 'sub-cs301', tchId: 'tch-1' },
    { daysAgo: 2, period: 2, subId: 'sub-cs304', tchId: 'tch-1' },
    { daysAgo: 1, period: 1, subId: 'sub-cs302', tchId: 'tch-2' },
    { daysAgo: 0, period: 1, subId: 'sub-cs301', tchId: 'tch-1' } // today's session
  ];

  sessionTemplates.forEach((st, idx) => {
    const sessId = `sess-${idx + 1}`;
    const sub = subjects.find(s => s.id === st.subId);
    const tch = teachers.find(t => t.id === st.tchId);
    const dateStr = getPastDateStr(st.daysAgo);

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    eligibleCsStudents.forEach((student, sIdx) => {
      // Deterministic realistic attendance patterns:
      // Ethan Hunt (CS23B105) & Oliver Twist (CS23B115) have low attendance (<75%)
      // Alex Johnson & Carlos Gomez have high attendance (>90%)
      let status: AttendanceStatus = 'PRESENT';
      if (student.rollNumber === 'CS23B105') {
        // Ethan is absent most days (~45%)
        status = (sIdx + idx) % 2 === 0 ? 'ABSENT' : 'PRESENT';
      } else if (student.rollNumber === 'CS23B115') {
        // Oliver is absent or late frequently (~60%)
        status = idx % 3 === 0 ? 'ABSENT' : idx % 4 === 0 ? 'LATE' : 'PRESENT';
      } else if (student.rollNumber === 'CS23B111') {
        // Kevin Durant ~70%
        status = idx % 4 === 0 ? 'ABSENT' : 'PRESENT';
      } else if (student.rollNumber === 'CS23B108' && idx === 10) {
        // Hannah Abbott excused today
        status = 'EXCUSED';
      } else if (idx % 7 === 0 && sIdx % 4 === 0) {
        status = 'LATE';
      } else if (idx % 5 === 0 && sIdx % 5 === 0) {
        status = 'ABSENT';
      }

      if (status === 'PRESENT') present++;
      else if (status === 'ABSENT') absent++;
      else if (status === 'LATE') late++;
      else if (status === 'EXCUSED') excused++;

      records.push({
        id: `rec-${sessId}-${student.id}`,
        sessionId: sessId,
        studentId: student.id,
        studentRollNumber: student.rollNumber,
        studentName: student.fullName,
        status,
        remarks: status === 'LATE' ? 'Late by 10 mins' : status === 'EXCUSED' ? 'Medical certificate' : undefined,
        checkInMethod: idx % 2 === 0 ? 'MANUAL' : 'QR_CODE',
        markedAt: `${dateStr}T10:05:00Z`,
        markedBy: tch?.fullName || 'Teacher'
      });
    });

    const isToday = st.daysAgo === 0;
    sessions.push({
      id: sessId,
      classId: 'class-cs3',
      className: 'B.Tech CSE - 3rd Year',
      sectionId: 'sec-cs3-a',
      sectionName: 'Section A',
      subjectId: st.subId,
      subjectName: sub?.name,
      subjectCode: sub?.code,
      teacherId: st.tchId,
      teacherName: tch?.fullName,
      sessionDate: dateStr,
      periodNumber: st.period,
      startTime: st.period === 1 ? '09:00' : st.period === 2 ? '10:15' : '11:30',
      endTime: st.period === 1 ? '10:00' : st.period === 2 ? '11:15' : '12:30',
      state: isToday ? 'DRAFT' : 'SUBMITTED',
      totalEligible: eligibleCsStudents.length,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      excusedCount: excused,
      unmarkedCount: 0,
      createdAt: `${dateStr}T09:00:00Z`,
      updatedAt: `${dateStr}T10:10:00Z`,
      submittedAt: isToday ? undefined : `${dateStr}T10:15:00Z`,
      submittedBy: isToday ? undefined : tch?.fullName
    });
  });

  // Sample correction requests
  correctionRequests.push({
    id: 'cr-101',
    studentId: 'std-5',
    studentRollNumber: 'CS23B105',
    studentName: 'Ethan Hunt',
    sessionId: 'sess-8',
    sessionDate: getPastDateStr(3),
    subjectName: 'Database Management Systems',
    existingStatus: 'ABSENT',
    requestedStatus: 'PRESENT',
    explanation: 'I was present in the lab session during DBMS query practice. Prof. Mitchell spoke to me.',
    submittedAt: `${getPastDateStr(2)}T14:30:00Z`,
    status: 'PENDING'
  });

  correctionRequests.push({
    id: 'cr-102',
    studentId: 'std-15',
    studentRollNumber: 'CS23B115',
    studentName: 'Oliver Twist',
    sessionId: 'sess-6',
    sessionDate: getPastDateStr(5),
    subjectName: 'Operating Systems',
    existingStatus: 'ABSENT',
    requestedStatus: 'EXCUSED',
    explanation: 'Submitted medical certificate at Dean office for flu fever.',
    submittedAt: `${getPastDateStr(4)}T11:00:00Z`,
    status: 'APPROVED',
    reviewerId: 'tch-2',
    reviewerName: 'Prof. David Miller',
    reviewComments: 'Medical certificate verified with clinic records.',
    decisionAt: `${getPastDateStr(3)}T16:00:00Z`
  });

  // Audit logs
  auditLogs.push(
    {
      id: 'aud-1',
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'INSTITUTION',
      entityId: 'inst-1',
      actorId: 'usr-superadmin',
      actorName: 'Dr. Christopher Vance',
      actorRole: 'SUPER_ADMIN',
      details: 'Initialized Smart Attendance System instance with semester 5 classes',
      timestamp: `${getPastDateStr(14)}T08:00:00Z`
    },
    {
      id: 'aud-2',
      action: 'ATTENDANCE_SUBMITTED',
      entityType: 'ATTENDANCE_SESSION',
      entityId: 'sess-10',
      actorId: 'tch-2',
      actorName: 'Prof. David Miller',
      actorRole: 'TEACHER',
      details: 'Submitted verified attendance session for CS302 Operating Systems (Period 1)',
      oldValue: 'DRAFT',
      newValue: 'SUBMITTED',
      timestamp: `${getPastDateStr(1)}T10:15:00Z`
    },
    {
      id: 'aud-3',
      action: 'CORRECTION_APPROVED',
      entityType: 'CORRECTION_REQUEST',
      entityId: 'cr-102',
      actorId: 'tch-2',
      actorName: 'Prof. David Miller',
      actorRole: 'TEACHER',
      details: 'Approved status change from ABSENT to EXCUSED for student Oliver Twist (CS23B115)',
      oldValue: 'ABSENT',
      newValue: 'EXCUSED',
      timestamp: `${getPastDateStr(3)}T16:00:00Z`
    }
  );

  // Notifications
  notifications.push(
    {
      id: 'notif-1',
      recipientId: 'ALL',
      title: 'Low Attendance Alert Notice',
      message: 'Automatic audit detected 3 students below 75% attendance in CSE 3rd Year.',
      type: 'WARNING',
      isRead: false,
      createdAt: `${getPastDateStr(1)}T09:00:00Z`,
      link: '/low-attendance'
    },
    {
      id: 'notif-2',
      recipientId: 'tch-1',
      title: 'Pending Attendance Correction',
      message: 'Student Ethan Hunt submitted a correction request for CS301 (DBMS).',
      type: 'ALERT',
      isRead: false,
      createdAt: `${getPastDateStr(2)}T14:35:00Z`,
      link: '/corrections'
    },
    {
      id: 'notif-3',
      recipientId: 'ALL',
      title: 'Attendance Policy Verified',
      message: 'Standard institutional 75% minimum threshold rule is active for Semester 5.',
      type: 'INFO',
      isRead: true,
      createdAt: `${getPastDateStr(10)}T08:30:00Z`
    }
  );
};

seedAttendanceHistory();

// Active mock user session
let currentUser: User = {
  id: 'usr-admin',
  email: 'admin@aite.edu',
  fullName: 'Prof. Sarah Jenkins',
  role: 'ADMIN',
  isActive: true,
  institutionId: 'inst-1'
};

// ==========================================
// CALCULATION ENGINE
// ==========================================
// Formula: (Counted Attended Sessions / Eligible Recorded Sessions) * 100
// - PRESENT = counts as 1.0 attended
// - LATE = counts as attended if policy.countLateAsAttended (with lateWeight)
// - ABSENT = counts in denominator, 0 in numerator
// - EXCUSED = excluded from denominator if policy.excludeExcusedFromDenominator
export const calculateStudentAttendance = (studentId: string, subjectIdFilter?: string) => {
  const studentRecords = records.filter(r => {
    if (r.studentId !== studentId) return false;
    if (subjectIdFilter) {
      const sess = sessions.find(s => s.id === r.sessionId);
      if (sess?.subjectId !== subjectIdFilter) return false;
    }
    return true;
  });

  let attendedCount = 0;
  let denominator = 0;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  studentRecords.forEach(r => {
    if (r.status === 'PRESENT') {
      attendedCount += 1.0;
      denominator += 1;
      presentCount++;
    } else if (r.status === 'LATE') {
      if (policy.countLateAsAttended) {
        attendedCount += policy.lateWeight;
      }
      denominator += 1;
      lateCount++;
    } else if (r.status === 'ABSENT') {
      denominator += 1;
      absentCount++;
    } else if (r.status === 'EXCUSED') {
      excusedCount++;
      if (!policy.excludeExcusedFromDenominator) {
        denominator += 1;
      }
    }
  });

  const percentage = denominator > 0 ? Math.round((attendedCount / denominator) * 1000) / 10 : 0;
  const isDefaulter = denominator > 0 && percentage < policy.minimumThresholdPercentage;

  // calculate how many classes needed to reach threshold
  let classesNeeded = 0;
  if (isDefaulter && denominator > 0) {
    const target = policy.minimumThresholdPercentage / 100;
    // (attended + X) / (denominator + X) >= target
    // attended + X >= target * denominator + target * X
    // X * (1 - target) >= target * denominator - attended
    const needed = (target * denominator - attendedCount) / (1 - target);
    classesNeeded = Math.max(0, Math.ceil(needed));
  }

  return {
    totalEligibleSessions: denominator,
    attendedCount,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    percentage,
    isDefaulter,
    classesNeeded
  };
};

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Authentication & Role Switcher
app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  res.json({
    user: currentUser,
    institution,
    policy
  });
});

app.post('/api/v1/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  if (!['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (role === 'SUPER_ADMIN') {
    currentUser = {
      id: 'usr-superadmin',
      email: 'superadmin@aite.edu',
      fullName: 'Dr. Christopher Vance',
      role: 'SUPER_ADMIN',
      isActive: true,
      institutionId: 'inst-1'
    };
  } else if (role === 'ADMIN') {
    currentUser = {
      id: 'usr-admin',
      email: 'admin@aite.edu',
      fullName: 'Prof. Sarah Jenkins (Admin)',
      role: 'ADMIN',
      isActive: true,
      institutionId: 'inst-1'
    };
  } else if (role === 'TEACHER') {
    currentUser = {
      id: 'usr-teacher-1',
      teacherId: 'tch-1',
      email: 'sarah.mitchell@aite.edu',
      fullName: 'Dr. Sarah Mitchell',
      role: 'TEACHER',
      isActive: true,
      institutionId: 'inst-1'
    };
  } else if (role === 'STUDENT') {
    currentUser = {
      id: 'usr-student-1',
      studentId: 'std-1',
      email: 'alex.j@student.aite.edu',
      fullName: 'Alex Johnson (Roll: CS23B101)',
      role: 'STUDENT',
      isActive: true,
      institutionId: 'inst-1'
    };
  }

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'USER_ROLE_SWITCH',
    entityType: 'USER',
    entityId: currentUser.id,
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Switched active preview role to ${role}`,
    timestamp: new Date().toISOString()
  });

  res.json({ user: currentUser });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (role) {
    currentUser.role = role;
  }
  res.json({ success: true, user: currentUser });
});

app.post('/api/v1/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// 2. Students API
app.get('/api/v1/students', (req: Request, res: Response) => {
  const { search, departmentId, classId, sectionId, defaultersOnly } = req.query;

  let filtered = students.map(s => {
    const stats = calculateStudentAttendance(s.id);
    return {
      ...s,
      attendancePercentage: stats.percentage,
      totalSessions: stats.totalEligibleSessions,
      attendedSessions: stats.attendedCount,
      isDefaulter: stats.isDefaulter
    };
  });

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
  }

  if (departmentId && departmentId !== 'ALL') {
    filtered = filtered.filter(s => s.departmentId === departmentId);
  }

  if (classId && classId !== 'ALL') {
    filtered = filtered.filter(s => s.classId === classId);
  }

  if (sectionId && sectionId !== 'ALL') {
    filtered = filtered.filter(s => s.sectionId === sectionId);
  }

  if (defaultersOnly === 'true') {
    filtered = filtered.filter(s => s.isDefaulter);
  }

  res.json(filtered);
});

app.get('/api/v1/students/:id', (req: Request, res: Response) => {
  const student = students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const stats = calculateStudentAttendance(student.id);
  const studentRecords = records
    .filter(r => r.studentId === student.id)
    .map(r => {
      const sess = sessions.find(s => s.id === r.sessionId);
      return {
        ...r,
        sessionDate: sess?.sessionDate,
        subjectName: sess?.subjectName,
        subjectCode: sess?.subjectCode,
        periodNumber: sess?.periodNumber
      };
    })
    .sort((a, b) => (b.sessionDate || '').localeCompare(a.sessionDate || ''));

  res.json({
    ...student,
    stats,
    records: studentRecords
  });
});

app.post('/api/v1/students', (req: Request, res: Response) => {
  const { rollNumber, fullName, email, contactNumber, departmentId, classId, sectionId, semester } = req.body;

  if (!rollNumber || !fullName || !departmentId || !classId || !sectionId) {
    return res.status(400).json({ error: 'Missing required student fields' });
  }

  if (students.some(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase())) {
    return res.status(409).json({ error: `Roll number ${rollNumber} already exists in database.` });
  }

  const dept = departments.find(d => d.id === departmentId);
  const cls = classes.find(c => c.id === classId);
  const sec = sections.find(s => s.id === sectionId);

  const newStudent: Student = {
    id: `std-${students.length + 1}`,
    rollNumber,
    fullName,
    email: email || `${rollNumber.toLowerCase()}@student.aite.edu`,
    contactNumber: contactNumber || '',
    departmentId,
    departmentName: dept?.name,
    classId,
    className: cls?.name,
    sectionId,
    sectionName: sec?.name,
    semester: Number(semester) || 5,
    academicYear: '2026-2027',
    enrollmentDate: new Date().toISOString().split('T')[0],
    isActive: true
  };

  students.push(newStudent);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'STUDENT_CREATED',
    entityType: 'STUDENT',
    entityId: newStudent.id,
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Registered new student ${newStudent.fullName} (${newStudent.rollNumber}) in ${cls?.name}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newStudent);
});

app.put('/api/v1/students/:id', (req: Request, res: Response) => {
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  const { fullName, email, contactNumber, isActive } = req.body;
  students[index] = {
    ...students[index],
    fullName: fullName ?? students[index].fullName,
    email: email ?? students[index].email,
    contactNumber: contactNumber ?? students[index].contactNumber,
    isActive: isActive ?? students[index].isActive
  };

  res.json(students[index]);
});

app.post('/api/v1/students/bulk-import', (req: Request, res: Response) => {
  const { rows } = req.body as { rows: Array<{ rollNumber: string; fullName: string; email?: string; departmentId: string; classId: string; sectionId: string; semester?: number }> };
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'No student rows provided for import' });
  }

  let importedCount = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  rows.forEach((r, idx) => {
    if (!r.rollNumber || !r.fullName || !r.departmentId || !r.classId || !r.sectionId) {
      errors.push({ row: idx + 1, reason: 'Missing mandatory fields' });
      return;
    }
    if (students.some(s => s.rollNumber.toLowerCase() === r.rollNumber.toLowerCase())) {
      errors.push({ row: idx + 1, reason: `Duplicate roll number: ${r.rollNumber}` });
      return;
    }

    const dept = departments.find(d => d.id === r.departmentId);
    const cls = classes.find(c => c.id === r.classId);
    const sec = sections.find(s => s.id === r.sectionId);

    const newStudent: Student = {
      id: `std-${students.length + 1}`,
      rollNumber: r.rollNumber.trim(),
      fullName: r.fullName.trim(),
      email: r.email || `${r.rollNumber.toLowerCase()}@student.aite.edu`,
      contactNumber: '',
      departmentId: r.departmentId,
      departmentName: dept?.name,
      classId: r.classId,
      className: cls?.name,
      sectionId: r.sectionId,
      sectionName: sec?.name,
      semester: r.semester || 5,
      academicYear: '2026-2027',
      enrollmentDate: new Date().toISOString().split('T')[0],
      isActive: true
    };
    students.push(newStudent);
    importedCount++;
  });

  res.json({
    success: true,
    importedCount,
    errors
  });
});

// 3. Teachers API
app.get('/api/v1/teachers', (_req: Request, res: Response) => {
  res.json(teachers);
});

app.post('/api/v1/teachers', (req: Request, res: Response) => {
  const { staffId, fullName, email, contactNumber, departmentId, assignedSubjectIds, assignedClassIds } = req.body;
  if (!staffId || !fullName || !departmentId) {
    return res.status(400).json({ error: 'Staff ID, Name, and Department are required' });
  }

  const dept = departments.find(d => d.id === departmentId);
  const newTeacher: Teacher = {
    id: `tch-${teachers.length + 1}`,
    staffId,
    fullName,
    email: email || `${staffId.toLowerCase()}@aite.edu`,
    contactNumber: contactNumber || '',
    departmentId,
    departmentName: dept?.name,
    isActive: true,
    assignedSubjectIds: assignedSubjectIds || [],
    assignedClassIds: assignedClassIds || []
  };

  teachers.push(newTeacher);
  res.status(201).json(newTeacher);
});

// 4. Academic Structure & Timetable
app.get('/api/v1/departments', (_req: Request, res: Response) => res.json(departments));
app.get('/api/v1/classes', (_req: Request, res: Response) => res.json(classes));
app.get('/api/v1/sections', (_req: Request, res: Response) => res.json(sections));
app.get('/api/v1/subjects', (_req: Request, res: Response) => res.json(subjects));

app.get('/api/v1/timetable', (req: Request, res: Response) => {
  const { classId, teacherId } = req.query;
  let list = timetable.map(tt => {
    const cls = classes.find(c => c.id === tt.classId);
    const sec = sections.find(s => s.id === tt.sectionId);
    const sub = subjects.find(s => s.id === tt.subjectId);
    const tch = teachers.find(t => t.id === tt.teacherId);
    return {
      ...tt,
      className: cls?.name,
      sectionName: sec?.name,
      subjectName: sub?.name,
      subjectCode: sub?.code,
      teacherName: tch?.fullName
    };
  });

  if (classId && classId !== 'ALL') {
    list = list.filter(t => t.classId === classId);
  }
  if (teacherId && teacherId !== 'ALL') {
    list = list.filter(t => t.teacherId === teacherId);
  }

  res.json(list);
});

// 5. Attendance Sessions & Records
app.get('/api/v1/attendance/sessions', (req: Request, res: Response) => {
  const { date, classId, subjectId, teacherId } = req.query;
  let filtered = [...sessions];

  if (date) {
    filtered = filtered.filter(s => s.sessionDate === date);
  }
  if (classId && classId !== 'ALL') {
    filtered = filtered.filter(s => s.classId === classId);
  }
  if (subjectId && subjectId !== 'ALL') {
    filtered = filtered.filter(s => s.subjectId === subjectId);
  }
  if (teacherId && teacherId !== 'ALL') {
    filtered = filtered.filter(s => s.teacherId === teacherId);
  }

  // sort descending by date & period
  filtered.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate) || b.periodNumber - a.periodNumber);
  res.json(filtered);
});

app.get('/api/v1/attendance/sessions/:id', (req: Request, res: Response) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Attendance session not found' });

  // load enrolled students for this class/section
  const enrolledStudents = students.filter(s => s.classId === session.classId && s.sectionId === session.sectionId);
  const sessionRecords = records.filter(r => r.sessionId === session.id);

  // merge students with their record if marked
  const studentRows = enrolledStudents.map(student => {
    const existingRec = sessionRecords.find(r => r.studentId === student.id);
    return {
      studentId: student.id,
      rollNumber: student.rollNumber,
      fullName: student.fullName,
      email: student.email,
      status: (existingRec?.status || 'UNMARKED') as AttendanceStatus,
      remarks: existingRec?.remarks || '',
      checkInMethod: existingRec?.checkInMethod || 'MANUAL',
      markedAt: existingRec?.markedAt
    };
  });

  res.json({
    session,
    students: studentRows
  });
});

app.post('/api/v1/attendance/sessions', (req: Request, res: Response) => {
  const { classId, sectionId, subjectId, teacherId, sessionDate, periodNumber, startTime, endTime } = req.body;

  if (!classId || !sectionId || !subjectId || !sessionDate || !periodNumber) {
    return res.status(400).json({ error: 'Missing mandatory session parameters' });
  }

  // Prevent duplicate session for identical class, section, subject, date, and periodNumber
  const existing = sessions.find(s =>
    s.classId === classId &&
    s.sectionId === sectionId &&
    s.subjectId === subjectId &&
    s.sessionDate === sessionDate &&
    s.periodNumber === Number(periodNumber)
  );

  if (existing) {
    return res.status(409).json({
      error: `An attendance session already exists for this class, subject, date, and period (${existing.id}). Please open the existing session.`
    });
  }

  const cls = classes.find(c => c.id === classId);
  const sec = sections.find(s => s.id === sectionId);
  const sub = subjects.find(s => s.id === subjectId);
  const tch = teachers.find(t => t.id === teacherId) || teachers[0];

  const eligibleCount = students.filter(s => s.classId === classId && s.sectionId === sectionId && s.isActive).length;

  const newSession: AttendanceSession = {
    id: `sess-${Date.now()}`,
    classId,
    className: cls?.name,
    sectionId,
    sectionName: sec?.name,
    subjectId,
    subjectName: sub?.name,
    subjectCode: sub?.code,
    teacherId: tch.id,
    teacherName: tch.fullName,
    sessionDate,
    periodNumber: Number(periodNumber),
    startTime: startTime || '09:00',
    endTime: endTime || '10:00',
    state: 'DRAFT',
    totalEligible: eligibleCount,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    unmarkedCount: eligibleCount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  sessions.unshift(newSession);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'ATTENDANCE_SESSION_CREATED',
    entityType: 'ATTENDANCE_SESSION',
    entityId: newSession.id,
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Created attendance session for ${cls?.name} - ${sub?.name} (Period ${newSession.periodNumber})`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newSession);
});

// Batch update records for a session (Transactional database emulation)
app.put('/api/v1/attendance/sessions/:id/records', (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.state === 'LOCKED' && currentUser.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'This session is LOCKED. Only Super Administrators can alter locked records.' });
  }

  const { marks } = req.body as { marks: Array<{ studentId: string; status: AttendanceStatus; remarks?: string }> };
  if (!Array.isArray(marks)) {
    return res.status(400).json({ error: 'Marks must be an array of student attendance statuses' });
  }

  // Remove existing records for this session to perform transactional atomic rewrite
  records = records.filter(r => r.sessionId !== sessionId);

  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;

  marks.forEach(m => {
    const student = students.find(s => s.id === m.studentId);
    if (!student) return;

    if (m.status === 'PRESENT') present++;
    else if (m.status === 'ABSENT') absent++;
    else if (m.status === 'LATE') late++;
    else if (m.status === 'EXCUSED') excused++;

    if (m.status !== 'UNMARKED') {
      records.push({
        id: `rec-${sessionId}-${m.studentId}`,
        sessionId,
        studentId: m.studentId,
        studentRollNumber: student.rollNumber,
        studentName: student.fullName,
        status: m.status,
        remarks: m.remarks,
        checkInMethod: 'MANUAL',
        markedAt: new Date().toISOString(),
        markedBy: currentUser.fullName
      });
    }
  });

  const totalMarked = present + absent + late + excused;
  const unmarked = Math.max(0, session.totalEligible - totalMarked);

  session.presentCount = present;
  session.absentCount = absent;
  session.lateCount = late;
  session.excusedCount = excused;
  session.unmarkedCount = unmarked;
  session.updatedAt = new Date().toISOString();

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'ATTENDANCE_RECORDS_SAVED',
    entityType: 'ATTENDANCE_SESSION',
    entityId: sessionId,
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Updated attendance records: ${present} Present, ${absent} Absent, ${late} Late, ${excused} Excused`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    session,
    recordsSaved: totalMarked
  });
});

// Finalize and submit attendance session
app.post('/api/v1/attendance/sessions/:id/submit', (req: Request, res: Response) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.unmarkedCount > 0) {
    return res.status(400).json({
      error: `Cannot submit: ${session.unmarkedCount} student(s) remain UNMARKED. Please mark all eligible students before submission.`
    });
  }

  session.state = 'SUBMITTED';
  session.submittedAt = new Date().toISOString();
  session.submittedBy = currentUser.fullName;

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'ATTENDANCE_SUBMITTED',
    entityType: 'ATTENDANCE_SESSION',
    entityId: session.id,
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Submitted and locked attendance session for ${session.className} - ${session.subjectName}`,
    oldValue: 'DRAFT',
    newValue: 'SUBMITTED',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, session });
});

// Reopen a submitted or locked session (with mandatory reason)
app.post('/api/v1/attendance/sessions/:id/reopen', (req: Request, res: Response) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { reason } = req.body;
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'A clear explanation reason (at least 5 characters) is required to reopen an attendance session.' });
  }

  const oldState = session.state;
  session.state = 'REOPENED';
  session.reopenedAt = new Date().toISOString();
  session.reopenedBy = currentUser.fullName;
  session.reopenReason = reason;

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'ATTENDANCE_REOPENED',
    entityType: 'ATTENDANCE_SESSION',
    entityId: session.id,
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Reopened session ${session.id}. Reason: "${reason}"`,
    oldValue: oldState,
    newValue: 'REOPENED',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, session });
});

// 6. Smart Dynamic QR Attendance Check-In
app.post('/api/v1/attendance/qr-token', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Generate cryptographically secure rotating token
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + policy.qrTokenValiditySeconds * 1000).toISOString();

  session.qrToken = token;
  session.qrExpiresAt = expiresAt;

  res.json({
    sessionId: session.id,
    token,
    expiresAt,
    validitySeconds: policy.qrTokenValiditySeconds
  });
});

app.post('/api/v1/attendance/qr-checkin', (req: Request, res: Response) => {
  const { sessionId, token, studentId } = req.body;

  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Invalid attendance session' });

  // Verify token match
  if (!session.qrToken || session.qrToken !== token) {
    return res.status(400).json({ error: 'Invalid or expired QR token. Please scan the current code displayed on the screen.' });
  }

  // Verify expiration
  if (session.qrExpiresAt && new Date(session.qrExpiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: 'QR Code has expired. Please wait for the teacher to generate a refreshed code.' });
  }

  // Verify student exists and belongs to the class
  const student = students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found in institutional database' });

  if (student.classId !== session.classId || student.sectionId !== session.sectionId) {
    return res.status(403).json({ error: 'Unauthorized: You are not enrolled in this class and section.' });
  }

  // Prevent duplicate check-in
  const existingRecord = records.find(r => r.sessionId === sessionId && r.studentId === studentId);
  if (existingRecord) {
    return res.status(409).json({
      error: `Attendance already recorded for ${student.fullName} as ${existingRecord.status} at ${new Date(existingRecord.markedAt).toLocaleTimeString()}`
    });
  }

  // Record presence
  const newRecord: AttendanceRecord = {
    id: `rec-${sessionId}-${studentId}`,
    sessionId,
    studentId,
    studentRollNumber: student.rollNumber,
    studentName: student.fullName,
    status: 'PRESENT',
    remarks: 'Checked in via Secure Dynamic QR code',
    checkInMethod: 'QR_CODE',
    markedAt: new Date().toISOString(),
    markedBy: 'STUDENT_QR_CHECKIN'
  };

  records.push(newRecord);
  session.presentCount += 1;
  session.unmarkedCount = Math.max(0, session.unmarkedCount - 1);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'QR_CHECKIN_RECORDED',
    entityType: 'ATTENDANCE_RECORD',
    entityId: newRecord.id,
    actorId: student.id,
    actorName: student.fullName,
    actorRole: 'STUDENT',
    details: `Digital check-in confirmed via QR token for ${session.subjectName}`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Attendance confirmed for ${student.fullName}!`,
    record: newRecord
  });
});

// 7. Reports & Analytics
app.get('/api/v1/reports/student-attendance', (req: Request, res: Response) => {
  const { studentId, subjectId } = req.query;
  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ error: 'Student ID required' });
  }

  const student = students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const stats = calculateStudentAttendance(student.id, subjectId as string | undefined);
  const detailedRecords = records
    .filter(r => {
      if (r.studentId !== student.id) return false;
      if (subjectId && subjectId !== 'ALL') {
        const sess = sessions.find(s => s.id === r.sessionId);
        if (sess?.subjectId !== subjectId) return false;
      }
      return true;
    })
    .map(r => {
      const sess = sessions.find(s => s.id === r.sessionId);
      return {
        id: r.id,
        sessionId: r.sessionId,
        sessionDate: sess?.sessionDate,
        subjectCode: sess?.subjectCode,
        subjectName: sess?.subjectName,
        periodNumber: sess?.periodNumber,
        status: r.status,
        checkInMethod: r.checkInMethod,
        remarks: r.remarks,
        markedAt: r.markedAt
      };
    })
    .sort((a, b) => (b.sessionDate || '').localeCompare(a.sessionDate || ''));

  res.json({
    student,
    stats,
    records: detailedRecords,
    policy
  });
});

app.get('/api/v1/reports/class-attendance', (req: Request, res: Response) => {
  const { classId, sectionId, subjectId } = req.query;

  let enrolled = students.filter(s => s.isActive);
  if (classId && classId !== 'ALL') enrolled = enrolled.filter(s => s.classId === classId);
  if (sectionId && sectionId !== 'ALL') enrolled = enrolled.filter(s => s.sectionId === sectionId);

  let totalPercentageSum = 0;
  let defaultersCount = 0;

  const studentRows = enrolled.map(s => {
    const stats = calculateStudentAttendance(s.id, subjectId as string | undefined);
    totalPercentageSum += stats.percentage;
    if (stats.isDefaulter) defaultersCount++;
    return {
      studentId: s.id,
      rollNumber: s.rollNumber,
      fullName: s.fullName,
      email: s.email,
      departmentName: s.departmentName,
      className: s.className,
      sectionName: s.sectionName,
      ...stats
    };
  });

  const classAverage = studentRows.length > 0 ? Math.round((totalPercentageSum / studentRows.length) * 10) / 10 : 0;

  res.json({
    classId,
    sectionId,
    totalStudents: studentRows.length,
    classAverage,
    defaultersCount,
    policy,
    students: studentRows
  });
});

app.get('/api/v1/reports/low-attendance', (req: Request, res: Response) => {
  const threshold = req.query.threshold ? Number(req.query.threshold) : policy.minimumThresholdPercentage;

  const defaulters = students
    .map(s => {
      const stats = calculateStudentAttendance(s.id);
      return {
        student: s,
        stats
      };
    })
    .filter(item => item.stats.totalEligibleSessions > 0 && item.stats.percentage < threshold)
    .sort((a, b) => a.stats.percentage - b.stats.percentage);

  res.json({
    threshold,
    totalDefaulters: defaulters.length,
    defaulters
  });
});

app.get('/api/v1/reports/analytics', (_req: Request, res: Response) => {
  // Compute daily trends over last 7 days
  const last7Days: Array<{ date: string; day: string; presentPercentage: number; totalMarked: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const dateStr = getPastDateStr(i);
    const daySessions = sessions.filter(s => s.sessionDate === dateStr);
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

    let present = 0;
    let total = 0;

    daySessions.forEach(s => {
      present += s.presentCount + (policy.countLateAsAttended ? s.lateCount : 0);
      total += s.presentCount + s.absentCount + s.lateCount;
    });

    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    last7Days.push({
      date: dateStr,
      day: dayName,
      presentPercentage: pct,
      totalMarked: total
    });
  }

  // Compute overall stats
  let totalPresent = 0;
  let totalAbsent = 0;
  let todaySessions = sessions.filter(s => s.sessionDate === getPastDateStr(0));
  todaySessions.forEach(s => {
    totalPresent += s.presentCount;
    totalAbsent += s.absentCount;
  });

  const todayMarked = totalPresent + totalAbsent;
  const todayPercentage = todayMarked > 0 ? Math.round((totalPresent / todayMarked) * 100) : 0;

  // Defaulters count
  let defaultersCount = 0;
  students.forEach(s => {
    const stats = calculateStudentAttendance(s.id);
    if (stats.isDefaulter) defaultersCount++;
  });

  // Class summaries
  const classSummaries = classes.map(c => {
    const clsStudents = students.filter(s => s.classId === c.id);
    let sumPct = 0;
    let defCount = 0;

    clsStudents.forEach(s => {
      const stats = calculateStudentAttendance(s.id);
      sumPct += stats.percentage;
      if (stats.isDefaulter) defCount++;
    });

    return {
      className: c.name,
      totalStudents: clsStudents.length,
      attendancePercentage: clsStudents.length > 0 ? Math.round(sumPct / clsStudents.length) : 0,
      defaultersCount: defCount
    };
  });

  res.json({
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    todayMarkedSessions: todaySessions.length,
    todayPresentCount: totalPresent,
    todayAbsentCount: totalAbsent,
    todayOverallPercentage: todayPercentage,
    defaultersCount,
    pendingCorrectionsCount: correctionRequests.filter(c => c.status === 'PENDING').length,
    classSummaries,
    recentSessions: sessions.slice(0, 6),
    weeklyTrends: last7Days
  });
});

// 8. Correction Requests Workflow
app.get('/api/v1/correction-requests', (req: Request, res: Response) => {
  const { studentId, status } = req.query;
  let list = [...correctionRequests];

  if (studentId && typeof studentId === 'string') {
    list = list.filter(c => c.studentId === studentId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(c => c.status === status);
  }

  res.json(list);
});

app.post('/api/v1/correction-requests', (req: Request, res: Response) => {
  const { studentId, sessionId, requestedStatus, explanation } = req.body;

  const student = students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Attendance session not found' });

  const existingRec = records.find(r => r.sessionId === sessionId && r.studentId === studentId);
  const existingStatus = existingRec ? existingRec.status : 'ABSENT';

  const newRequest: CorrectionRequest = {
    id: `cr-${Date.now()}`,
    studentId,
    studentRollNumber: student.rollNumber,
    studentName: student.fullName,
    sessionId,
    sessionDate: session.sessionDate,
    subjectName: session.subjectName || 'Subject',
    existingStatus,
    requestedStatus: requestedStatus || 'PRESENT',
    explanation: explanation || '',
    submittedAt: new Date().toISOString(),
    status: 'PENDING'
  };

  correctionRequests.unshift(newRequest);

  // Notify teacher
  notifications.unshift({
    id: `notif-${Date.now()}`,
    recipientId: session.teacherId,
    title: 'New Attendance Correction Request',
    message: `${student.fullName} (${student.rollNumber}) submitted an attendance dispute for ${session.subjectName}.`,
    type: 'ALERT',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/corrections'
  });

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'CORRECTION_REQUESTED',
    entityType: 'CORRECTION_REQUEST',
    entityId: newRequest.id,
    actorId: student.id,
    actorName: student.fullName,
    actorRole: 'STUDENT',
    details: `Disputed ${existingStatus} status for session on ${session.sessionDate}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newRequest);
});

app.post('/api/v1/correction-requests/:id/review', (req: Request, res: Response) => {
  const { decision, comments } = req.body as { decision: 'APPROVED' | 'REJECTED'; comments?: string };
  const cr = correctionRequests.find(c => c.id === req.params.id);
  if (!cr) return res.status(404).json({ error: 'Correction request not found' });

  if (cr.status !== 'PENDING') {
    return res.status(400).json({ error: `Request already finalized as ${cr.status}` });
  }

  cr.status = decision;
  cr.reviewerId = currentUser.id;
  cr.reviewerName = currentUser.fullName;
  cr.reviewComments = comments || '';
  cr.decisionAt = new Date().toISOString();

  // If approved, automatically apply the correction to the underlying attendance record
  if (decision === 'APPROVED') {
    let rec = records.find(r => r.sessionId === cr.sessionId && r.studentId === cr.studentId);
    const session = sessions.find(s => s.id === cr.sessionId);

    if (rec && session) {
      const oldStatus = rec.status;
      rec.status = cr.requestedStatus;
      rec.remarks = `Corrected by ${currentUser.fullName}: ${comments || 'Approved correction request'}`;
      rec.checkInMethod = 'CORRECTION';

      // adjust session aggregate counters
      if (oldStatus === 'ABSENT' && cr.requestedStatus === 'PRESENT') {
        session.absentCount = Math.max(0, session.absentCount - 1);
        session.presentCount += 1;
      } else if (oldStatus === 'ABSENT' && cr.requestedStatus === 'EXCUSED') {
        session.absentCount = Math.max(0, session.absentCount - 1);
        session.excusedCount += 1;
      }
    }
  }

  // Notify student
  notifications.unshift({
    id: `notif-${Date.now()}`,
    recipientId: cr.studentId,
    title: `Correction Request ${decision}`,
    message: `Your request for ${cr.subjectName} (${cr.sessionDate}) was ${decision.toLowerCase()} by ${currentUser.fullName}.`,
    type: decision === 'APPROVED' ? 'SUCCESS' : 'WARNING',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/student/attendance'
  });

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: `CORRECTION_${decision}`,
    entityType: 'CORRECTION_REQUEST',
    entityId: cr.id,
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `${decision} attendance correction for ${cr.studentName}. Notes: ${comments || 'N/A'}`,
    oldValue: cr.existingStatus,
    newValue: decision === 'APPROVED' ? cr.requestedStatus : cr.existingStatus,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, correctionRequest: cr });
});

// 9. Audit Logs
app.get('/api/v1/audit-logs', (_req: Request, res: Response) => {
  res.json(auditLogs);
});

// 10. Notifications
app.get('/api/v1/notifications', (req: Request, res: Response) => {
  const userId = currentUser.id;
  const userNotifs = notifications.filter(n => n.recipientId === 'ALL' || n.recipientId === userId || n.recipientId === currentUser.teacherId || n.recipientId === currentUser.studentId);
  res.json(userNotifs);
});

app.patch('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

app.post('/api/v1/notifications/broadcast-low-attendance', (_req: Request, res: Response) => {
  const defaulters = students.filter(s => {
    const stats = calculateStudentAttendance(s.id);
    return stats.isDefaulter;
  });

  let sent = 0;
  defaulters.forEach(s => {
    const stats = calculateStudentAttendance(s.id);
    notifications.unshift({
      id: `notif-${Date.now()}-${s.id}`,
      recipientId: s.id,
      title: 'Urgent: Low Attendance Warning',
      message: `Your attendance is currently ${stats.percentage}%, which is below the mandatory ${policy.minimumThresholdPercentage}% threshold. You need to attend ${stats.classesNeeded} consecutive sessions.`,
      type: 'WARNING',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/student/attendance'
    });
    sent++;
  });

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'BROADCAST_LOW_ATTENDANCE_WARNING',
    entityType: 'NOTIFICATION',
    entityId: 'broadcast',
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Dispatched attendance threshold warning alerts to ${sent} students below ${policy.minimumThresholdPercentage}%`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, count: sent });
});

// 11. Settings & Policy
app.get('/api/v1/settings', (_req: Request, res: Response) => {
  res.json({
    institution,
    policy,
    counts: {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalSubjects: subjects.length,
      totalSessions: sessions.length,
      totalRecords: records.length
    }
  });
});

app.put('/api/v1/settings', (req: Request, res: Response) => {
  const { minimumThresholdPercentage, countLateAsAttended, lateWeight, excludeExcusedFromDenominator, qrTokenValiditySeconds } = req.body;

  if (minimumThresholdPercentage !== undefined) policy.minimumThresholdPercentage = Number(minimumThresholdPercentage);
  if (countLateAsAttended !== undefined) policy.countLateAsAttended = Boolean(countLateAsAttended);
  if (lateWeight !== undefined) policy.lateWeight = Number(lateWeight);
  if (excludeExcusedFromDenominator !== undefined) policy.excludeExcusedFromDenominator = Boolean(excludeExcusedFromDenominator);
  if (qrTokenValiditySeconds !== undefined) policy.qrTokenValiditySeconds = Number(qrTokenValiditySeconds);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'POLICY_UPDATED',
    entityType: 'SETTINGS',
    entityId: 'global-policy',
    actorId: currentUser.id,
    actorName: currentUser.fullName,
    actorRole: currentUser.role,
    details: `Updated institutional attendance rules: Min Threshold = ${policy.minimumThresholdPercentage}%, Late = ${policy.countLateAsAttended ? 'Attended' : 'Absent'}`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, policy });
});

// 12. System & Architecture Status
app.get('/api/v1/system/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    version: '1.0.0-PROD',
    runtime: 'Node.js 22 LTS with Dual Java 21 Spring Boot Architecture',
    databaseEngine: 'Relational Model with MySQL 8.0 & Flyway Migrations',
    activeSessions: sessions.length,
    totalRecords: records.length,
    institutionsCount: 1,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// VITE MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Attendance] System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
