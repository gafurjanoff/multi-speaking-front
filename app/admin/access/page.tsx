"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  adminFetchAccess,
  adminGrantAccess,
  adminRevokeAccess,
  adminFetchUsers,
  adminFetchExams,
  type ExamAccessRecord,
  type AdminUser,
} from "@/lib/api-services"
import type { ExamCard } from "@/lib/api-types"
import {
  Shield,
  Trash2,
  Plus,
  Search,
  UserCheck,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  UserPlus,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ToastType = "success" | "error"

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg backdrop-blur-sm ${
        type === "success"
          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/80 dark:text-green-300"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/80 dark:text-red-300"
      }`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 rounded-md p-0.5 hover:opacity-70"><X className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

interface ExamWithStudents {
  exam: ExamCard
  students: ExamAccessRecord[]
}

export default function AdminAccessPage() {
  const [records, setRecords] = useState<ExamAccessRecord[]>([])
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [paidExams, setPaidExams] = useState<ExamCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Per-exam add student state
  const [addingToExam, setAddingToExam] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState("")
  const [granting, setGranting] = useState(false)

  // Expand/collapse state per exam card
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  // Confirm dialogs
  const [revokeConfirm, setRevokeConfirm] = useState<{ id: string; user_name: string; exam_title: string } | null>(null)
  const [grantConfirm, setGrantConfirm] = useState<{ users: AdminUser[]; examId: string; examTitle: string } | null>(null)
  const [selectedForGrant, setSelectedForGrant] = useState<Set<string>>(new Set())

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type })
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    const [accessData, usersData, examsData] = await Promise.all([
      adminFetchAccess(),
      adminFetchUsers(),
      adminFetchExams(),
    ])
    setRecords(accessData)
    setAllUsers(usersData)
    setPaidExams(examsData.filter((e) => !e.isFree))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Group access records by exam
  const examGroups: ExamWithStudents[] = useMemo(() => {
    const q = search.toLowerCase()
    return paidExams
      .map((exam) => ({
        exam,
        students: records.filter((r) => r.exam_id === exam.id),
      }))
      .filter((group) => {
        if (!q) return true
        // Search in exam title, or any student name/phone in this exam
        if (group.exam.title.toLowerCase().includes(q)) return true
        return group.students.some(
          (s) =>
            s.user_name.toLowerCase().includes(q) ||
            s.user_phone.includes(q)
        )
      })
  }, [paidExams, records, search])

  // Users not yet enrolled in a specific exam
  const availableUsersForExam = useCallback(
    (examId: string) => {
      const enrolledUserIds = new Set(
        records.filter((r) => r.exam_id === examId).map((r) => r.user_id)
      )
      const q = userSearch.toLowerCase()
      return allUsers.filter((u) => {
        if (enrolledUserIds.has(u.id)) return false
        if (!q) return true
        const name = [u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase()
        return name.includes(q) || u.phone_number.includes(q)
      })
    },
    [allUsers, records, userSearch]
  )

  const handleGrant = async (user: AdminUser, examId: string, examTitle: string) => {
    setGrantConfirm({ users: [user], examId, examTitle })
  }

  const handleBulkGrant = (examId: string, examTitle: string) => {
    const users = allUsers.filter((u) => selectedForGrant.has(u.id))
    if (users.length === 0) return
    setGrantConfirm({ users, examId, examTitle })
  }

  const toggleSelectUser = (userId: string) => {
    setSelectedForGrant((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const handleGrantConfirm = async () => {
    if (!grantConfirm) return
    const { users, examId } = grantConfirm
    setGrantConfirm(null)
    setGranting(true)
    let successCount = 0
    for (const user of users) {
      const ok = await adminGrantAccess(user.id, examId)
      if (ok) successCount++
    }
    if (successCount > 0) {
      showToast(
        successCount === 1
          ? `Access granted to ${users[0].first_name || users[0].phone_number}`
          : `Access granted to ${successCount} students`,
        "success"
      )
      setAddingToExam(null)
      setUserSearch("")
      setSelectedForGrant(new Set())
      await loadData()
    } else {
      showToast("Failed to grant access", "error")
    }
    setGranting(false)
  }

  const handleRevokeClick = (r: ExamAccessRecord) => {
    setRevokeConfirm({ id: r.id, user_name: r.user_name || "this user", exam_title: r.exam_title })
  }

  const handleRevokeConfirm = async () => {
    if (!revokeConfirm) return
    const { id } = revokeConfirm
    setRevokeConfirm(null)
    const ok = await adminRevokeAccess(id)
    if (ok) {
      showToast("Access revoked.", "success")
      await loadData()
    } else {
      showToast("Failed to revoke.", "error")
    }
  }

  const toggleCollapse = (examId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(examId)) next.delete(examId)
      else next.add(examId)
      return next
    })
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Exam Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage which students can take each paid exam
        </p>
      </div>

      <div className="mb-5 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exams or students..."
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : examGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No paid exams found</p>
          <p className="mt-1 text-xs text-muted-foreground">Create a paid exam first, then grant student access here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {examGroups.map(({ exam, students }) => {
            const isCollapsed = collapsed.has(exam.id)
            const isAdding = addingToExam === exam.id

            return (
              <div key={exam.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Exam header */}
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleCollapse(exam.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{exam.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exam.level} • {students.length} {students.length === 1 ? "student" : "students"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedForGrant(new Set())
                        if (isAdding) {
                          setAddingToExam(null)
                          setUserSearch("")
                        } else {
                          setAddingToExam(exam.id)
                          setUserSearch("")
                          // Auto-expand when adding
                          setCollapsed((prev) => {
                            const next = new Set(prev)
                            next.delete(exam.id)
                            return next
                          })
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Add Student</span>
                    </button>
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Add student inline panel */}
                {isAdding && !isCollapsed && (
                  <div className="border-t border-border bg-muted/30 px-5 py-3">
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        autoFocus
                        className="w-full rounded-lg border border-border bg-background pl-9 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={() => { setAddingToExam(null); setUserSearch(""); setSelectedForGrant(new Set()) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-muted"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    {(() => {
                      const available = availableUsersForExam(exam.id)
                      const shown = available.slice(0, 50)
                      const allSelected = shown.length > 0 && shown.every((u) => selectedForGrant.has(u.id))
                      return (
                        <>
                          {shown.length > 0 && (
                            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={() => {
                                    if (allSelected) {
                                      setSelectedForGrant(new Set())
                                    } else {
                                      setSelectedForGrant(new Set(shown.map((u) => u.id)))
                                    }
                                  }}
                                  className="h-3.5 w-3.5 rounded border-border accent-[hsl(174,42%,51%)]"
                                />
                                Select all ({shown.length})
                              </label>
                              {selectedForGrant.size > 0 && (
                                <button
                                  type="button"
                                  disabled={granting}
                                  onClick={() => handleBulkGrant(exam.id, exam.title)}
                                  className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                  style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                  Grant {selectedForGrant.size} selected
                                </button>
                              )}
                            </div>
                          )}
                          <div className="max-h-48 overflow-y-auto space-y-1 p-1">
                            {available.length === 0 ? (
                              <p className="py-3 text-center text-xs text-muted-foreground">
                                {userSearch ? "No matching users found" : "All users already have access"}
                              </p>
                            ) : (
                              shown.map((u) => {
                                const name = [u.first_name, u.last_name].filter(Boolean).join(" ")
                                return (
                                  <div
                                    key={u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-background"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedForGrant.has(u.id)}
                                      onChange={() => toggleSelectUser(u.id)}
                                      className="h-4 w-4 shrink-0 rounded border-border accent-[hsl(174,42%,51%)]"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {name || "No name"}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">{u.phone_number}</p>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={granting}
                                      onClick={() => handleGrant(u, exam.id, exam.title)}
                                      className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                                      title="Grant access"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}

                {/* Student list */}
                {!isCollapsed && (
                  <div className="border-t border-border">
                    {students.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">No students enrolled yet</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {students.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
                                {(s.user_name || "?")[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {s.user_name || "No name"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">{s.user_phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <Shield className="h-3 w-3" />
                                approved
                              </span>
                              <button
                                onClick={() => handleRevokeClick(s)}
                                className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                title="Revoke access"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Revoke confirmation */}
      <Dialog open={!!revokeConfirm} onOpenChange={(open) => !open && setRevokeConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Revoke access?
            </DialogTitle>
            <DialogDescription>
              {revokeConfirm && (
                <>This will revoke <strong>{revokeConfirm.user_name}</strong>&apos;s access to <strong>{revokeConfirm.exam_title}</strong>. They will no longer be able to take this exam.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setRevokeConfirm(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleRevokeConfirm}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90"
            >
              Revoke access
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant confirmation */}
      <Dialog open={!!grantConfirm} onOpenChange={(open) => !open && setGrantConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Grant access?
            </DialogTitle>
            <DialogDescription>
              {grantConfirm && (
                grantConfirm.users.length === 1 ? (
                  <>Grant <strong>{grantConfirm.users[0].first_name || grantConfirm.users[0].phone_number}</strong> access to <strong>{grantConfirm.examTitle}</strong>?</>
                ) : (
                  <>Grant access to <strong>{grantConfirm.users.length} students</strong> for <strong>{grantConfirm.examTitle}</strong>?</>
                )
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setGrantConfirm(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleGrantConfirm}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
            >
              Yes, grant access
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
