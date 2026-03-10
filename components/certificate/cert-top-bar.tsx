"use client"

import { useState } from "react"

interface CertTopBarProps {
  backHref?: string
}

export function CertTopBar({ backHref = "/dashboard" }: CertTopBarProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (typeof window === "undefined") return
    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      const certCard = document.querySelector(".cert-card") as HTMLElement
      if (!certCard) {
        setDownloading(false)
        return
      }

      const canvas = await html2canvas(certCard, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // A4 dimensions in mm
      const pdfWidth = 210
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth

      const pdf = new jsPDF({
        orientation: pdfHeight > 297 ? "portrait" : "portrait",
        unit: "mm",
        format: [pdfWidth, Math.max(pdfHeight, 297)],
      })

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight)
      pdf.save("certificate.pdf")
    } catch (err) {
      console.error("PDF generation failed:", err)
      // Fallback to window.print() on failure
      window.print()
    } finally {
      setDownloading(false)
    }
  }

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
        <span className="back-link-text">Back to dashboard</span>
      </a>
      <button
        type="button"
        className="download-btn"
        disabled={downloading}
        onClick={handleDownload}
      >
        {downloading ? (
          <span className="download-spinner" />
        ) : (
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
        )}
        {downloading ? "Generating..." : "Download PDF"}
      </button>
    </div>
  )
}
