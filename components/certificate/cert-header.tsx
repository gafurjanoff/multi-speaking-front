interface CertHeaderProps {
  score75?: number
}

export function CertHeader({ score75 }: CertHeaderProps) {
  return (
    <div className="cert-header">
      <div className="cert-brand">
        <div className="cert-icon">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </div>
        <div>
          <div className="cert-eyebrow">Multilevel Speaking Exam</div>
          <div className="cert-title-small">Official Score Certificate (Mock)</div>
        </div>
      </div>
      {score75 !== undefined && (
        <div className="cert-score-badge">
          <div className="cert-score-label">Total Score</div>
          <div className="cert-score-num">
            {score75}
            <span className="cert-score-denom">/75</span>
          </div>
        </div>
      )}
    </div>
  )
}
