export type ExamPartType = "part1" | "part1_photos" | "part2" | "part3"

export interface ForAgainstPoint {
  side: "for" | "against"
  pointText: string
}

export interface ExamQuestion {
  id: string
  text: string
  subQuestions?: string[]
  images?: string[]
  forAgainst?: ForAgainstPoint[]
}

export interface ExamPart {
  id: string
  type: ExamPartType
  title: string
  partNumber: number
  instruction: string
  instructionAudio?: string | null
  images?: string[] | null
  prepTime: number // seconds
  answerTime: number // seconds
  questions: ExamQuestion[]
}

export interface Exam {
  id: string
  title: string
  level: string
  isFree?: boolean
  isMock?: boolean
  parts: ExamPart[]
}

export interface RecordingSegment {
  partId: string
  questionId: string
  partOrder: number
  questionOrder: number
  blob: Blob
  duration: number
  uploaded?: boolean
}

export interface ExamSession {
  examId: string
  startedAt: Date
  recordings: RecordingSegment[]
  completedAt?: Date
}

export type ExamPhase = "intro" | "prep" | "answer" | "transition" | "complete"

export interface ExamState {
  currentPartIndex: number
  currentQuestionIndex: number
  phase: ExamPhase
  timeRemaining: number
  isRecording: boolean
}
