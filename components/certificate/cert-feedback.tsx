interface SectionFeedback {
  part_label?: string
  question_text?: string
  feedback?: string
}

interface CertFeedbackProps {
  feedback: string
  sections?: SectionFeedback[]
}

function parseFeedback(fb: string | undefined): { short: string; words_used: string[]; wrong_usage: string[]; detailed: string } | null {
  if (!fb || typeof fb !== "string") return null
  try {
    const parsed = JSON.parse(fb)
    if (parsed && typeof parsed === "object") {
      return {
        short: parsed.short || parsed.feedback || fb,
        words_used: Array.isArray(parsed.words_used) ? parsed.words_used : [],
        wrong_usage: Array.isArray(parsed.wrong_usage) ? parsed.wrong_usage : [],
        detailed: parsed.detailed || "",
      }
    }
  } catch {
    /* plain text */
  }
  return { short: fb, words_used: [], wrong_usage: [], detailed: "" }
}

export function CertFeedback({ feedback, sections = [] }: CertFeedbackProps) {
  const sectionsWithFeedback = sections.filter((s) => s.feedback)
  return (
    <div className="feedback-block">
      <div className="feedback-label">Examiner Feedback</div>
      <div className="feedback-text">{feedback}</div>
      {sectionsWithFeedback.length > 0 && (
        <div className="mt-4 space-y-4">
          {sectionsWithFeedback.map((s, idx) => {
            const parsed = parseFeedback(s.feedback)
            if (!parsed) return null
            return (
              <div key={idx} className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm">
                <p className="font-semibold text-foreground">
                  {s.part_label || "Part"} — {s.question_text || "Question"}
                </p>
                <p className="mt-1 text-foreground">{parsed.short}</p>
                {parsed.words_used.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Words used well:</span>
                    <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                      {parsed.words_used.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {parsed.wrong_usage.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">To improve:</span>
                    <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                      {parsed.wrong_usage.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
