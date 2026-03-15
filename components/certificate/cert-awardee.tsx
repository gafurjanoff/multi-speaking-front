interface CertAwardeeProps {
  fullName: string
  photoUrl?: string
  dateOfBirth?: string
}

export function CertAwardee({ fullName, photoUrl, dateOfBirth }: CertAwardeeProps) {
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")

  return (
    <>
      <div className="cert-awardee-label">Awarded to</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", margin: "6px 0" }}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={fullName}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.35)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}
        <div className="cert-awardee-name" style={{ margin: 0 }}>{fullName}</div>
      </div>
      {dateOfBirth && (
        <div className="cert-dob">Date of birth &middot; {dateOfBirth}</div>
      )}
    </>
  )
}
