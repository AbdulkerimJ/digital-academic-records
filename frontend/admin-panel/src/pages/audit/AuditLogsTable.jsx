import { 
  Eye, 
  User, 
  Terminal, 
  Clock, 
  Shield, 
  Globe, 
  Activity,
  ArrowRight
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import Pagination from "../../components/common/Pagination"
import { cn } from "../../lib/utils"

export default function AuditLogsTable({ 
  logs, 
  totalCount, 
  currentPage, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  isFetching,
  onViewDetails 
}) {
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const getActionStyle = (action) => {
    const act = action?.toLowerCase() || ""
    if (act.includes("delete") || act.includes("remove")) return "bg-destructive/10 text-destructive border-destructive/20"
    if (act.includes("create") || act.includes("register") || act.includes("upload")) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    if (act.includes("update") || act.includes("edit") || act.includes("change")) return "bg-amber-500/10 text-amber-700 border-amber-500/20"
    return "bg-muted/50 text-muted-foreground border-border"
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <TableHead className="w-[240px] text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Administrator</TableHead>
              <TableHead className="w-[180px] text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Action type</TableHead>
              <TableHead className="w-[200px] text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Target entity</TableHead>
              <TableHead className="w-[180px] text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">IP address</TableHead>
              <TableHead className="w-[180px] text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Timestamp</TableHead>
              <TableHead className="text-right pr-8 text-[13px] font-bold text-muted-foreground py-2">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && logs.length === 0 ? (
              <TableBodySkeleton rows={itemsPerPage} columns={6} />
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center border-none">
                  <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                    <Shield size={48} strokeWidth={1} />
                    <p className="text-xs font-bold">No activity logs found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow 
                  key={log.id} 
                  className="group border-border hover:bg-primary/[0.02] transition-colors cursor-pointer border-b last:border-0"
                  onClick={() => onViewDetails(log)}
                >
                  <TableCell className="py-1.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted/30 border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="font-medium text-base tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                          {log.actorFirstName} {log.actorLastName}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal truncate">
                          {log.actorEmail}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-semibold tracking-widest",
                      getActionStyle(log.action)
                    )}>
                      {log.action}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-[11px] tracking-widest text-foreground uppercase">
                        {log.entityType}
                      </span>
                      <code className="text-xs font-normal text-muted-foreground/40 font-mono">
                        ID: {log.entityId?.slice(0, 12)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe size={12} className="opacity-40" />
                      <code className="text-xs font-normal font-mono tracking-tighter">
                        {log.ipAddress || "Unknown"}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    <div className="flex flex-col">
                      <div className="text-[11px] font-bold text-foreground font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                      </div>
                      <div className="text-[10px] font-medium text-muted-foreground capitalize">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8 py-1.5">
                    <div className="flex items-center justify-end gap-1 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all"
                      >
                        <ArrowRight size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="p-1 border-t border-border bg-muted/5">
        <Pagination 
          page={currentPage} 
          totalPages={totalPages} 
          setPage={onPageChange} 
          limit={itemsPerPage} 
          setLimit={onItemsPerPageChange} 
          totalCount={totalCount} 
          itemName="logs" 
          isFetching={isFetching} 
        />
      </div>
    </div>
  )
}
