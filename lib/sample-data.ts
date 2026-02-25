import type {
  User,
  StudentProfile,
  TeacherProfile,
  ExamCard,
  ExamResult,
  StudentProgress,
  Badge,
} from "./api-types"

// ========================================
// Sample Users
// ========================================
export const sampleStudents: StudentProfile[] = [
  {
    id: "student-001",
    name: "Ali Karimov",
    email: "ali@example.com",
    role: "student",
    level: "B2",
    totalExamsTaken: 12,
    averageScore: 78,
    streak: 5,
    avatar: "",
    createdAt: "2025-09-01T10:00:00Z",
    badges: [
      { id: "b1", name: "First Exam", description: "Completed your first exam", icon: "trophy", earnedAt: "2025-09-05T12:00:00Z" },
      { id: "b2", name: "5-Day Streak", description: "Practiced 5 days in a row", icon: "flame", earnedAt: "2025-10-01T12:00:00Z" },
    ],
  },
  {
    id: "student-002",
    name: "Madina Rahimova",
    email: "madina@example.com",
    role: "student",
    level: "B1",
    totalExamsTaken: 8,
    averageScore: 72,
    streak: 3,
    avatar: "",
    createdAt: "2025-09-15T10:00:00Z",
    badges: [
      { id: "b1", name: "First Exam", description: "Completed your first exam", icon: "trophy", earnedAt: "2025-09-20T12:00:00Z" },
    ],
  },
  {
    id: "student-003",
    name: "Jasur Toshmatov",
    email: "jasur@example.com",
    role: "student",
    level: "C1",
    totalExamsTaken: 24,
    averageScore: 88,
    streak: 12,
    avatar: "",
    createdAt: "2025-08-01T10:00:00Z",
    badges: [
      { id: "b1", name: "First Exam", description: "Completed your first exam", icon: "trophy", earnedAt: "2025-08-05T12:00:00Z" },
      { id: "b2", name: "5-Day Streak", description: "Practiced 5 days in a row", icon: "flame", earnedAt: "2025-08-15T12:00:00Z" },
      { id: "b3", name: "Top Scorer", description: "Scored above 90%", icon: "star", earnedAt: "2025-09-10T12:00:00Z" },
    ],
  },
  {
    id: "student-004",
    name: "Nilufar Yusupova",
    email: "nilufar@example.com",
    role: "student",
    level: "B2",
    totalExamsTaken: 6,
    averageScore: 65,
    streak: 1,
    avatar: "",
    createdAt: "2025-10-01T10:00:00Z",
    badges: [
      { id: "b1", name: "First Exam", description: "Completed your first exam", icon: "trophy", earnedAt: "2025-10-05T12:00:00Z" },
    ],
  },
]

export const sampleTeacher: TeacherProfile = {
  id: "teacher-001",
  name: "Aziza Nazarova",
  email: "teacher@example.com",
  role: "teacher",
  totalStudents: 45,
  totalExamsCreated: 18,
  avatar: "",
  createdAt: "2025-01-01T10:00:00Z",
}

// ========================================
// Sample Exam Cards
// ========================================
export const sampleExamCards: ExamCard[] = [
  {
    id: "exam-b1-001",
    title: "B1 Speaking Practice",
    level: "B1",
    description: "Foundational speaking exam covering everyday topics and simple descriptions.",
    duration: "~12 min",
    totalParts: 3,
    isFree: true,
    isMock: true,
    difficulty: "beginner",
    questionsCount: 8,
    completedBy: 342,
    averageScore: 74,
  },
  {
    id: "exam-b2-001",
    title: "B2 Speaking Exam",
    level: "B2",
    description: "Intermediate speaking exam with photo descriptions, detailed responses, and arguments.",
    duration: "~15 min",
    totalParts: 3,
    isFree: false,
    isMock: false,
    difficulty: "intermediate",
    questionsCount: 10,
    completedBy: 218,
    averageScore: 71,
  },
  {
    id: "exam-b2-002",
    title: "B2 Mock Exam #1",
    level: "B2",
    description: "Free practice exam following the exact format of the B2 speaking test.",
    duration: "~15 min",
    totalParts: 3,
    isFree: true,
    isMock: true,
    difficulty: "intermediate",
    questionsCount: 10,
    completedBy: 156,
    averageScore: 68,
  },
  {
    id: "exam-b2-003",
    title: "B2 Mock Exam #2",
    level: "B2",
    description: "Another mock exam with new questions. Covers travel, education, and technology.",
    duration: "~15 min",
    totalParts: 3,
    isFree: true,
    isMock: true,
    difficulty: "intermediate",
    questionsCount: 10,
    completedBy: 89,
    averageScore: 70,
  },
  {
    id: "exam-c1-001",
    title: "C1 Advanced Speaking",
    level: "C1",
    description: "Advanced exam requiring nuanced argumentation, detailed analysis, and fluent delivery.",
    duration: "~20 min",
    totalParts: 3,
    isFree: false,
    isMock: false,
    difficulty: "advanced",
    questionsCount: 12,
    completedBy: 94,
    averageScore: 67,
  },
  {
    id: "exam-c1-002",
    title: "C1 Mock Exam",
    level: "C1",
    description: "Free advanced mock exam. Perfect for testing your readiness for C1 certification.",
    duration: "~20 min",
    totalParts: 3,
    isFree: true,
    isMock: true,
    difficulty: "advanced",
    questionsCount: 12,
    completedBy: 52,
    averageScore: 64,
  },
]

