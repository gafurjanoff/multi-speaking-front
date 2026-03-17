"use client"

import { useEffect, useState, useCallback } from "react"
import {
  adminFetchExams,
  adminFetchExamDetail,
  adminCreateExam,
  adminUpdateExam,
  adminDeleteExam,
  adminUploadImage,
  type BackendExamDetail,
} from "@/lib/api-services"
import type { ExamCard } from "@/lib/api-types"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  FileText,
  Upload,
  ImageIcon,
  CheckCircle2,
  XCircle,
  X,
  ChevronUp,
  ChevronDown,
  Clipboard,
} from "lucide-react"

/* ── Toast component ── */
type ToastType = "success" | "error"

function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: ToastType
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg backdrop-blur-sm ${
          type === "success"
            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/80 dark:text-green-300"
            : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/80 dark:text-red-300"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 rounded-md p-0.5 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingExam, setEditingExam] = useState<ExamCard | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type })
  }, [])

  const loadExams = async () => {
    setLoading(true)
    const data = await adminFetchExams()
    setExams(data)
    setLoading(false)
  }

  useEffect(() => {
    loadExams()
  }, [])

  const handleCreate = async (body: object) => {
    const ok = await adminCreateExam(body)
    if (ok) {
      setShowForm(false)
      showToast("Exam created successfully!", "success")
      await loadExams()
    } else {
      showToast("Failed to create exam. Please try again.", "error")
    }
  }

  const handleUpdate = async (examId: string, body: object) => {
    const ok = await adminUpdateExam(examId, body)
    if (ok) {
      setEditingExam(null)
      showToast("Exam updated successfully!", "success")
      await loadExams()
    } else {
      showToast("Failed to update exam. Please try again.", "error")
    }
  }

  const handleDelete = async (examId: string) => {
    if (!confirm("Delete this exam permanently?")) return
    const ok = await adminDeleteExam(examId)
    if (ok) {
      showToast("Exam deleted.", "success")
      await loadExams()
    } else {
      showToast("Failed to delete exam.", "error")
    }
  }

  const handleTogglePublish = async (exam: ExamCard) => {
    const ok = await adminUpdateExam(exam.id, { is_published: !exam.isPublished })
    if (ok) {
      showToast(exam.isPublished ? "Exam unpublished." : "Exam published!", "success")
      await loadExams()
    } else {
      showToast("Failed to update publish status.", "error")
    }
  }

  const filtered = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.level.toLowerCase().includes(search.toLowerCase())
  )

  if (showForm || editingExam) {
    return (
      <>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
        <ExamForm
          exam={editingExam}
          onSubmit={(body) =>
            editingExam ? handleUpdate(editingExam.id, body) : handleCreate(body)
          }
          onCancel={() => {
            setShowForm(false)
            setEditingExam(null)
          }}
        />
      </>
    )
  }

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all speaking exams
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
        >
          <Plus className="h-4 w-4" />
          Create Exam
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exams..."
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No exams found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first exam to get started
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_80px_80px_80px_120px] items-center gap-3 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Exam</span>
              <span className="text-center">Level</span>
              <span className="text-center">Parts</span>
              <span className="text-center">Type</span>
              <span className="text-right">Actions</span>
            </div>
            {filtered.map((exam) => (
              <div
                key={exam.id}
                className="grid grid-cols-[1fr_80px_80px_80px_120px] items-center gap-3 border-t border-border px-5 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {exam.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {exam.questionsCount} questions
                  </p>
                </div>
                <span className="text-center">
                  <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                    {exam.level}
                  </span>
                </span>
                <span className="text-center text-sm text-muted-foreground">
                  {exam.totalParts}
                </span>
                <span className="text-center">
                  {exam.isFree ? (
                    <span className="inline-block rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Free
                    </span>
                  ) : (
                    <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Paid
                    </span>
                  )}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleTogglePublish(exam)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Toggle publish"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingExam(exam)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {filtered.map((exam) => (
              <div key={exam.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{exam.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{exam.questionsCount} questions · {exam.totalParts} parts</p>
                  </div>
                  <span className="inline-block shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                    {exam.level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {exam.isFree ? (
                      <span className="inline-block rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">Free</span>
                    ) : (
                      <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Paid</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePublish(exam)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingExam(exam)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Types for the builder ──

interface ForAgainstDraft {
  side: "for" | "against"
  point_text: string
}

interface QuestionDraft {
  text: string
  sub_questions: string[]
  images: string[]
  for_against_points: ForAgainstDraft[]
}

interface PartDraft {
  type: "part1" | "part1_photos" | "part2" | "part3"
  title: string
  part_number: number
  instruction: string
  images: string[]
  prep_time: number
  answer_time: number
  mock_questions_to_ask: number
  questions: QuestionDraft[]
}

const PART_TYPES: { value: PartDraft["type"]; label: string }[] = [
  { value: "part1", label: "Part 1 \u2013 Short Questions" },
  { value: "part1_photos", label: "Part 1.2 \u2013 Photo Questions" },
  { value: "part2", label: "Part 2 \u2013 Long Turn" },
  { value: "part3", label: "Part 3 \u2013 For & Against" },
]

const INSTRUCTION_PART1 =
  "I will ask you some questions about yourself, then show you some photos to discuss. You have 30 seconds for the personal questions and 45 seconds for the photo questions. Please start speaking when you hear this sound."

const INSTRUCTION_PART2 =
  "In this part, I'm going to show you a picture and ask you three questions. You will have one minute to think about your answers before you start speaking. You will have two minutes to answer all three questions. Begin speaking when you hear this sound."

const INSTRUCTION_PART3 =
  "In this part, you are going to speak on a topic for two minutes. You can see the topic on the screen and two lists of points \u2013 for and against \u2013 related to the topic. Choose two items from each list and give a balanced argument to represent both sides of the topic. You have one minute to prepare your argument. You will then have two minutes to speak. Begin speaking when you hear this sound."

const PART_DEFAULTS: Record<PartDraft["type"], Partial<PartDraft>> = {
  part1: {
    title: "Part 1 \u2013 Short Questions",
    prep_time: 5,
    answer_time: 30,
    mock_questions_to_ask: 0,
    instruction: INSTRUCTION_PART1,
  },
  part1_photos: {
    title: "Part 1.2 \u2013 Photo Questions",
    prep_time: 10,
    answer_time: 45,
    mock_questions_to_ask: 0,
    instruction: "",
  },
  part2: {
    title: "Part 2 \u2013 Long Turn",
    prep_time: 60,
    answer_time: 120,
    mock_questions_to_ask: 0,
    instruction: INSTRUCTION_PART2,
  },
  part3: {
    title: "Part 3 \u2013 For & Against",
    prep_time: 60,
    answer_time: 120,
    mock_questions_to_ask: 0,
    instruction: INSTRUCTION_PART3,
  },
}

function emptyQuestion(): QuestionDraft {
  return { text: "", sub_questions: [], images: [], for_against_points: [] }
}

const MAX_IMAGE_SIZE_MB = 8
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function emptyPart(partNumber: number): PartDraft {
  return {
    type: "part1",
    title: "Part 1 \u2013 Short Questions",
    part_number: partNumber,
    instruction: INSTRUCTION_PART1,
    images: [],
    prep_time: 5,
    answer_time: 30,
    mock_questions_to_ask: 0,
    questions: [emptyQuestion()],
  }
}

// ── Exam Form (full builder) ──

function mapBackendToPartDrafts(detail: BackendExamDetail): PartDraft[] {
  if (!detail || !detail.parts) return []
  return detail.parts.map((p) => ({
    type: p.type as PartDraft["type"],
    title: p.title,
    part_number: p.part_number,
    instruction: p.instruction,
    images: p.images ?? [],
    prep_time: p.prep_time,
    answer_time: p.answer_time,
    mock_questions_to_ask: p.mock_questions_to_ask ?? 0,
    questions: p.questions.map((q) => ({
      text: q.text,
      sub_questions: q.sub_questions ?? [],
      images: q.images ?? [],
      for_against_points: (q.for_against ?? []).map((fa) => ({
        side: fa.side as "for" | "against",
        point_text: fa.point_text,
      })),
    })),
  }))
}

function ExamForm({
  exam,
  onSubmit,
  onCancel,
}: {
  exam: ExamCard | null
  onSubmit: (body: object) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(exam?.title ?? "")
  const [level, setLevel] = useState(exam?.level ?? "B2")
  const [description, setDescription] = useState(exam?.description ?? "")
  const [isFree, setIsFree] = useState(exam?.isFree ?? false)
  const [isMock, setIsMock] = useState(exam?.isMock ?? true)
  const [isPublished, setIsPublished] = useState(exam?.isPublished ?? false)
  const [freeAttemptLimit, setFreeAttemptLimit] = useState(exam?.freeAttemptLimit ?? 3)
  const [mockAttemptLimit, setMockAttemptLimit] = useState(exam?.mockAttemptLimit ?? 5)
  const [accessValidityDays, setAccessValidityDays] = useState(exam?.accessValidityDays ?? 30)
  const [shuffleQuestionsForMock, setShuffleQuestionsForMock] = useState(exam?.shuffleQuestionsForMock ?? true)
  const [autoAiAssessment, setAutoAiAssessment] = useState(exam?.autoAiAssessment ?? true)
  const [parts, setParts] = useState<PartDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [expandedPart, setExpandedPart] = useState<number | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    if (!exam) return
    setLoadingDetail(true)
    adminFetchExamDetail(exam.id).then((detail) => {
      if (detail) {
        setParts(mapBackendToPartDrafts(detail))
        setFreeAttemptLimit(detail.free_attempt_limit ?? 3)
        setMockAttemptLimit(detail.mock_attempt_limit ?? 5)
        setAccessValidityDays(detail.access_validity_days ?? 30)
        setShuffleQuestionsForMock(detail.shuffle_questions_for_mock ?? true)
        setAutoAiAssessment(detail.auto_ai_assessment ?? true)
      }
      setLoadingDetail(false)
    })
  }, [exam])

  const validateExamConfig = (): string | null => {
    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const part = parts[pIdx]
      if (part.type !== "part1_photos") continue

      const validSets = part.questions.filter((q) => q.text.trim())
      if (part.mock_questions_to_ask > 0 && part.mock_questions_to_ask > validSets.length) {
        return `Part ${pIdx + 1}: "Paid Questions To Ask" is ${part.mock_questions_to_ask}, but only ${validSets.length} photo set(s) are configured.`
      }

      for (let qIdx = 0; qIdx < part.questions.length; qIdx++) {
        const q = part.questions[qIdx]
        // Skip completely empty draft rows
        if (!q.text.trim() && q.sub_questions.every((s) => !s.trim()) && q.images.length === 0) {
          continue
        }
        if (!q.text.trim()) {
          return `Part ${pIdx + 1}, Set ${qIdx + 1}: description question text is required.`
        }
        if (!q.images.length) {
          return `Part ${pIdx + 1}, Set ${qIdx + 1}: photo image is required.`
        }
        if (!q.sub_questions.filter((s) => s.trim()).length) {
          return `Part ${pIdx + 1}, Set ${qIdx + 1}: add at least one follow-up question.`
        }
      }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    const validationError = validateExamConfig()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setSubmitting(true)
    await onSubmit({
      title,
      level,
      description,
      is_free: isFree,
      is_mock: isMock,
      is_published: isPublished,
      free_attempt_limit: freeAttemptLimit,
      mock_attempt_limit: mockAttemptLimit,
      access_validity_days: accessValidityDays,
      shuffle_questions_for_mock: shuffleQuestionsForMock,
      auto_ai_assessment: autoAiAssessment,
      parts: parts.map((p) => ({
        type: p.type,
        title: p.title,
        part_number: p.part_number,
        instruction: p.instruction,
        images: p.images.length > 0 ? p.images : null,
        prep_time: p.prep_time,
        answer_time: p.answer_time,
        mock_questions_to_ask: p.mock_questions_to_ask,
        questions: p.questions
          .filter((q) => q.text.trim() || q.sub_questions.some((s) => s.trim()) || q.for_against_points.some((f) => f.point_text.trim()))
          .map((q) => ({
            text: q.text,
            sub_questions: q.sub_questions.filter((s) => s.trim()),
            images: q.images.length > 0 ? q.images : null,
            for_against_points: q.for_against_points.filter(
              (f) => f.point_text.trim()
            ),
          })),
      })),
    })
    setSubmitting(false)
  }

  const addPart = () => {
    const idx = parts.length
    setParts([...parts, emptyPart(idx + 1)])
    setExpandedPart(idx)
  }

  const removePart = (idx: number) => {
    setParts(
      parts
        .filter((_, i) => i !== idx)
        .map((p, i) => ({ ...p, part_number: i + 1 }))
    )
    setExpandedPart(null)
  }

  const updatePart = (idx: number, updates: Partial<PartDraft>) => {
    setParts(parts.map((p, i) => (i === idx ? { ...p, ...updates } : p)))
  }

  const changePartType = (idx: number, type: PartDraft["type"]) => {
    const defaults = PART_DEFAULTS[type]
    updatePart(idx, { type, images: [], ...defaults })
  }

  const addQuestion = (partIdx: number) => {
    const updated = [...parts]
    updated[partIdx].questions.push(emptyQuestion())
    setParts(updated)
  }

  const removeQuestion = (partIdx: number, qIdx: number) => {
    const updated = [...parts]
    updated[partIdx].questions = updated[partIdx].questions.filter(
      (_, i) => i !== qIdx
    )
    setParts(updated)
  }

  const updateQuestion = (
    partIdx: number,
    qIdx: number,
    updates: Partial<QuestionDraft>
  ) => {
    const updated = [...parts]
    updated[partIdx].questions[qIdx] = {
      ...updated[partIdx].questions[qIdx],
      ...updates,
    }
    setParts(updated)
  }

  const addSubQuestion = (partIdx: number, qIdx: number) => {
    const updated = [...parts]
    updated[partIdx].questions[qIdx].sub_questions.push("")
    setParts(updated)
  }

  const updateSubQuestion = (partIdx: number, qIdx: number, sIdx: number, value: string) => {
    const updated = [...parts]
    updated[partIdx].questions[qIdx].sub_questions[sIdx] = value
    setParts(updated)
  }

  const removeSubQuestion = (partIdx: number, qIdx: number, sIdx: number) => {
    const updated = [...parts]
    updated[partIdx].questions[qIdx].sub_questions.splice(sIdx, 1)
    setParts(updated)
  }

  const addForAgainst = (
    partIdx: number,
    qIdx: number,
    side: "for" | "against"
  ) => {
    const updated = [...parts]
    updated[partIdx].questions[qIdx].for_against_points.push({
      side,
      point_text: "",
    })
    setParts(updated)
  }

  const updateForAgainst = (
    partIdx: number,
    qIdx: number,
    fIdx: number,
    value: string
  ) => {
    const updated = [...parts]
    updated[partIdx].questions[qIdx].for_against_points[fIdx].point_text = value
    setParts(updated)
  }

  const removeForAgainst = (
    partIdx: number,
    qIdx: number,
    fIdx: number
  ) => {
    const updated = [...parts]
    updated[partIdx].questions[qIdx].for_against_points.splice(fIdx, 1)
    setParts(updated)
  }

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return "Only JPG, PNG, WEBP or GIF images are allowed."
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return `Image is too large. Max size is ${MAX_IMAGE_SIZE_MB}MB.`
    }
    return null
  }

  const handleImageUpload = async (partIdx: number, file: File) => {
    const validation = validateImageFile(file)
    if (validation) {
      setFormError(validation)
      return
    }
    setUploadingImage(true)
    setFormError("")
    const url = await adminUploadImage(file)
    if (url) {
      const updated = [...parts]
      updated[partIdx].images.push(url)
      setParts(updated)
    }
    setUploadingImage(false)
  }

  const handleQuestionImageUpload = async (partIdx: number, qIdx: number, file: File) => {
    const validation = validateImageFile(file)
    if (validation) {
      setFormError(validation)
      return
    }
    setUploadingImage(true)
    setFormError("")
    const url = await adminUploadImage(file)
    if (url) {
      updateQuestion(partIdx, qIdx, { images: [url] })
    }
    setUploadingImage(false)
  }

  const removeImage = (partIdx: number, iIdx: number) => {
    const updated = [...parts]
    updated[partIdx].images.splice(iIdx, 1)
    setParts(updated)
  }

  const movePart = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= parts.length) return
    const updated = [...parts]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(toIdx, 0, moved)
    setParts(updated.map((p, i) => ({ ...p, part_number: i + 1 })))
    if (expandedPart === fromIdx) setExpandedPart(toIdx)
    else if (expandedPart !== null) {
      if (fromIdx < expandedPart && toIdx >= expandedPart) setExpandedPart(expandedPart - 1)
      else if (fromIdx > expandedPart && toIdx <= expandedPart) setExpandedPart(expandedPart + 1)
    }
  }

  const moveQuestion = (partIdx: number, fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= parts[partIdx].questions.length) return
    const updated = [...parts]
    const qs = [...updated[partIdx].questions]
    const [moved] = qs.splice(fromIdx, 1)
    qs.splice(toIdx, 0, moved)
    updated[partIdx] = { ...updated[partIdx], questions: qs }
    setParts(updated)
  }

  const handleImagePaste = async (partIdx: number, e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) await handleImageUpload(partIdx, file)
        return
      }
    }
  }

  const handleQuestionImagePaste = async (
    partIdx: number,
    qIdx: number,
    e: React.ClipboardEvent
  ) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) await handleQuestionImageUpload(partIdx, qIdx, file)
        return
      }
    }
  }

  const handleQuestionImageDrop = async (
    partIdx: number,
    qIdx: number,
    e: React.DragEvent
  ) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    )
    if (!files.length) return
    const file = files[0]
    const validation = validateImageFile(file)
    if (validation) {
      setFormError(validation)
      return
    }
    await handleQuestionImageUpload(partIdx, qIdx, file)
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
  const tealBtnStyle = { backgroundColor: "hsl(174, 42%, 51%)" }

  return (
    <div>
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to exams
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {formError}
          </div>
        )}
        {/* ── Exam metadata ── */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-xl font-bold text-foreground">
            {exam ? "Edit Exam" : "Create New Exam"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={inputClass}
                placeholder="B2 Speaking Exam"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={inputClass}
                >
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                </select>
              </div>
              <div className="flex items-end gap-5">
                {[
                  { label: "Free", checked: isFree, set: setIsFree },
                  { label: "Mock", checked: isMock, set: setIsMock },
                  { label: "Publish", checked: isPublished, set: setIsPublished },
                ].map((c) => (
                  <label
                    key={c.label}
                    className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={c.checked}
                      onChange={(e) => c.set(e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Free Attempt Limit</label>
                <input
                  type="number"
                  min={1}
                  value={freeAttemptLimit}
                  onChange={(e) => setFreeAttemptLimit(Number(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Paid Attempt Limit</label>
                <input
                  type="number"
                  min={1}
                  value={mockAttemptLimit}
                  onChange={(e) => setMockAttemptLimit(Number(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Access Validity Days (Paid)</label>
                <input
                  type="number"
                  min={1}
                  value={accessValidityDays}
                  onChange={(e) => setAccessValidityDays(Number(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestionsForMock}
                  onChange={(e) => setShuffleQuestionsForMock(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Shuffle paid exam questions
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAiAssessment}
                  onChange={(e) => setAutoAiAssessment(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Auto AI assessment on submit
              </label>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Describe what this exam covers..."
              />
            </div>
          </div>
        </div>

        {/* ── Parts ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              Parts ({parts.length})
            </h3>
            <button
              type="button"
              onClick={addPart}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={tealBtnStyle}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Part
            </button>
          </div>

          {loadingDetail && (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Loading exam parts...</span>
            </div>
          )}

          {!loadingDetail && parts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No parts yet. Click &ldquo;Add Part&rdquo; to start building the exam.
              </p>
            </div>
          )}

          {parts.map((part, pIdx) => {
            const isExpanded = expandedPart === pIdx
            const showImages = false
            const showForAgainst = part.type === "part3"
            const showInstruction = part.type !== "part1_photos"

            return (
              <div
                key={pIdx}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Part header */}
                <div
                  className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedPart(isExpanded ? null : pIdx)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={tealBtnStyle}
                    >
                      {pIdx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {part.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {part.questions.length} question
                        {part.questions.length !== 1 ? "s" : ""}
                        {part.images.length > 0
                          ? ` · ${part.images.length} image${part.images.length !== 1 ? "s" : ""}`
                          : ""}
                        {" · "}prep {part.prep_time}s · answer {part.answer_time}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); movePart(pIdx, pIdx - 1) }}
                      disabled={pIdx === 0}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); movePart(pIdx, pIdx + 1) }}
                      disabled={pIdx === parts.length - 1}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePart(pIdx)
                      }}
                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <svg
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Part body (expanded) */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Part Type</label>
                        <select
                          value={part.type}
                          onChange={(e) =>
                            changePartType(
                              pIdx,
                              e.target.value as PartDraft["type"]
                            )
                          }
                          className={inputClass}
                        >
                          {PART_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Title</label>
                        <input
                          value={part.title}
                          onChange={(e) =>
                            updatePart(pIdx, { title: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Instruction — hidden for Part 1.2 (shares Part 1's instruction) */}
                    {showInstruction && (
                      <div>
                        <label className={labelClass}>
                          Instruction{" "}
                          <span className="normal-case font-normal text-muted-foreground">
                            (will be converted to audio)
                          </span>
                        </label>
                        <textarea
                          value={part.instruction}
                          onChange={(e) =>
                            updatePart(pIdx, { instruction: e.target.value })
                          }
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />
                        {part.type === "part1" && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            This instruction covers both Part 1 and Part 1.2
                          </p>
                        )}
                      </div>
                    )}
                    {!showInstruction && (
                      <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
                        Part 1.2 uses Part 1&apos;s instruction audio (no separate instruction needed)
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Prep Time (seconds)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={part.prep_time}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, "")
                            updatePart(pIdx, { prep_time: v === "" ? 0 : Number(v) })
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Answer Time (seconds)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={part.answer_time}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, "")
                            updatePart(pIdx, { answer_time: v === "" ? 0 : Number(v) })
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Paid Questions To Ask
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={part.mock_questions_to_ask}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, "")
                            updatePart(pIdx, { mock_questions_to_ask: v === "" ? 0 : Number(v) })
                          }}
                          className={inputClass}
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {part.type === "part1_photos"
                            ? "For Part 1.2 this means photo sets per attempt. 0 = use all sets."
                            : "0 = use all questions (from pool) in paid mock attempts."}
                        </p>
                      </div>
                    </div>
                    {part.type === "part1_photos" && (
                      <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
                        Part 1.2 Photo Set Mode: each question here should be one full set
                        (description + linked follow-ups in sub-questions + one photo image).
                      </div>
                    )}

                    {/* ── Part-level images (currently unused for Part 2; images are per-question) ── */}
                    {showImages && (
                      <div
                        tabIndex={0}
                        onPaste={(e) => handleImagePaste(pIdx, e)}
                        className="rounded-xl border-2 border-dashed border-border p-3 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelClass}>
                            <ImageIcon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                            Images
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-primary hover:underline">
                            <Upload className="h-3.5 w-3.5" />
                            {uploadingImage ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingImage}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(pIdx, file)
                                e.target.value = ""
                              }}
                            />
                          </label>
                        </div>
                        {part.images.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {part.images.map((img, iIdx) => (
                              <div
                                key={iIdx}
                                className="group relative h-24 w-24 rounded-xl border border-border overflow-hidden bg-muted"
                              >
                                <img
                                  src={img}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(pIdx, iIdx)}
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-4 w-4 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-6">
                            <p className="text-xs text-muted-foreground">
                              No images yet. Upload or paste images for this part.
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                              <Clipboard className="h-3 w-3" />
                              Click here, then Ctrl+V / ⌘V to paste
                            </p>
                          </div>
                        )}
                        {part.images.length > 0 && (
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            Tip: paste (Ctrl+V / ⌘V) to add more images quickly.
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Questions ── */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Questions ({part.questions.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => addQuestion(pIdx)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          + Add Question
                        </button>
                      </div>

                      <div className="space-y-3">
                        {part.questions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="rounded-xl border border-border bg-background p-4 space-y-3"
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                {qIdx + 1}
                              </span>
                              <div className="flex-1">
                                <label className={labelClass}>
                                  Question Text{part.type === "part2" ? " (optional)" : ""}
                                </label>
                                <textarea
                                  value={q.text}
                                  onChange={(e) =>
                                    updateQuestion(pIdx, qIdx, {
                                      text: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className={`${inputClass} resize-none`}
                                  placeholder={
                                    part.type === "part1"
                                      ? "e.g. Where do you live?"
                                      : part.type === "part2"
                                        ? "Optional – leave empty if using sub-questions only"
                                        : part.type === "part1_photos"
                                          ? "e.g. Describe what you see in the picture. (This becomes the photo description question)"
                                          : "e.g. Should school uniforms be mandatory?"
                                  }
                                />
                              </div>
                              <div className="mt-6 flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(pIdx, qIdx, qIdx - 1)}
                                  disabled={qIdx === 0}
                                  className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                  title="Move up"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(pIdx, qIdx, qIdx + 1)}
                                  disabled={qIdx === part.questions.length - 1}
                                  className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                  title="Move down"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(pIdx, qIdx)}
                                  className="rounded p-0.5 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Photo set image (Part 1.2 only, per set/question) */}
                            {part.type === "part1_photos" && (
                              <div
                                className="pl-7 rounded-lg border-2 border-dashed border-border bg-muted/30 p-2 transition-colors hover:border-primary/50 hover:bg-muted/60"
                                tabIndex={0}
                                onPaste={(e) => handleQuestionImagePaste(pIdx, qIdx, e)}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                }}
                                onDrop={(e) => handleQuestionImageDrop(pIdx, qIdx, e)}
                              >
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Photo (this set)
                                  </span>
                                  <label className="cursor-pointer text-[10px] font-semibold text-primary hover:underline">
                                    <Upload className="mr-1 inline h-3 w-3" />
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        await handleQuestionImageUpload(pIdx, qIdx, file)
                                        e.target.value = ""
                                      }}
                                    />
                                  </label>
                                </div>
                                <div className="flex items-center gap-3">
                                  {q.images && q.images.length > 0 ? (
                                    <div className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
                                      <img src={q.images[0]} alt="" className="h-full w-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => updateQuestion(pIdx, qIdx, { images: [] })}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                      >
                                        <Trash2 className="h-4 w-4 text-white" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border bg-background text-[11px] text-muted-foreground">
                                      1 photo
                                    </div>
                                  )}
                                  <div className="flex-1 space-y-1">
                                    <p className="text-[11px] text-muted-foreground">
                                      Add one photo for this set by upload, paste, or drag &amp; drop.
                                    </p>
                                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                                      <Clipboard className="h-3 w-3" />
                                      Click here, then paste (Ctrl+V / ⌘V) a screenshot.
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/70">
                                      Or drag an image file from your desktop and drop it on this box.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Long-turn image (Part 2 only, per question/card) */}
                            {part.type === "part2" && (
                              <div
                                className="pl-7 rounded-lg border-2 border-dashed border-border bg-muted/30 p-2 transition-colors hover:border-primary/50 hover:bg-muted/60"
                                tabIndex={0}
                                onPaste={(e) => handleQuestionImagePaste(pIdx, qIdx, e)}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                }}
                                onDrop={(e) => handleQuestionImageDrop(pIdx, qIdx, e)}
                              >
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Image (this Part 2 card)
                                  </span>
                                  <label className="cursor-pointer text-[10px] font-semibold text-primary hover:underline">
                                    <Upload className="mr-1 inline h-3 w-3" />
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        await handleQuestionImageUpload(pIdx, qIdx, file)
                                        e.target.value = ""
                                      }}
                                    />
                                  </label>
                                </div>
                                <div className="flex items-center gap-3">
                                  {q.images && q.images.length > 0 ? (
                                    <div className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
                                      <img src={q.images[0]} alt="" className="h-full w-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => updateQuestion(pIdx, qIdx, { images: [] })}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                      >
                                        <Trash2 className="h-4 w-4 text-white" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border bg-background text-[11px] text-muted-foreground">
                                      1 image
                                    </div>
                                  )}
                                  <div className="flex-1 space-y-1">
                                    <p className="text-[11px] text-muted-foreground">
                                      Add one image for this Part 2 card by upload, paste, or drag &amp; drop.
                                    </p>
                                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                                      <Clipboard className="h-3 w-3" />
                                      Click here, then paste (Ctrl+V / ⌘V) a screenshot.
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/70">
                                      Or drag an image file from your desktop and drop it on this box.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Sub-questions (Part 2 only) */}
                            {(part.type === "part2" || part.type === "part1_photos") && (
                              <div className="pl-7">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {part.type === "part1_photos" ? "Follow-up Questions (5s/30s each)" : "Sub-questions"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addSubQuestion(pIdx, qIdx)}
                                    className="text-[10px] font-semibold text-primary hover:underline"
                                  >
                                    + Add
                                  </button>
                                </div>
                                {part.type === "part1_photos" && (
                                  <p className="mb-1 text-[10px] text-muted-foreground">
                                    These follow-ups stay linked to this photo set and are shown right after the description question.
                                  </p>
                                )}
                                {q.sub_questions.map((sq, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-2 mb-1.5">
                                    <input
                                      value={sq}
                                      onChange={(e) =>
                                        updateSubQuestion(pIdx, qIdx, sIdx, e.target.value)
                                      }
                                      className={`${inputClass} text-xs`}
                                      placeholder={`Sub-question ${sIdx + 1}...`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeSubQuestion(pIdx, qIdx, sIdx)}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* For/Against (Part 3 only) */}
                            {showForAgainst && (
                              <div className="pl-7 space-y-2">
                                {(["for", "against"] as const).map((side) => (
                                  <div key={side}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span
                                        className={`text-[10px] font-semibold uppercase tracking-wider ${side === "for" ? "text-green-600" : "text-red-500"}`}
                                      >
                                        {side === "for" ? "For" : "Against"}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          addForAgainst(pIdx, qIdx, side)
                                        }
                                        className="text-[10px] font-semibold text-primary hover:underline"
                                      >
                                        + Add
                                      </button>
                                    </div>
                                    {q.for_against_points.map((fa, fIdx) =>
                                      fa.side === side ? (
                                        <div
                                          key={fIdx}
                                          className="flex items-center gap-2 mb-1.5"
                                        >
                                          <input
                                            value={fa.point_text}
                                            onChange={(e) =>
                                              updateForAgainst(
                                                pIdx,
                                                qIdx,
                                                fIdx,
                                                e.target.value
                                              )
                                            }
                                            className={`${inputClass} text-xs`}
                                            placeholder={`${side === "for" ? "Supporting" : "Opposing"} argument...`}
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeForAgainst(
                                                pIdx,
                                                qIdx,
                                                fIdx
                                              )
                                            }
                                            className="text-red-400 hover:text-red-600"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ) : null
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={tealBtnStyle}
          >
            {submitting ? "Saving..." : exam ? "Update Exam" : "Create Exam"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
