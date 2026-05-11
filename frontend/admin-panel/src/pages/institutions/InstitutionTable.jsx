import { 
  MoreHorizontal, 
  Pencil, 
  Building2, 
  SearchX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash,
  Power,
  Activity,
  Fingerprint
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
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu"
import { Button } from "../../components/ui/button"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import Pagination from "../../components/common/Pagination"
import { cn } from "../../lib/utils"

export default function InstitutionTable({ 
  institutions, 
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
  onToggleStatus,
  onAdd,
  onClearFilters 
}) {
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  
  const SortHeader = ({ field, label, className = "" }) => {
    const isSorted = sortBy === field
    return (
      <TableHead 
        className={cn("cursor-pointer transition-colors hover:text-primary group border-r border-border/50 last:border-0", className)}
        onClick={() => onSort(field)}
      >
        <div className="flex items-center justify-between py-2 px-6 text-[13px] font-bold tracking-widest text-muted-foreground group-hover:text-primary">
          {label}
          {isSorted ? (
            sortDir === "ASC" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
          ) : (
            <ArrowUpDown size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
          )}
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
              <SortHeader field="name" label="Institution" className="w-[400px]" />
              <SortHeader field="code" label="Institution code" className="w-[200px]" />
              <SortHeader field="type" label="Category" className="w-[200px]" />
              <TableHead className="text-[13px] font-bold tracking-widest text-muted-foreground py-2 px-6 border-r border-border/50 w-[150px]">Status</TableHead>
              <TableHead className="text-right pr-10 py-2 text-[13px] font-bold tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && institutions.length === 0 ? (
              <TableBodySkeleton rows={itemsPerPage} columns={5} />
            ) : institutions.length === 0 ? (
              <TableRow>
                 <TableCell colSpan={5} className="h-96 text-center border-none">
                  <div className="flex flex-col items-center justify-center gap-6 py-12">
                    <div className="w-16 h-16 bg-muted/30 border border-border flex items-center justify-center text-muted-foreground/30">
                      <Building2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-foreground">Registry empty</p>
                      <p className="text-[10px] font-bold text-muted-foreground max-w-xs tracking-tight">No institutions found matching the current criteria.</p>
                    </div>
                    {!isFiltered ? (
                      <Button variant="outline" className="h-10 px-6 rounded-none text-[10px] font-black tracking-widest border-border shadow-sm" onClick={onAdd}>
                        Add institution
                      </Button>
                    ) : (
                      <Button variant="outline" className="h-10 px-6 rounded-none text-[10px] font-black tracking-widest border-border shadow-sm" onClick={onClearFilters}>Reset filters</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((inst) => (
                <TableRow 
                  key={inst.id} 
                  className="group border-border hover:bg-primary/[0.02] transition-colors cursor-pointer border-b last:border-0"
                >
                  <TableCell className="py-1.5 px-6">
                    <div className="flex items-center gap-5">
                      <div className="h-7 w-7 bg-muted/20 border border-border flex items-center justify-center text-muted-foreground font-black text-[9px] shrink-0 font-mono group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-all">
                        <Building2 size={14} />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-medium text-base tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                          {inst.name}
                        </span>
                        <code className="text-xs font-normal text-muted-foreground/40 mt-0.5 tracking-tight">Verified record</code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-6">
                    <div className="flex items-center gap-2">
                       <Fingerprint size={12} className="text-primary opacity-30" />
                        <code className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 border border-primary/10 font-mono">
                         {inst.code}
                       </code>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6 text-xs font-medium text-muted-foreground/70 tracking-widest">
                    {inst.typeName || inst.type}
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    {inst.isActive ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-700 tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-700 tracking-widest">
                         Disabled
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-10 py-1.5">
                    <div className="flex items-center justify-end gap-1 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); onEdit(inst); }}
                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all"
                      >
                        <Pencil size={14} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-none border border-transparent hover:border-border transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-none border-border shadow-2xl p-2">
                          <DropdownMenuLabel className="px-4 py-3 border-b border-border mb-2 text-[9px] font-black tracking-widest text-muted-foreground/50">Registry control</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => onToggleStatus(inst)}
                            className={cn(
                              "flex items-center gap-4 px-4 py-3 cursor-pointer rounded-none text-[10px] font-bold tracking-widest focus:bg-primary/5 transition-all",
                              inst.isActive ? "text-amber-600 focus:text-amber-700 focus:bg-amber-50" : "text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                            )}
                          >
                            <Power size={14} /> 
                            {inst.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(inst)}
                            className="flex items-center gap-4 px-4 py-3 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive rounded-none text-[10px] font-bold tracking-widest transition-all"
                          >
                            <Trash size={14} />
                            Delete record
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
      
      <div className="px-6 py-1 border-t border-border bg-muted/5 rounded-none">
        <Pagination 
          page={currentPage} 
          totalPages={totalPages} 
          setPage={onPageChange} 
          limit={itemsPerPage} 
          setLimit={onItemsPerPageChange} 
          totalCount={totalCount} 
          itemName="institutions" 
          isFetching={isFetching} 
        />
      </div>
    </div>
  )
}