// ========================================
// Sample Exam Results (for teacher view)
// ========================================
export const sampleExamResults: ExamResult[] = [
  {
    id: "result-001",
    examId: "exam-b2-001",
    examTitle: "B2 Speaking Exam",
    studentId: "student-001",
    studentName: "Ali Karimov",
    studentEmail: "ali@example.com",
    level: "B2",
    completedAt: "2026-02-08T14:30:00Z",
    totalDuration: 780,
    status: "pending_review",
    recordings: [
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q1", questionText: "Describe your bedroom.", audioUrl: "#", duration: 28, },
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q2", questionText: "What do you usually do on weekends?", audioUrl: "#", duration: 30, },
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q3", questionText: "Tell me about your favourite hobby.", audioUrl: "#", duration: 27, },
      { partId: "part2", partTitle: "Part 2 - Picture Description", questionId: "p2q1", questionText: "Describe a goal you have set for yourself.", audioUrl: "#", duration: 115, },
      { partId: "part3", partTitle: "Part 3 - For and Against", questionId: "p3q1", questionText: "Everyone should have a hobby.", audioUrl: "#", duration: 110, },
    ],
  },
  {
    id: "result-002",
    examId: "exam-b1-001",
    examTitle: "B1 Speaking Practice",
    studentId: "student-002",
    studentName: "Madina Rahimova",
    studentEmail: "madina@example.com",
    level: "B1",
    completedAt: "2026-02-07T10:15:00Z",
    totalDuration: 620,
    status: "graded",
    score: 72,
    feedback: "Good effort. Vocabulary is developing well. Work on pronunciation of 'th' sounds and try to extend answers with examples.",
    recordings: [
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q1", questionText: "Describe your bedroom.", audioUrl: "#", duration: 25, score: 70, feedback: "Good basic description." },
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q2", questionText: "What do you usually do on weekends?", audioUrl: "#", duration: 28, score: 75, feedback: "Nice range of activities mentioned." },
      { partId: "part2", partTitle: "Part 2 - Picture Description", questionId: "p2q1", questionText: "Describe a goal you have set for yourself.", audioUrl: "#", duration: 108, score: 68, feedback: "Try to be more specific with details." },
      { partId: "part3", partTitle: "Part 3 - For and Against", questionId: "p3q1", questionText: "Everyone should have a hobby.", audioUrl: "#", duration: 100, score: 74, feedback: "Good balance of arguments." },
    ],
  },
  {
    id: "result-003",
    examId: "exam-c1-001",
    examTitle: "C1 Advanced Speaking",
    studentId: "student-003",
    studentName: "Jasur Toshmatov",
    studentEmail: "jasur@example.com",
    level: "C1",
    completedAt: "2026-02-06T16:45:00Z",
    totalDuration: 920,
    status: "reviewed",
    score: 88,
    feedback: "Excellent fluency and coherence. Very strong argumentation skills. Minor grammatical errors under time pressure.",
    recordings: [
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q1", questionText: "Tell me about a book that changed your perspective.", audioUrl: "#", duration: 30, score: 90 },
      { partId: "part2", partTitle: "Part 2 - Picture Description", questionId: "p2q1", questionText: "Describe the relationship between technology and education.", audioUrl: "#", duration: 118, score: 87 },
      { partId: "part3", partTitle: "Part 3 - For and Against", questionId: "p3q1", questionText: "Social media does more harm than good.", audioUrl: "#", duration: 115, score: 88 },
    ],
  },
  {
    id: "result-004",
    examId: "exam-b2-002",
    examTitle: "B2 Mock Exam #1",
    studentId: "student-004",
    studentName: "Nilufar Yusupova",
    studentEmail: "nilufar@example.com",
    level: "B2",
    completedAt: "2026-02-05T09:00:00Z",
    totalDuration: 700,
    status: "pending_review",
    recordings: [
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q1", questionText: "What kind of music do you enjoy?", audioUrl: "#", duration: 26 },
      { partId: "part2", partTitle: "Part 2 - Picture Description", questionId: "p2q1", questionText: "Describe what you see in the picture.", audioUrl: "#", duration: 105 },
      { partId: "part3", partTitle: "Part 3 - For and Against", questionId: "p3q1", questionText: "Everyone should learn a foreign language.", audioUrl: "#", duration: 98 },
    ],
  },
  {
    id: "result-005",
    examId: "exam-b2-001",
    examTitle: "B2 Speaking Exam",
    studentId: "student-001",
    studentName: "Ali Karimov",
    studentEmail: "ali@example.com",
    level: "B2",
    completedAt: "2026-01-28T14:30:00Z",
    totalDuration: 750,
    status: "graded",
    score: 80,
    feedback: "Strong improvement from last attempt. Clear pronunciation and good use of linking words.",
    recordings: [
      { partId: "part1", partTitle: "Part 1 - Short Questions", questionId: "p1q1", questionText: "Describe your bedroom.", audioUrl: "#", duration: 29, score: 78 },
      { partId: "part2", partTitle: "Part 2 - Picture Description", questionId: "p2q1", questionText: "Describe a goal you have set for yourself.", audioUrl: "#", duration: 112, score: 82 },
      { partId: "part3", partTitle: "Part 3 - For and Against", questionId: "p3q1", questionText: "Everyone should have a hobby.", audioUrl: "#", duration: 108, score: 80 },
    ],
  },
]

