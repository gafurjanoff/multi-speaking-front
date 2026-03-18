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
  free_attempt_limit: number
  mock_attempt_limit: number
  access_validity_days: number
  shuffle_questions_for_mock: boolean
  auto_ai_assessment: boolean
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
    freeAttemptLimit: b.free_attempt_limit,
    mockAttemptLimit: b.mock_attempt_limit,
    accessValidityDays: b.access_validity_days,
    shuffleQuestionsForMock: b.shuffle_questions_for_mock,
    autoAiAssessment: b.auto_ai_assessment,
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

// ── Public landing stats ──

export interface PublicLandingStats {
  total_users: number
  published_exams: number
}

export async function fetchPublicLandingStats(): Promise<PublicLandingStats | null> {
  const res = await fetch(getApiUrl("/api/exams/stats"))
  if (!res.ok) return null
  return res.json()
}

// ── Exam detail (for taking the exam) ──

export interface BackendExamDetail {
  id: string
  title: string
  level: string
  is_free?: boolean
  is_mock?: boolean
  free_attempt_limit?: number
  mock_attempt_limit?: number
  access_validity_days?: number
  shuffle_questions_for_mock?: boolean
  auto_ai_assessment?: boolean
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
    mock_questions_to_ask?: number
    questions: {
      id: string
      text: string
      sub_questions?: string[]
      images?: string[]
      assessment_group_type?: string | null
      assessment_group_key?: string | null
      for_against?: { side: string; point_text: string }[]
    }[]
  }[]
}

type BackendPart = NonNullable<BackendExamDetail["parts"]>[number]
type BackendQuestion = NonNullable<BackendPart["questions"]>[number]

