export type ExamPartType = "part1" | "part1_photos" | "part2" | "part3"

export interface ExamQuestion {
  id: string
  text: string
  subQuestions?: string[]
  images?: string[]
}

export interface ExamPart {
  id: string
  type: ExamPartType
  title: string
  partNumber: number
  instruction: string
  prepTime: number // seconds
  answerTime: number // seconds
  questions: ExamQuestion[]
}

export interface Exam {
  id: string
  title: string
  level: string
  parts: ExamPart[]
}

export interface RecordingSegment {
  partId: string
  questionId: string
  blob: Blob
  duration: number
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
