interface CertExamInfoProps {
  examTitle: string
  completedAt: string
}

export function CertExamInfo({ examTitle, completedAt }: CertExamInfoProps) {
  return (
    <div className="cert-exam-block">
      <div className="cert-exam-name">{examTitle}</div>
      <div className="cert-exam-meta">
        Completed on{" "}
        {new Date(completedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        .<br />
        The overall score reflects performance across fluency, pronunciation,
        range &amp; accuracy, and task achievement.
      </div>
    </div>
  )
}
