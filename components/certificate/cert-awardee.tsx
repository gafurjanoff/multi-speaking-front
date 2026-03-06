interface CertAwardeeProps {
  fullName: string
  dateOfBirth?: string
}

export function CertAwardee({ fullName, dateOfBirth }: CertAwardeeProps) {
  return (
    <>
      <div className="cert-awardee-label">Awarded to</div>
      <div className="cert-awardee-name">{fullName}</div>
      {dateOfBirth && (
        <div className="cert-dob">Date of birth &middot; {dateOfBirth}</div>
      )}
    </>
  )
}
