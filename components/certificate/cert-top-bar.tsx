interface CertTopBarProps {
  backHref?: string
}

export function CertTopBar({ backHref = "/dashboard" }: CertTopBarProps) {
  return (
    <div className="top-bar">
      <a href={backHref} className="back-link">
        <svg
          className="back-arrow"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to dashboard
      </a>
      <button
        type="button"
        className="download-btn"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.print()
          }
        }}
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Download
      </button>
    </div>
  )
}
