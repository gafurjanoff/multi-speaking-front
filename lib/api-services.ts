import { fetchWithAuth, getApiUrl } from "./api-client"
import type { ExamCard } from "./api-types"
import type { Exam } from "./exam-types"

// ── Exam listing ──

interface BackendExamCard {
  id: string
  title: string
  level: string
  description: string
  is_free: boolean
  is_mock: boolean
  is_published: boolean
  total_parts: number
  questions_count: number
}

function mapExamCard(b: BackendExamCard): ExamCard {
  return {
    id: b.id,
    title: b.title,
    level: b.level,
    description: b.description,
    totalParts: b.total_parts,
    isFree: b.is_free,
    isMock: b.is_mock,
    isPublished: b.is_published,
    questionsCount: b.questions_count,
  }
}

export async function fetchExams(level?: string): Promise<ExamCard[]> {
  const url = level ? `/api/exams?level=${level}` : "/api/exams"
  const res = await fetch(getApiUrl(url))
  if (!res.ok) return []
  const data: BackendExamCard[] = await res.json()
  return data.map(mapExamCard)
}

// ── Exam detail (for taking the exam) ──

export interface BackendExamDetail {
  id: string
  title: string
  level: string
  is_free?: boolean
  is_mock?: boolean
  parts?: {
    id: string
    type: string
    title: string
    part_number: number
    instruction: string
    instruction_audio: string | null
    images: string[] | null
    prep_time: number
    answer_time: number
    questions: {
      id: string
      text: string
      sub_questions?: string[]
      images?: string[]
      for_against?: { side: string; point_text: string }[]
    }[]
  }[]
}

export function mapExamDetail(b: BackendExamDetail): Exam {
  return {
    id: b.id,
    title: b.title,
    level: b.level,
    isFree: b.is_free,
    isMock: b.is_mock,
    parts: (b.parts ?? []).map((p) => ({
      id: p.id,
      type: p.type as Exam["parts"][number]["type"],
      title: p.title,
      partNumber: p.part_number,
      instruction: p.instruction,
      instructionAudio: p.instruction_audio,
      images: p.images,
      prepTime: p.prep_time,
      answerTime: p.answer_time,
      questions: (p.questions ?? []).map((q) => ({
        id: q.id,
        text: q.text,
        subQuestions: q.sub_questions,
        images: q.images,
        forAgainst: q.for_against?.map((fa) => ({
          side: fa.side as "for" | "against",
          pointText: fa.point_text,
        })),
      })),
    })),
  }
}

export async function fetchExamDetail(examId: string): Promise<Exam | null> {
  const res = await fetchWithAuth(`/api/exams/${examId}`)
  if (!res.ok) return null
  const data: BackendExamDetail = await res.json()
  return mapExamDetail(data)
}

// ── Sessions ──

interface SessionResponse {
  id: string
  exam_id: string
  user_id: string
  status: string
  started_at: string
}

export async function startSession(examId: string): Promise<SessionResponse | null> {
  const res = await fetchWithAuth("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ exam_id: examId }),
  })
  if (!res.ok) return null
  return res.json()
}

export async function submitSession(
  sessionId: string,
  totalDuration: number
): Promise<boolean> {
  const res = await fetchWithAuth(`/api/sessions/${sessionId}/submit`, {
    method: "POST",
    body: JSON.stringify({ total_duration: totalDuration }),
  })
  return res.ok
}

export async function uploadRecording(
  sessionId: string,
  partId: string,
  questionId: string,
  partOrder: number,
  questionOrder: number,
  blob: Blob,
  duration: number
): Promise<boolean> {
  const form = new FormData()
  form.append("part_id", partId)
  form.append("question_id", questionId)
  form.append("part_order", String(partOrder))
  form.append("question_order", String(questionOrder))
  form.append("duration", String(duration))
  form.append("file", blob, `${partId}_${questionId}.webm`)

  const res = await fetchWithAuth(`/api/sessions/${sessionId}/recordings`, {
    method: "POST",
    body: form,
  })
  return res.ok
}

// ── Results (student) ──

export interface UserResult {
  id: string
  exam_id: string
  exam_title: string
  status: string
  overall_score: number | null
  feedback: string | null
  completed_at: string | null
}

export async function fetchMyResults(): Promise<UserResult[]> {
  const res = await fetchWithAuth("/api/sessions/my/results")
  if (!res.ok) return []
  return res.json()
}

// ── Result detail (candidate sees own recordings + questions) ──

export interface CandidateResultDetail {
  id: string
  session_id: string
  exam_id: string
  user_id: string
  status: string
  overall_score: number | null
  feedback: string | null
  teacher_notes: string | null
  graded_at: string | null
  created_at: string
  exam_title: string
  student_name: string
  student_phone: string
  recordings: {
    id: string
    part_id: string
    question_id: string
    part_label: string
    question_text: string
    file_path: string | null
    duration: number
    score: number | null
    feedback: string | null
  }[]
  parts?: {
    part_id: string
    part_title: string
    part_order: number
    part_type?: string
    part_images?: string[] | null
    questions: {
      question_id: string
      question_text: string
      question_order: number
      recording_id: string | null
      file_path: string | null
      duration: number
      score: number | null
      feedback: string | null
      images?: string[] | null
      sub_questions?: string[] | null
      for_against?: { side: string; point_text: string }[]
    }[]
  }[]
}

export async function fetchResultDetail(resultId: string): Promise<CandidateResultDetail | null> {
  const res = await fetchWithAuth(`/api/sessions/results/${resultId}`)
  if (!res.ok) return null
  return res.json()
}

// ── Admin: Stats ──
// ── Profile (current user, for certificate) ──

export interface ProfileData {
  first_name?: string | null
  last_name?: string | null
}

