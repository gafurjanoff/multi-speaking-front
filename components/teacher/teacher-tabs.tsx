import { FileText, Users } from "lucide-react"

export type TeacherTab = "results" | "students"

interface TeacherTabsProps {
  activeTab: TeacherTab
  onTabChange: (tab: TeacherTab) => void
}

export function TeacherTabs({ activeTab, onTabChange }: TeacherTabsProps) {
  return (
    <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
      <button
        type="button"
        onClick={() => onTabChange("results")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
          activeTab === "results"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <FileText className="h-4 w-4" />
        Exam Results
      </button>
      <button
        type="button"
        onClick={() => onTabChange("students")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
          activeTab === "students"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Users className="h-4 w-4" />
        Students
      </button>
    </div>
  )
}
