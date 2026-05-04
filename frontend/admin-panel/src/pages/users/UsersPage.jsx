import { useState } from "react"
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
  UserCog,
  GraduationCap
} from "lucide-react"
import { toast } from "sonner"
import { Card } from "../../components/ui/card"

import UserInviteModal from "./UserInviteModal"
import EditUserModal from "./EditUserModal"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import PageLoader from "../../components/common/PageLoader"
import TableSkeleton from "../../components/common/TableSkeleton"
import UserFilters from "./UserFilters"
import UserTable from "./UserTable"

export default function UsersPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [userToEdit, setUserToEdit] = useState(null)
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [institutionFilter, setInstitutionFilter] = useState("all")
  
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortDir, setSortDir] = useState("DESC")

  const queryClient = useQueryClient()

  const { data: usersData, isLoading, error, isFetching } = useQuery({
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
    }),
    placeholderData: (previousData) => previousData
  })

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles
  })

  const { data: institutionsData } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => listInstitutions()
  })

  const rawUsers = usersData?.data?.users || []
  const totalCount = usersData?.data?.totalCount || 0
  const roles = rolesData?.data?.roles || []
  const institutions = institutionsData?.data?.institutions || []

  const getDerivedStatus = (user) => {
    if (user.isSuspended) return "SUSPENDED"
    if (user.isActive) return "ACTIVE"
    if (user.invitationToken) return "PENDING"
    return "REVOKED"
  }

  const users = rawUsers.map(user => ({
    ...user,
    status: getDerivedStatus(user)
  }))

  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
    setInstitutionFilter("all")
    setPage(1)
  }

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const mutationOptions = {
    onSuccess: (data) => {
      toast.success(data.message || "Action successful")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  const resendMutation = useMutation({ mutationFn: resendInvite, ...mutationOptions })
  const revokeMutation = useMutation({ mutationFn: revokeInvite, ...mutationOptions })
  const suspendMutation = useMutation({ mutationFn: suspendUser, ...mutationOptions })
  const unsuspendMutation = useMutation({ mutationFn: unsuspendUser, ...mutationOptions })
  const deleteMutation = useMutation({ mutationFn: deleteUser, ...mutationOptions })

  if (error) return (
    <Card className="p-12 flex flex-col items-center justify-center text-center border-destructive/20 bg-destructive/5">
      <AlertTriangle size={48} className="text-destructive mb-4" />
      <h3 className="text-xl font-bold text-destructive mb-2">Failed to load users</h3>
      <p className="text-muted-foreground">{error.response?.data?.message || error.message}</p>
    </Card>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 text-primary/5 rotate-12 pointer-events-none">
          <GraduationCap size={200} />
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 bg-background shadow-sm rounded-xl text-primary border border-primary/10">
            <UserCog size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">Directory Management</h2>
            <p className="text-muted-foreground mt-1">Oversee institutional registrars, board members, and system administrators.</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsInviteModalOpen(true)} 
          className="gap-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 relative z-10 h-11 px-6 rounded-xl font-semibold"
        >
          <UserPlus size={18} />
          Invite New User
        </Button>
      </div>

      <UserFilters 
        searchTerm={searchTerm}
        setSearchTerm={handleFilterChange(setSearchTerm)}
        roleFilter={roleFilter}
        setRoleFilter={handleFilterChange(setRoleFilter)}
        statusFilter={statusFilter}
        setStatusFilter={handleFilterChange(setStatusFilter)}
        institutionFilter={institutionFilter}
        setInstitutionFilter={handleFilterChange(setInstitutionFilter)}
        roles={roles}
        institutions={institutions}
        onClear={clearFilters}
      />

      {isLoading && !usersData ? (
        <TableSkeleton rows={limit} columns={5} />
      ) : (
        <UserTable 
          users={users}
          totalCount={totalCount}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={(field) => {
            if (sortBy === field) {
              setSortDir(sortDir === "ASC" ? "DESC" : "ASC")
            } else {
              setSortBy(field)
              setSortDir("ASC")
            }
          }}
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
      )}

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
        description={
          <>
            Are you sure you want to permanently delete <span className="font-bold text-foreground">"{userToDelete?.firstName} {userToDelete?.lastName}"</span>? 
            <br/><br/>
            This will completely remove their access and all associated configuration from the digital records system. This action cannot be reversed.
          </>
        }
      />
    </div>
  )
}