// ========================================
// Sample Student Progress
// ========================================
export const sampleStudentProgress: StudentProgress = {
  totalExams: 15,
  completedExams: 12,
  averageScore: 78,
  examHistory: [
    { id: "result-001", examTitle: "B2 Speaking Exam", level: "B2", completedAt: "2026-02-08T14:30:00Z", score: 0, duration: 780, status: "pending_review" },
    { id: "result-005", examTitle: "B2 Speaking Exam", level: "B2", completedAt: "2026-01-28T14:30:00Z", score: 80, duration: 750, status: "graded" },
    { id: "h3", examTitle: "B2 Mock Exam #1", level: "B2", completedAt: "2026-01-20T10:00:00Z", score: 76, duration: 720, status: "graded" },
    { id: "h4", examTitle: "B1 Speaking Practice", level: "B1", completedAt: "2026-01-10T09:00:00Z", score: 85, duration: 600, status: "graded" },
    { id: "h5", examTitle: "B2 Mock Exam #2", level: "B2", completedAt: "2025-12-20T14:00:00Z", score: 72, duration: 740, status: "graded" },
    { id: "h6", examTitle: "B1 Speaking Practice", level: "B1", completedAt: "2025-12-05T11:00:00Z", score: 82, duration: 610, status: "graded" },
  ],
  progressByLevel: [
    { level: "B1", completed: 4, total: 5, averageScore: 82 },
    { level: "B2", completed: 7, total: 10, averageScore: 76 },
    { level: "C1", completed: 1, total: 5, averageScore: 68 },
  ],
  recentActivity: [
    { id: "a1", type: "exam_completed", title: "Exam Completed", description: "You completed the B2 Speaking Exam", timestamp: "2026-02-08T14:30:00Z" },
    { id: "a2", type: "score_received", title: "Score Received", description: "You scored 80% on B2 Speaking Exam", timestamp: "2026-01-30T09:00:00Z" },
    { id: "a3", type: "badge_earned", title: "Badge Earned", description: "You earned the 5-Day Streak badge", timestamp: "2026-01-25T12:00:00Z" },
    { id: "a4", type: "exam_completed", title: "Exam Completed", description: "You completed the B2 Mock Exam #1", timestamp: "2026-01-20T10:00:00Z" },
  ],
}

// ========================================
// Auth helper (simulated)
// ========================================
export const sampleUsers: (User & { password: string })[] = [
  { ...sampleStudents[0], password: "student123" },
  { ...sampleStudents[1], password: "student123" },
  { ...sampleStudents[2], password: "student123" },
  { ...sampleStudents[3], password: "student123" },
  { ...sampleTeacher, password: "teacher123" },
]

export function findUserByEmail(email: string) {
  return sampleUsers.find((u) => u.email === email) || null
}
