interface CertFeedbackProps {
  feedback: string
}

export function CertFeedback({ feedback }: CertFeedbackProps) {
  return (
    <div className="feedback-block">
      <div className="feedback-label">Examiner Feedback</div>
      <div className="feedback-text">{feedback}</div>
    </div>
  )
}
