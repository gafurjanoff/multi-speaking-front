"use client"

import { useEffect, useState, useCallback } from "react"
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
import { Shield, Trash2, Plus, Search, UserCheck, X, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
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

export default function AdminAccessPage() {
  const [records, setRecords] = useState<ExamAccessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showGrant, setShowGrant] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [exams, setExams] = useState<ExamCard[]>([])
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const [granting, setGranting] = useState(false)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [revokeConfirm, setRevokeConfirm] = useState<{ id: string; user_name: string; exam_title: string } | null>(null)
  const [grantConfirm, setGrantConfirm] = useState(false)

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type })
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await adminFetchAccess()
    setRecords(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const openGrantModal = async () => {
    setShowGrant(true)
    const [u, e] = await Promise.all([adminFetchUsers(), adminFetchExams()])
    setUsers(u)
    setExams(e.filter((ex) => !ex.isFree))
  }

  const handleGrantClick = () => {
    if (!selectedUser || !selectedExam) return
    setGrantConfirm(true)
  }

  const handleGrantConfirm = async () => {
    if (!selectedUser || !selectedExam) return
    setGrantConfirm(false)
    setGranting(true)
    const ok = await adminGrantAccess(selectedUser, selectedExam)
    if (ok) {
      showToast("Access granted!", "success")
      setShowGrant(false)
      setSelectedUser("")
      setSelectedExam("")
      await loadData()
    } else {
      showToast("Failed to grant access. Already granted?", "error")
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

  const filtered = records.filter((r) => {
    const q = search.toLowerCase()
    return r.user_name.toLowerCase().includes(q) || r.user_phone.includes(q) || r.exam_title.toLowerCase().includes(q)
  })

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Approve users for paid exams after payment</p>
        </div>
        <button
          onClick={openGrantModal}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
        >
          <Plus className="h-4 w-4" />
          Grant Access
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or exam..."
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <UserCheck className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No access records yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Grant access after receiving payment</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_1fr_1fr_100px_80px] items-center gap-3 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Student</span>
            <span>Phone</span>
            <span>Exam</span>
            <span className="text-center">Status</span>
            <span className="text-right">Action</span>
          </div>
          {filtered.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_1fr_1fr_100px_80px] items-center gap-3 border-t border-border px-5 py-3.5 transition-colors hover:bg-muted/30">
              <p className="truncate text-sm font-medium text-foreground">{r.user_name || "No name"}</p>
              <p className="truncate text-sm text-muted-foreground">{r.user_phone}</p>
              <p className="truncate text-sm text-muted-foreground">{r.exam_title}</p>
              <span className="flex justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Shield className="h-3 w-3" />
                  {r.status}
                </span>
              </span>
              <span className="text-right">
                <button
                  onClick={() => handleRevokeClick(r)}
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Revoke confirmation modal */}
      <Dialog open={!!revokeConfirm} onOpenChange={(open) => !open && setRevokeConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Revoke access?
            </DialogTitle>
            <DialogDescription>
              {revokeConfirm && (
                <>This will revoke <strong>{revokeConfirm.user_name}</strong>&apos;s access to <strong>{revokeConfirm.exam_title}</strong>. They will no longer be able to take this exam until you grant access again.</>
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

      {/* Grant confirmation modal */}
      <Dialog open={grantConfirm} onOpenChange={setGrantConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Confirm grant access
            </DialogTitle>
            <DialogDescription>
              {selectedUser && selectedExam && (
                <>Grant <strong>{users.find((u) => u.id === selectedUser)?.first_name || users.find((u) => u.id === selectedUser)?.phone_number || "this user"}</strong> access to <strong>{exams.find((e) => e.id === selectedExam)?.title}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setGrantConfirm(false)}
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

      {/* Grant Access Modal */}
      {showGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Grant Exam Access</h2>
              <button onClick={() => setShowGrant(false)} className="rounded-lg p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Choose a user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.phone_number} ({u.phone_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Paid Exam</label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Choose an exam --</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>{e.title} ({e.level})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGrantClick}
                disabled={!selectedUser || !selectedExam || granting}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
              >
                {granting ? "Granting..." : "Grant Access"}
              </button>
              <button
                onClick={() => setShowGrant(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
