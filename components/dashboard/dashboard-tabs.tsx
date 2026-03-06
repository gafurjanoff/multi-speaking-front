export type DashboardTab = "overview" | "exams" | "leaderboard"

interface DashboardTabsProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const tabs: { id: DashboardTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "exams", label: "My exams" },
  { id: "leaderboard", label: "Leaderboard" },
]

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
