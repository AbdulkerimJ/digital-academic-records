import { 
  MoreHorizontal, 
  RefreshCw, 
  Ban, 
  CheckCircle, 
  Trash2, 
  SearchX,
  Pencil,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  User
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
import { cn } from "../../lib/utils"

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
    switch (status) {
      case "Active":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-700 tracking-widest">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Active account
          </div>
        )
      case "Pending":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-500/10 border border-slate-500/20 text-[9px] font-bold text-slate-600 tracking-widest">
            Pending invite
          </div>
        )
      case "Suspended":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-700 tracking-widest">
            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            Suspended
          </div>
        )
      case "Revoked":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-700 tracking-widest">
            Revoked
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-muted/20 border border-border text-[9px] font-bold text-muted-foreground tracking-widest">
            {status}
          </div>
        )
    }
  }

  const SortHeader = ({ field, label, className = "" }) => {
    const isSorted = sortBy === field
    return (
      <TableHead 
        className={cn(
          "cursor-pointer transition-all hover:bg-muted/10 border-r border-border/50 last:border-0",
          className
        )}
        onClick={() => onSort(field)}
      >
        <div className="flex items-center justify-between py-4 px-6 text-[10px] font-bold text-muted-foreground capitalize tracking-widest">
          {label}
          <div className="flex flex-col gap-0.5">
            {isSorted ? (
              sortDir === "ASC" ? <ArrowUp size={10} className="text-primary" /> : <ArrowDown size={10} className="text-primary" />
            ) : (
              <ArrowUpDown size={10} className="opacity-20" />
            )}
          </div>
        </div>
      </TableHead>
    )
  }

  return (
    <div className="bg-card border border-border shadow-sm p-1">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <SortHeader field="firstName" label="User details" className="w-[300px]" />
              <SortHeader field="roleName" label="System role" className="w-[180px]" />
              <SortHeader field="institutionName" label="Institution" className="w-[250px]" />
              <TableHead className="py-4 px-6 text-[10px] font-bold text-muted-foreground border-r border-border/50 w-[150px] capitalize tracking-widest">Status</TableHead>
              <TableHead className="text-right pr-8 py-4 text-[10px] font-bold text-muted-foreground capitalize tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isFetching && users.length === 0) ? (
              <TableBodySkeleton rows={itemsPerPage} columns={5} />
            ) : users.length === 0 ? (
              <TableRow>
                 <TableCell colSpan={5} className="h-96 text-center border-none">
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                    <div className="w-16 h-16 bg-muted/30 flex items-center justify-center mb-6 border border-border">
                      <SearchX size={32} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-black text-foreground capitalize tracking-widest">
                      {isFiltered ? "No matching records" : "Registry empty"}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground max-w-xs mt-2 mb-8 leading-relaxed tracking-tight">
                      {isFiltered
                        ? "Adjust filters to locate the specific identity record."
                        : "There are currently no administrative users registered. Start by inviting a registrar."}
                    </p>
                    {!isFiltered ? (
                      <Button variant="outline" className="rounded-none gap-2 font-bold text-[10px] border-border shadow-sm capitalize tracking-widest" onClick={onInvite}>
                        <UserPlus size={14} /> Invite first user
                      </Button>
                    ) : (
                      <Button variant="outline" className="rounded-none font-bold text-[10px] border-border shadow-sm capitalize tracking-widest" onClick={onClearFilters}>Reset filters</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group border-border hover:bg-primary/[0.02] transition-colors cursor-pointer border-b last:border-0">
                  <TableCell className="py-3 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted/20 border border-border flex items-center justify-center text-muted-foreground font-black text-xs shrink-0 font-mono">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="font-black text-xs tracking-tighter text-foreground capitalize group-hover:text-primary transition-colors truncate">
                          {user.firstName} {user.lastName}
                        </span>
                        <code className="text-[10px] font-bold text-muted-foreground/50 mt-0.5 truncate font-mono">{user.email}</code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center gap-2">
                      <Shield size={12} className={cn(
                        "opacity-30",
                        user.roleName === "SUPER_ADMIN" ? "text-primary opacity-100" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-[10px] font-bold capitalize tracking-widest",
                        user.roleName === "SUPER_ADMIN" ? "text-primary font-black" : "text-muted-foreground/70"
                      )}>
                        {user.roleName.replace("_", " ").toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center gap-2 text-foreground/80">
                      <User size={12} className="opacity-20" />
                      <span className="text-[10px] font-bold tracking-tight capitalize truncate max-w-[200px]">
                        {user.institutionName || "System managed"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6">{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-none border border-border shadow-2xl p-2">
                          <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/50 px-3 py-2 border-b border-border mb-2 capitalize tracking-widest">Account control</DropdownMenuLabel>
                          
                          {user.status === "Pending" && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => onResend(user.id)}
                                className="gap-3 cursor-pointer rounded-none text-[10px] font-bold p-3 focus:bg-primary/5 focus:text-primary transition-all capitalize tracking-widest"
                              >
                                <RefreshCw size={14} /> Resend invite
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onRevoke(user.id)}
                                className="gap-3 cursor-pointer rounded-none text-[10px] font-bold p-3 text-amber-600 focus:bg-amber-50 focus:text-amber-700 transition-all capitalize tracking-widest"
                              >
                                <Ban size={14} /> Revoke invite
                              </DropdownMenuItem>
                            </>
                          )}

                          {user.status === "Active" && (
                            <DropdownMenuItem 
                              onClick={() => onSuspend(user.id)}
                              className="gap-3 cursor-pointer rounded-none text-[10px] font-bold p-3 text-amber-600 focus:bg-amber-50 focus:text-amber-700 transition-all capitalize tracking-widest"
                            >
                              <Ban size={14} /> Suspend account
                            </DropdownMenuItem>
                          )}

                          {user.status === "Suspended" && (
                            <DropdownMenuItem 
                              onClick={() => onUnsuspend(user.id)}
                              className="gap-3 cursor-pointer rounded-none text-[10px] font-bold p-3 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 transition-all capitalize tracking-widest"
                            >
                              <CheckCircle size={14} /> Unsuspend account
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem 
                            onClick={() => onEdit(user)}
                            className="gap-3 cursor-pointer rounded-none text-[10px] font-bold p-3 focus:bg-primary/5 focus:text-primary transition-all capitalize tracking-widest"
                          >
                            <Pencil size={14} /> Edit details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-border my-2" />
                          <DropdownMenuItem 
                            onClick={() => onDelete(user)}
                            className="gap-3 cursor-pointer rounded-none text-[10px] font-bold p-3 text-destructive focus:bg-destructive/5 focus:text-destructive transition-all capitalize tracking-widest"
                          >
                            <Trash2 size={14} /> Delete record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
        className="px-6 py-4 border-t border-border bg-muted/5 rounded-none"
      />
    </div>
  )
}