export function mapExamDetail(b: BackendExamDetail): Exam {
  const isFree = !!b.is_free

  const mappedParts: Exam["parts"] = []

  for (const p of (b.parts ?? []) as BackendPart[]) {
    // Special handling: FREE exams Part 1.2 photo questions
    if (isFree && p.type === "part1_photos") {
      const originalQuestions: BackendQuestion[] = (p.questions ?? []) as BackendQuestion[]

      // Part A: photo + main text, 10/45 (use backend times)
      const photoQuestions: BackendQuestion[] = originalQuestions.map((q) => ({
        ...q,
        // hide inline sub-questions here; they will become separate follow-up questions
        sub_questions: [],
      }))

      mappedParts.push({
        id: p.id,
        type: p.type as Exam["parts"][number]["type"],
        title: p.title,
        partNumber: p.part_number,
        instruction: p.instruction,
        instructionAudio: p.instruction_audio,
        images: p.images,
        prepTime: p.prep_time,
        answerTime: p.answer_time,
        mockQuestionsToAsk: p.mock_questions_to_ask ?? 0,
        questions: photoQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          subQuestions: q.sub_questions,
          images: q.images,
          assessmentGroupType: q.assessment_group_type ?? null,
          assessmentGroupKey: q.assessment_group_key ?? null,
          forAgainst: q.for_against?.map((fa) => ({
            side: fa.side as "for" | "against",
            pointText: fa.point_text,
          })),
        })),
      })

      // Part B: follow-up sub-questions, text-only, 5/30, grouped as part1
      const followUpQuestions: {
        id: string
        text: string
        assessment_group_type?: string | null
        assessment_group_key?: string | null
      }[] = []

      for (const q of originalQuestions) {
        if (q.sub_questions && q.sub_questions.length > 0) {
          q.sub_questions.forEach((subText, idx) => {
            followUpQuestions.push({
              id: `${q.id}__sub${idx}`,
              text: subText,
              assessment_group_type: q.assessment_group_type,
              assessment_group_key: q.assessment_group_key,
            })
          })
        }
      }

      if (followUpQuestions.length > 0) {
        mappedParts.push({
          id: `${p.id}__followups`,
          type: "part1",
          title: "Part 1.2 – Photo Questions Follow-up",
          // keep sequence by using the same part number; UI groups by type anyway
          partNumber: p.part_number,
          instruction: "",
          instructionAudio: null,
          images: null,
          prepTime: 5,
          answerTime: 30,
          mockQuestionsToAsk: 0,
          questions: followUpQuestions.map((fq) => ({
            id: fq.id,
            text: fq.text,
            subQuestions: [],
            // no images for follow-ups in free Part 1.2, keep undefined to match ExamQuestion type
            images: undefined,
            assessmentGroupType: fq.assessment_group_type ?? null,
            assessmentGroupKey: fq.assessment_group_key ?? null,
            // no for/against points here
            forAgainst: undefined,
          })),
        })
      }

      continue
    }

    // Default mapping for all other parts (paid exams and non-photo parts)
    const sourceQuestions: BackendQuestion[] = (p.questions ?? []) as BackendQuestion[]

    mappedParts.push({
      id: p.id,
      type: p.type as Exam["parts"][number]["type"],
      title: p.title,
      partNumber: p.part_number,
      instruction: p.instruction,
      instructionAudio: p.instruction_audio,
      images: p.images,
      prepTime: p.prep_time,
      answerTime: p.answer_time,
      mockQuestionsToAsk: p.mock_questions_to_ask ?? 0,
      questions: sourceQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        subQuestions: q.sub_questions,
        images: q.images,
        assessmentGroupType: q.assessment_group_type ?? null,
        assessmentGroupKey: q.assessment_group_key ?? null,
        forAgainst: q.for_against?.map((fa) => ({
          side: fa.side as "for" | "against",
          pointText: fa.point_text,
        })),
      })),
    })
  }

  return {
    id: b.id,
    title: b.title,
    level: b.level,
    isFree: b.is_free,
    isMock: b.is_mock,
    freeAttemptLimit: b.free_attempt_limit,
    mockAttemptLimit: b.mock_attempt_limit,
    accessValidityDays: b.access_validity_days,
    shuffleQuestionsForMock: b.shuffle_questions_for_mock,
    autoAiAssessment: b.auto_ai_assessment,
    parts: mappedParts,
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
  if (!res.ok) {
    let detail = ""
    try {
      const data = await res.json()
      detail = typeof data?.detail === "string" ? data.detail : JSON.stringify(data?.detail ?? data)
    } catch {
      detail = await res.text()
    }
    throw new Error(`START_SESSION_FAILED:${res.status}:${detail}`)
  }
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
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Submit failed: ${res.status} ${text}`)
  }
  return true
}

export async function uploadRecording(
  sessionId: string,
  partId: string,
  questionId: string,
  partType: string,
  assessmentGroupType: string,
  assessmentGroupKey: string,
  questionText: string,
  partOrder: number,
  questionOrder: number,
  blob: Blob,
  duration: number,
  maxRetries = 3
): Promise<boolean> {
  // Use the blob's actual MIME type to derive the correct file extension.
  // MediaRecorder sets blob.type to whatever the browser encoded:
  //   Chrome  → "audio/webm" or "audio/webm;codecs=opus"
  //   Safari  → "audio/mp4"
  //   Firefox → "audio/ogg"
  const mimeToExt: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg":  "ogg",
    "audio/mp4":  "mp4",
    "audio/mpeg": "mp3",
    "audio/wav":  "wav",
    "video/webm": "webm", // some browsers report video/webm for audio-only tracks
  }
  const mime = blob.type.split(";")[0].trim() // strip ";codecs=opus" etc.
  const ext  = mimeToExt[mime] ?? "webm"

  console.log(`[Upload] Preparing: part=${partId} q=${questionId} size=${blob.size} type=${blob.type} ext=${ext} duration=${duration}s`)

  if (blob.size < 100) {
    console.error(`[Upload] Recording too small (${blob.size} bytes) – skipping`)
    return false
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const form = new FormData()
      form.append("part_id", partId)
      form.append("question_id", questionId)
      form.append("part_type", partType)
      form.append("assessment_group_type", assessmentGroupType)
      if (assessmentGroupKey) form.append("assessment_group_key", assessmentGroupKey)
      form.append("question_text", questionText)
      form.append("part_order", String(partOrder))
      form.append("question_order", String(questionOrder))
      form.append("duration", String(duration))
      form.append("file", blob, `${partId}_${questionId}.${ext}`)

      console.log(`[Upload] Attempt ${attempt}/${maxRetries}`)
      const res = await fetchWithAuth(`/api/sessions/${sessionId}/recordings`, {
        method: "POST",
        body: form,
      })
      if (res.ok) {
        console.log(`[Upload] Success on attempt ${attempt}`)
        return true
      }
      console.error(`[Upload] Attempt ${attempt} HTTP ${res.status}`)
      // Server error → retry
      if (res.status >= 500 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 2000))
        continue
      }
      return false
    } catch (err) {
      console.error(`[Upload] Attempt ${attempt}/${maxRetries} failed:`, err)
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 2000))
      }
    }
  }
  return false
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

// ── Profile ──

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

// ── Admin: Settings ──

export interface AdminSettings {
  ai_scoring_profile: "strict" | "normal" | "lenient"
  free_exam_upsell_text: string
  free_exam_telegram_upsell_text: string
}

export async function adminFetchSettings(): Promise<AdminSettings | null> {
  const res = await fetchWithAuth("/api/admin/settings")
  if (!res.ok) return null
  return res.json()
}

export async function adminUpdateSettings(body: Partial<AdminSettings>): Promise<boolean> {
  const res = await fetchWithAuth("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  return res.ok
}

export interface ContactInfo {
  telegram: string
  phone: string
  message: string
  bot_username: string
  upsell_text?: string
}

export async function fetchContactInfo(): Promise<ContactInfo | null> {
  const res = await fetch(getApiUrl("/api/exams/contact-info"))
  if (!res.ok) return null
  return res.json()
}

// ── Profile photo ──

export async function uploadProfilePhoto(file: File): Promise<boolean> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetchWithAuth("/api/auth/me/photo", {
    method: "POST",
    body: form,
  })
  return res.ok
}

export async function syncTelegramPhoto(): Promise<boolean> {
  const res = await fetchWithAuth("/api/auth/me/photo/sync-telegram", {
    method: "POST",
  })
  return res.ok
}

// ── Admin: Stats ──

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
  photo_url: string | null
  /** Proxy URL for display (avoids CORB). Prefer for <img>. */
  photo_url_display?: string | null
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

export async function adminUpdateExam(examId: string, body: object): Promise<boolean> {
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
  student_name?: string
  student_phone?: string
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

export async function adminFetchResults(status?: string): Promise<AdminResult[]> {
  const url = status ? `/api/admin/results?status=${status}` : "/api/admin/results"
  const res = await fetchWithAuth(url)
  if (!res.ok) return []
  return res.json()
}

export async function adminFetchResultDetail(resultId: string): Promise<AdminResultDetail | null> {
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

export interface AiRecordingScore {
  recording_id: string
  part_type?: string
  part_label?: string
  max_score?: number
  /** Always a number (0 on error) — backend never returns null */
  score: number
  feedback?: string
  error?: boolean
  /** Backend field is "transcript", not "transcription" */
  transcript?: string
  fluency_metrics?: {
    words_per_minute: number
    pause_count: number
    avg_pause_duration: number
    long_pauses: number
    filler_words: number
    total_words: number
    speaking_rate: string
  }
  /** Criteria are top-level string fields, not a nested object with numbers */
  grammar?: string
  vocabulary?: string
  pronunciation?: string
  fluency?: string
  coherence?: string
  level_achieved?: string
  strengths?: string[]
  improvements?: string[]
}

export interface AiAssessmentCost {
  whisper_minutes: number
  whisper_cost_usd: number
  gpt_input_tokens: number
  gpt_output_tokens: number
  gpt_input_cost_usd: number
  gpt_output_cost_usd: number
  /** Combined input + output GPT cost */
  gpt_cost_usd: number
  total_cost_usd: number
}

export interface AiAssessResponse {
  error?: string
  recording_scores: AiRecordingScore[]
  criteria_total?: number
  max_criteria?: number
  conversion_score?: number
  max_conversion?: number
  overall_level?: string
  scoring_profile?: string
  general_feedback?: string
  cost?: AiAssessmentCost
  model?: string
}

export async function adminAiAssess(resultId: string): Promise<AiAssessResponse | null> {
  const res = await fetchWithAuth(`/api/admin/results/${resultId}/ai-assess`, {
    method: "POST",
  })
  if (!res.ok) return null
  return res.json()
}

// ── Exam Access ──

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