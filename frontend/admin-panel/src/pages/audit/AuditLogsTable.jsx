import { 
  History, 
  ChevronRight, 
  Eye, 
  Search,
  User,
  Shield,
  ExternalLink
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import Pagination from "../../components/common/Pagination"
import TableSkeleton from "../../components/common/TableSkeleton"
import { Card } from "../../components/ui/card"

const getActionColor = (action) => {
  if (action.includes("CREATE") || action.includes("REGISTER") || action.includes("ISSUE")) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (action.includes("UPDATE")) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  if (action.includes("DELETE") || action.includes("REVOKE") || action.includes("SUSPEND")) return "bg-destructive/10 text-destructive border-destructive/20";
  if (action.includes("RESTORE") || action.includes("UNSUSPEND")) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (action.includes("LOGIN")) return "bg-primary/10 text-primary border-primary/20";
  return "bg-muted text-muted-foreground";
}

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
  if (isFetching && logs.length === 0) {
    return <TableSkeleton columns={6} rows={10} />
  }

  if (logs.length === 0) {
    return (
      <Card className="p-20 flex flex-col items-center justify-center text-center border-dashed border-2">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Search size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold">No activity logs found</h3>
        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/10 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead className="hidden md:table-cell">IP Address</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-primary/5 transition-colors group">
                <TableCell className="font-medium text-xs">
                  <div className="flex flex-col">
                    <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {log.actorFirstName || log.actorLastName ? `${log.actorFirstName || ''} ${log.actorLastName || ''}`.trim() : "System"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{log.actorEmail || "system@internal"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`font-mono text-[10px] px-2 py-0 h-5 border-none shadow-none uppercase ${getActionColor(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{log.entityType}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">ID: {log.entityId}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Shield size={12} className="text-primary/50" />
                    <span className="text-xs font-mono">{log.ipAddress || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onViewDetails(log)}
                    className="rounded-full hover:bg-primary hover:text-primary-foreground h-8 w-8"
                  >
                    <ExternalLink size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={itemsPerPage}
        onPageChange={onPageChange}
        onPageSizeChange={onItemsPerPageChange}
      />
    </div>
  )
}
