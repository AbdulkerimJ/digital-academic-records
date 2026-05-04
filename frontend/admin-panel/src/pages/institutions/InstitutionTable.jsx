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
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        
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
              {institutions.length === 0 ? (
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
      </Card>

      {/* Pagination Bar */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Rows per page</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(val) => onItemsPerPageChange(parseInt(val, 10))}
              >
                <SelectTrigger className="h-8 w-16 bg-muted/30 border-none rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[5, 10, 20, 50].map(size => (
                    <SelectItem key={size} value={size.toString()} className="text-xs">{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground font-medium border-l border-muted pl-4">
              Showing <span className="text-foreground">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to <span className="text-foreground">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="text-foreground">{totalCount}</span> institutions
            </div>
          </div>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg border-muted bg-background hover:bg-muted disabled:opacity-30"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isFetching}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex items-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage
                if (totalPages <= 5) pageNum = i + 1
                else if (currentPage <= 3) pageNum = i + 1
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                else pageNum = currentPage - 2 + i

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="icon"
                    className={`h-8 w-8 rounded-lg text-xs font-semibold ${currentPage === pageNum ? "shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isFetching}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg border-muted bg-background hover:bg-muted disabled:opacity-30"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isFetching}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
