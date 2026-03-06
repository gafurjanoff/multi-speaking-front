import type { StudentProfile } from "@/lib/api-types"

interface StudentsTabProps {
  students: StudentProfile[]
}

export function StudentsTab({ students }: StudentsTabProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {students.map((student) => (
        <div
          key={student.id}
          className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: "hsl(var(--exam-primary))" }}
            >
              {student.name.charAt(0)}
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {student.name}
              </p>
              <p className="text-xs text-muted-foreground">{student.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted px-4 py-3 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">
                {student.level}
              </p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {student.totalExamsTaken}
              </p>
              <p className="text-xs text-muted-foreground">Exams</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {student.averageScore}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
