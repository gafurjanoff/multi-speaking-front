"use client"

import { useEffect, useState } from "react"
import {
  adminFetchUsers,
  adminToggleAdmin,
  type AdminUser,
} from "@/lib/api-services"
import { Search, Shield, ShieldOff, Users } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [toggling, setToggling] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    const data = await adminFetchUsers()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleAdmin = async (user: AdminUser) => {
    const action = user.is_admin ? "remove admin from" : "make admin"
    if (
      !confirm(
        `Are you sure you want to ${action} ${user.first_name || user.phone_number}?`
      )
    )
      return
    setToggling(user.id)
    const ok = await adminToggleAdmin(user.id, !user.is_admin)
    if (ok) await loadUsers()
    setToggling(null)
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.phone_number.includes(q) ||
      (u.first_name ?? "").toLowerCase().includes(q) ||
      (u.last_name ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform users and admin access
        </p>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No users found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_1fr_120px_100px_100px] items-center gap-3 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Name</span>
            <span>Phone</span>
            <span className="text-center">Joined</span>
            <span className="text-center">Role</span>
            <span className="text-right">Action</span>
          </div>
          {filtered.map((user) => {
            const name =
              [user.first_name, user.last_name].filter(Boolean).join(" ") ||
              "No name"
            const initials = name.charAt(0).toUpperCase()
            return (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_1fr_120px_100px_100px] items-center gap-3 border-t border-border px-5 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {name}
                    </p>
                    {user.is_verified && (
                      <p className="text-[10px] text-green-600">Verified</p>
                    )}
                  </div>
                </div>
                <span className="truncate text-sm text-muted-foreground">
                  {user.phone_number}
                </span>
                <span className="text-center text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </span>
                <span className="flex items-center justify-center">
                  {user.is_admin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">User</span>
                  )}
                </span>
                <span className="text-right">
                  <button
                    onClick={() => handleToggleAdmin(user)}
                    disabled={toggling === user.id}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
                      user.is_admin
                        ? "border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        : "border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {toggling === user.id ? (
                      "..."
                    ) : user.is_admin ? (
                      <span className="flex items-center gap-1">
                        <ShieldOff className="h-3 w-3" />
                        Revoke
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Make Admin
                      </span>
                    )}
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
