import { useState, useEffect } from "react"
import FetchingIndicator from "../../components/common/FetchingIndicator"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  listUsers, 
  deleteUser, 
  suspendUser, 
  unsuspendUser, 
  resendInvite, 
  revokeInvite,
  listRoles
} from "../../api/users.api"
import { listInstitutions } from "../../api/institutions.api"
import { Button } from "../../components/ui/button"
import { 
  UserPlus, 
  AlertTriangle,
  Activity,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import { Card } from "../../components/ui/card"

import UserInviteModal from "./UserInviteModal"
import EditUserModal from "./EditUserModal"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import UserFilters from "./UserFilters"
import UserTable from "./UserTable"

import { useSearchParams } from "react-router-dom"

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [userToEdit, setUserToEdit] = useState(null)
  
  // Filter & Pagination derived from searchParams
  const searchTerm = searchParams.get("search") || ""
  const roleFilter = searchParams.get("role") || "all"
  const statusFilter = searchParams.get("status") || "all"
  const institutionFilter = searchParams.get("institution") || "all"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const sortBy = searchParams.get("sortBy") || "createdAt"
  const sortDir = searchParams.get("sortDir") || "DESC"

  const setPage = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", newPage.toString())
    setSearchParams(newParams)
  }

  const setLimit = (newLimit) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("limit", newLimit.toString())
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || !value) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const setSort = (field) => {
    const newParams = new URLSearchParams(searchParams)
    if (sortBy === field) {
      newParams.set("sortDir", sortDir === "ASC" ? "DESC" : "ASC")
    } else {
      newParams.set("sortBy", field)
      newParams.set("sortDir", "ASC")
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const queryClient = useQueryClient()

  const { data: usersData, error, isFetching } = useQuery({
    queryKey: ["users", { page, limit, sortBy, sortDir, searchTerm, roleFilter, statusFilter, institutionFilter }],
    queryFn: () => listUsers({ 
      page, 
      limit, 
      offset: (page - 1) * limit,
      sortBy, 
      sortDir, 
      search: searchTerm, 
      role: roleFilter, 
      status: statusFilter, 
      institutionId: institutionFilter 
    })
  })

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles
  })

  const { data: institutionsData } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => listInstitutions()
  })

  const rawUsersData = usersData?.data?.users
  const rawUsers = Array.isArray(rawUsersData) ? rawUsersData : []
  const totalCount = usersData?.data?.totalCount || 0
  const rolesRaw = rolesData?.data?.roles
  const roles = Array.isArray(rolesRaw) ? rolesRaw : []
  const instRaw = institutionsData?.data?.institutions
  const institutions = Array.isArray(instRaw) ? instRaw : []

  // Predictive Prefetching
  useEffect(() => {
    const totalPages = Math.ceil(totalCount / limit)
    const commonParams = { 
      limit, 
      offset: 0,
      sortBy, 
      sortDir, 
      search: searchTerm, 
      role: roleFilter, 
      status: statusFilter, 
      institutionId: institutionFilter 
    }
    
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["users", { ...commonParams, page: page + 1, offset: page * limit }],
        queryFn: () => listUsers({ ...commonParams, page: page + 1, offset: page * limit })
      })
    }

    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["users", { ...commonParams, page: page - 1, offset: (page - 2) * limit }],
        queryFn: () => listUsers({ ...commonParams, page: page - 1, offset: (page - 2) * limit })
      })
    }
  }, [page, limit, sortBy, sortDir, searchTerm, roleFilter, statusFilter, institutionFilter, totalCount, queryClient])

  const getDerivedStatus = (user) => {
    if (user.isSuspended) return "Suspended"
    if (user.isActive) return "Active"
    if (user.invitationToken) return "Pending"
    return "Revoked"
  }

  const users = rawUsers.map(user => ({
    ...user,
    status: getDerivedStatus(user)
  }))

  const mutationOptions = {
    onSuccess: (data) => {
      toast.success(data.message || "Action successful")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  const resendMutation = useMutation({ 
    mutationFn: resendInvite, 
    onSuccess: (data) => {
      if (data.data?.emailSent) {
        toast.success(data.message || "Invitation resent successfully")
      } else {
        toast.warning("Invitation token was regenerated, but the email failed to send.")
      }
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to resend invitation")
    }
  })
  const revokeMutation = useMutation({ mutationFn: revokeInvite, ...mutationOptions })
  const suspendMutation = useMutation({ mutationFn: suspendUser, ...mutationOptions })
  const unsuspendMutation = useMutation({ mutationFn: unsuspendUser, ...mutationOptions })
  const deleteMutation = useMutation({ mutationFn: deleteUser, ...mutationOptions })

  if (error) return (
    <Card className="p-12 flex flex-col items-center justify-center text-center border-border bg-muted/5 rounded-none">
      <AlertTriangle size={48} className="text-destructive mb-4" />
      <h3 className="text-sm font-bold text-destructive mb-2">System error</h3>
      <p className="text-xs font-bold text-muted-foreground">{error.response?.data?.message || error.message}</p>
    </Card>
  )

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header (Keep Uppercase) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-700 tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity size={10} className="animate-pulse" /> System online
            </div>
            <div className="text-[9px] font-bold text-muted-foreground capitalize tracking-widest flex items-center gap-1">
              <Clock size={10} /> {new Date().toLocaleDateString()}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground capitalize leading-none">
            Directory <span className="text-primary">Registry</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            Manage institutional registrars, board members, and administrative access controls.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsInviteModalOpen(true)} 
          className="rounded-none h-11 px-8 gap-3 font-bold text-xs shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
        >
          <UserPlus size={14} /> Invite user
        </Button>
      </div>

      <UserFilters 
        searchTerm={searchTerm}
        setSearchTerm={(val) => updateFilters({ search: val })}
        roleFilter={roleFilter}
        setRoleFilter={(val) => updateFilters({ role: val })}
        statusFilter={statusFilter}
        setStatusFilter={(val) => updateFilters({ status: val })}
        institutionFilter={institutionFilter}
        setInstitutionFilter={(val) => updateFilters({ institution: val })}
        roles={roles}
        institutions={institutions}
        onClear={clearFilters}
      />

      <div className="relative">
        <FetchingIndicator isFetching={isFetching} />
        <UserTable 
          users={users}
          totalCount={totalCount}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={setSort}
          isFiltered={searchTerm || roleFilter !== "all" || statusFilter !== "all" || institutionFilter !== "all"}
          isFetching={isFetching}
          onEdit={setUserToEdit}
          onDelete={setUserToDelete}
          onSuspend={(userId) => suspendMutation.mutate({ userId })}
          onUnsuspend={unsuspendMutation.mutate}
          onResend={resendMutation.mutate}
          onRevoke={revokeMutation.mutate}
          onInvite={() => setIsInviteModalOpen(true)}
          onClearFilters={clearFilters}
        />
      </div>

      <UserInviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />

      <EditUserModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        user={userToEdit}
      />

      <ConfirmDeleteModal 
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          deleteMutation.mutate(userToDelete.id, {
            onSuccess: () => setUserToDelete(null)
          })
        }}
        isDeleting={deleteMutation.isPending}
        title="Delete user"
        description={
          <div className="space-y-4">
            <p className="text-xs font-bold text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <span className="text-foreground font-black underline underline-offset-4 decoration-primary/30">"{userToDelete?.firstName} {userToDelete?.lastName}"</span>?
            </p>
            <div className="bg-destructive/5 border-l-2 border-destructive p-4">
              <p className="text-[10px] font-bold text-destructive tracking-widest">Warning: Permanent action</p>
              <p className="text-[10px] font-bold text-destructive/70 mt-1">This will completely remove their access and associated configurations. This action cannot be reversed.</p>
            </div>
          </div>
        }
      />
    </div>
  )
}
