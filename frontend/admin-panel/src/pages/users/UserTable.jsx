import { 
  MoreHorizontal, 
  RefreshCw, 
  Ban, 
  CheckCircle, 
  Trash2, 
  ShieldAlert, 
  SearchX,
  Pencil,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"

import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import Pagination from "../../components/common/Pagination"

export default function UserTable({ 
  users, 
  totalCount,
  currentPage,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  sortBy,
  sortDir,
  onSort,
  isFiltered, 
  isFetching,
  onEdit, 
  onDelete, 
  onSuspend, 
  onUnsuspend, 
  onResend, 
  onRevoke,
  onInvite,
  onClearFilters 
}) {
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  
  const getStatusBadge = (status) => {
    const badgeClass = "w-24 justify-center shadow-sm text-[10px] uppercase tracking-wider font-bold"
    switch (status) {
      case "ACTIVE":
        return <Badge className={`bg-emerald-500 hover:bg-emerald-600 text-white border-none ${badgeClass}`}>Active</Badge>
      case "PENDING":
        return <Badge variant="outline" className={`text-amber-600 border-amber-200 bg-amber-50 ${badgeClass}`}>Pending</Badge>
      case "SUSPENDED":
        return <Badge variant="destructive" className={`border-none ${badgeClass}`}>Suspended</Badge>
      case "REVOKED":
        return <Badge variant="secondary" className={`bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent ${badgeClass}`}>Revoked</Badge>
      default:
        return <Badge variant="outline" className={badgeClass}>{status}</Badge>
    }
  }

  const SortHeader = ({ field, label, className = "" }) => {
    const isSorted = sortBy === field
    return (
      <TableHead 
        className={`cursor-pointer transition-colors hover:text-foreground group ${className}`}
        onClick={() => onSort(field)}
      >
        <div className="flex items-center gap-1.5 py-5 pl-8 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
          {label}
          {isSorted ? (
            sortDir === "ASC" ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />
          ) : (
            <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" />
          )}
        </div>
      </TableHead>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-muted/60 overflow-hidden rounded-2xl relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-muted/60">
                <SortHeader field="firstName" label="User Details" />
                <SortHeader field="roleName" label="System Role" className="pl-0" />
                <SortHeader field="institutionName" label="Affiliated Institution" className="pl-0" />
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Status</TableHead>
                <TableHead className="text-right pr-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isFetching && users.length === 0) ? (
                <TableBodySkeleton rows={itemsPerPage} columns={5} />
              ) : users.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-72 text-center border-none">
                    <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                      <div className="p-4 bg-muted/30 rounded-full mb-4">
                        <SearchX size={48} className="text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {isFiltered ? "No matching users found" : "No users found"}
                      </p>
                      <p className="text-sm max-w-sm mt-1 mb-6">
                        {isFiltered
                          ? "Try adjusting your search terms or filters to find what you're looking for."
                          : "There are currently no administrative users registered in the system. Start by inviting an institution registrar."}
                      </p>
                      {!isFiltered ? (
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={onInvite}>
                          <UserPlus size={16} /> Invite your first user
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={onClearFilters}>Clear all filters</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="group transition-colors hover:bg-muted/40 cursor-pointer border-muted/60">
                    <TableCell className="py-4 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/10 shadow-sm shrink-0">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="flex flex-col min-w-0 text-left">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-sm">
                        {user.roleName === "SUPER_ADMIN" ? (
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 justify-center w-32 rounded-md px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider shadow-sm">
                            <ShieldAlert size={12} />
                            {user.roleName.replace("_", " ")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted w-32 justify-center px-2 py-0.5 rounded-md font-medium text-[10px] uppercase tracking-wider">
                            {user.roleName.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground/80 truncate max-w-[180px] block">
                        {user.institutionName || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-muted/60">
                          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 px-3 py-2">Account Actions</DropdownMenuLabel>
                          
                          {user.status === "PENDING" && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => onResend(user.id)}
                                className="gap-2 cursor-pointer"
                              >
                                <RefreshCw size={14} className="text-muted-foreground" /> Resend Invitation
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onRevoke(user.id)}
                                className="gap-2 text-amber-600 cursor-pointer focus:text-amber-700 focus:bg-amber-50"
                              >
                                <Ban size={14} /> Revoke Invitation
                              </DropdownMenuItem>
                            </>
                          )}

                          {user.status === "ACTIVE" && (
                            <DropdownMenuItem 
                              onClick={() => onSuspend(user.id)}
                              className="gap-2 text-amber-600 cursor-pointer focus:text-amber-700 focus:bg-amber-50"
                            >
                              <Ban size={14} /> Suspend Account
                            </DropdownMenuItem>
                          )}

                          {user.status === "SUSPENDED" && (
                            <DropdownMenuItem 
                              onClick={() => onUnsuspend(user.id)}
                              className="gap-2 text-emerald-600 cursor-pointer focus:text-emerald-700 focus:bg-emerald-50"
                            >
                              <CheckCircle size={14} /> Unsuspend Account
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem 
                            onClick={() => onEdit(user)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil size={14} className="text-muted-foreground" /> Edit Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(user)}
                            className="gap-2 text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 size={14} /> Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <Pagination 
          page={currentPage} 
          totalPages={totalPages} 
          setPage={onPageChange} 
          limit={itemsPerPage} 
          setLimit={onItemsPerPageChange} 
          totalCount={totalCount} 
          itemName="users" 
          isFetching={isFetching} 
        />
      </Card>
    </div>
  )
}
