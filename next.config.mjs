/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Auth
      { source: "/api/auth/:path*", destination: `${backendUrl}/api/auth/:path*` },
      // Exams
      { source: "/api/exams", destination: `${backendUrl}/api/exams` },
      { source: "/api/exams/:id", destination: `${backendUrl}/api/exams/:id` },
      { source: "/api/exams/:id/:path*", destination: `${backendUrl}/api/exams/:id/:path*` },
      // Sessions
      { source: "/api/sessions", destination: `${backendUrl}/api/sessions` },
      { source: "/api/sessions/:path*", destination: `${backendUrl}/api/sessions/:path*` },
      // Admin
      { source: "/api/admin/:path*", destination: `${backendUrl}/api/admin/:path*` },
      // Enrollments
      { source: "/api/enrollments", destination: `${backendUrl}/api/enrollments` },
      { source: "/api/enrollments/:path*", destination: `${backendUrl}/api/enrollments/:path*` },
      // Uploads (audio files)
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ]
  },
}

export default nextConfig
