export function getRecordingUrl(filePath: string | null): string {
  if (!filePath) return ""
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath
  if (filePath.startsWith("/api/") || filePath.startsWith("/uploads/")) return filePath
  const idx = filePath.indexOf("uploads")
  if (idx >= 0) return "/" + filePath.slice(idx).replace(/\\/g, "/")
  const filename = filePath.split(/[/\\]/).pop()
  return filename ? `/uploads/recordings/${filename}` : ""
}
