import { 
  MoreHorizontal, 
  Pencil, 
  Building2, 
  SearchX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Hash
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
  onAdd,
  onClearFilters 
}) {
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  
  const getStatusBadge = (isActive) => {
    const badgeClass = "w-24 justify-center shadow-sm text-[10px] uppercase tracking-wider font-bold"
    return isActive ? (
      <Badge className={`bg-emerald-500 hover:bg-emerald-600 text-white border-none ${badgeClass}`}>Active</Badge>
    ) : (
      <Badge variant="secondary" className={`bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent ${badgeClass}`}>Inactive</Badge>
    )
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
                <SortHeader field="name" label="Institution Name" />
                <SortHeader field="code" label="Identity Code" className="pl-0" />
                <SortHeader field="type" label="Category" className="pl-0" />
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-right pr-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isFetching && institutions.length === 0) ? (
                <TableBodySkeleton rows={itemsPerPage} columns={5} />
              ) : institutions.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-72 text-center border-none">
                    <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                      <div className="p-4 bg-muted/30 rounded-full mb-4">
                        <SearchX size={48} className="text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {isFiltered ? "No matching institutions found" : "No institutions found"}
                      </p>
                      <p className="text-sm max-w-sm mt-1 mb-6">
                        {isFiltered
                          ? "Try adjusting your search terms or filters."
                          : "There are currently no institutions registered. Start by adding a new university or board."}
                      </p>
                      {!isFiltered ? (
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={onAdd}>
                          <Building2 size={16} /> Add your first institution
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={onClearFilters}>Clear all filters</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                institutions.map((inst) => (
                  <TableRow key={inst.id} className="group transition-colors hover:bg-muted/40 cursor-default border-muted/60">
                    <TableCell className="py-4 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/10 shadow-sm shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div className="flex flex-col min-w-0 text-left">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[300px]">
                            {inst.name}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">Established Entity</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-sm text-muted-foreground">
                        <Hash size={14} className="text-muted-foreground/50" />
                        {inst.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted w-32 justify-center px-2 py-0.5 rounded-md font-medium text-[10px] uppercase tracking-wider">
                        {inst.typeName || inst.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(inst.isActive)}</TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-muted/60">
                          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 px-3 py-2">Management</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => onEdit(inst)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil size={14} className="text-muted-foreground" /> Edit Details
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
          itemName="institutions" 
          isFetching={isFetching} 
        />
      </Card>
    </div>
  )
}