export async function updateProfile(data: ProfileData): Promise<boolean> {
  const res = await fetchWithAuth("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify({
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
    }),
  })
  return res.ok
}

export async function fetchProfile(): Promise<AdminUser | null> {
  const res = await fetchWithAuth("/api/auth/me")
  if (!res.ok) return null
  return res.json()
}


export interface AdminStats {
  total_users: number
  total_exams: number
  published_exams: number
  total_sessions: number
  pending_reviews: number
  graded_results: number
}

export async function adminFetchStats(): Promise<AdminStats | null> {
  const res = await fetchWithAuth("/api/admin/stats")
  if (!res.ok) return null
  return res.json()
}

// ── Admin: Users ──

export interface AdminUser {
  id: string
  phone_number: string
  first_name: string | null
  last_name: string | null
  telegram_id: number
  is_verified: boolean
  is_admin: boolean
  last_login: string | null
  created_at: string
}

export async function adminFetchUsers(): Promise<AdminUser[]> {
  const res = await fetchWithAuth("/api/admin/users")
  if (!res.ok) return []
  return res.json()
}

export async function adminToggleAdmin(
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_admin: isAdmin }),
  })
  return res.ok
}

// ── Admin: Image upload ──

export async function adminUploadImage(file: File): Promise<string | null> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetchWithAuth("/api/admin/upload-image", {
    method: "POST",
    body: form,
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.url
}

// ── Admin: Exams ──

export async function adminFetchExamDetail(examId: string): Promise<BackendExamDetail | null> {
  const res = await fetchWithAuth(`/api/admin/exams/${examId}`)
  if (!res.ok) return null
  return await res.json()
}

export async function adminFetchExams(): Promise<ExamCard[]> {
  const res = await fetchWithAuth("/api/admin/exams")
  if (!res.ok) return []
  const data: BackendExamCard[] = await res.json()
  return data.map(mapExamCard)
}

export async function adminCreateExam(body: object): Promise<boolean> {
  const res = await fetchWithAuth("/api/admin/exams", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return res.ok
}

export async function adminUpdateExam(
  examId: string,
  body: object
): Promise<boolean> {
  const res = await fetchWithAuth(`/api/admin/exams/${examId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  return res.ok
}

export async function adminDeleteExam(examId: string): Promise<boolean> {
  const res = await fetchWithAuth(`/api/admin/exams/${examId}`, {
    method: "DELETE",
  })
  return res.ok
}

// ── Admin: Results ──

export interface AdminResult {
  id: string
  session_id: string
  exam_id: string
  exam_title?: string
  user_id: string
  status: string
  overall_score: number | null
  feedback: string | null
  teacher_notes: string | null
  graded_at: string | null
  created_at: string
}

export interface AdminResultDetail extends AdminResult {
  exam_title: string
  student_name: string
  student_phone: string
  recordings: {
    id: string
    part_id: string
    question_id: string
    part_label: string
    question_text: string
    file_path: string | null
    duration: number
    score: number | null
    feedback: string | null
  }[]
  parts?: {
    part_id: string
    part_title: string
    part_order: number
    part_type?: string
    part_images?: string[] | null
    questions: {
      question_id: string
      question_text: string
      question_order: number
      recording_id: string | null
      file_path: string | null
      duration: number
      score: number | null
      feedback: string | null
      images?: string[] | null
      sub_questions?: string[] | null
      for_against?: { side: string; point_text: string }[]
    }[]
  }[]
}

export async function adminFetchResults(
  status?: string
): Promise<AdminResult[]> {
  const url = status ? `/api/admin/results?status=${status}` : "/api/admin/results"
  const res = await fetchWithAuth(url)
  if (!res.ok) return []
  return res.json()
}

export async function adminFetchResultDetail(
  resultId: string
): Promise<AdminResultDetail | null> {
  const res = await fetchWithAuth(`/api/admin/results/${resultId}`)
  if (!res.ok) return null
  return res.json()
}

export async function adminGradeResult(
  resultId: string,
  body: {
    overall_score: number
    feedback?: string
    teacher_notes?: string
    recording_scores?: { recording_id: string; score?: number; feedback?: string }[]
  }
): Promise<boolean> {
  const res = await fetchWithAuth(`/api/admin/results/${resultId}/grade`, {
    method: "POST",
    body: JSON.stringify(body),
  })
  return res.ok
}

export interface AiAssessResponse {
  error?: string
  recording_scores: { recording_id: string; score: number | null; feedback: string }[]
  criteria_total?: number
  conversion_score?: number
}

export async function adminAiAssess(resultId: string): Promise<AiAssessResponse | null> {
  const res = await fetchWithAuth(`/api/admin/results/${resultId}/ai-assess`, {
    method: "POST",
  })
  if (!res.ok) return null
  return res.json()
}

// ── Exam Access (paid exam approval) ──

export interface ExamAccessRecord {
  id: string
  user_id: string
  exam_id: string
  status: string
  user_name: string
  user_phone: string
  exam_title: string
  created_at: string
}

export async function adminFetchAccess(examId?: string): Promise<ExamAccessRecord[]> {
  const url = examId ? `/api/admin/access?exam_id=${examId}` : "/api/admin/access"
  const res = await fetchWithAuth(url)
  if (!res.ok) return []
  return res.json()
}

export async function adminGrantAccess(userId: string, examId: string): Promise<boolean> {
  const res = await fetchWithAuth("/api/admin/access", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, exam_id: examId }),
  })
  return res.ok
}

export async function adminRevokeAccess(accessId: string): Promise<boolean> {
  const res = await fetchWithAuth(`/api/admin/access/${accessId}`, {
    method: "DELETE",
  })
  return res.ok
}
