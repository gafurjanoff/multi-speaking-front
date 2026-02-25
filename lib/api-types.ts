// ========================================
// API Types - Clear structure for backend
// ========================================

// --- Auth ---
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: "student" | "teacher"
}

// --- Users ---
export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface StudentProfile extends User {
  role: "student"
  level: string
  totalExamsTaken: number
  averageScore: number
  streak: number
  badges: Badge[]
}

export interface TeacherProfile extends User {
  role: "teacher"
  totalStudents: number
  totalExamsCreated: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

// --- Exams ---
export interface ExamCard {
  id: string
  title: string
  level: string
  description: string
  duration: string
  totalParts: number
  isFree: boolean
  isMock: boolean
  difficulty: "beginner" | "intermediate" | "advanced"
  questionsCount: number
  completedBy: number
  averageScore: number
}

// --- Exam Results ---
export interface ExamResult {
  id: string
  examId: string
  examTitle: string
  studentId: string
  studentName: string
  studentEmail: string
  level: string
  completedAt: string
  recordings: RecordingResult[]
  totalDuration: number
  status: "pending_review" | "reviewed" | "graded"
  score?: number
  feedback?: string
  teacherNotes?: string
}

export interface RecordingResult {
  partId: string
  partTitle: string
  questionId: string
  questionText: string
  audioUrl: string
  duration: number
  score?: number
  feedback?: string
}

// --- Student Progress ---
export interface StudentProgress {
  totalExams: number
  completedExams: number
  averageScore: number
  examHistory: ExamHistoryItem[]
  progressByLevel: LevelProgress[]
  recentActivity: ActivityItem[]
}

export interface ExamHistoryItem {
  id: string
  examTitle: string
  level: string
  completedAt: string
  score: number
  duration: number
  status: "pending_review" | "reviewed" | "graded"
}

export interface LevelProgress {
  level: string
  completed: number
  total: number
  averageScore: number
}

export interface ActivityItem {
  id: string
  type: "exam_completed" | "badge_earned" | "score_received"
  title: string
  description: string
  timestamp: string
}

// --- API Route Map ---
// This is the blueprint for your backend API
//
// POST   /api/auth/login          -> LoginResponse
// POST   /api/auth/register       -> LoginResponse
// POST   /api/auth/logout         -> { success: boolean }
// GET    /api/auth/me             -> User
//
// GET    /api/exams               -> ExamCard[]
// GET    /api/exams/:id           -> Exam (full exam with questions)
// GET    /api/exams/free          -> ExamCard[] (free mock exams)
//
// POST   /api/exam-sessions       -> { sessionId: string }
// PUT    /api/exam-sessions/:id   -> ExamResult
// POST   /api/exam-sessions/:id/recordings  -> { uploadUrl: string }
//
// GET    /api/students/me/profile      -> StudentProfile
// GET    /api/students/me/progress     -> StudentProgress
// GET    /api/students/me/results      -> ExamResult[]
//
// GET    /api/teacher/students         -> StudentProfile[]
// GET    /api/teacher/results          -> ExamResult[]
// GET    /api/teacher/results/:id      -> ExamResult
// PUT    /api/teacher/results/:id      -> ExamResult (grade/feedback)
// GET    /api/teacher/results/:id/pdf  -> PDF binary
