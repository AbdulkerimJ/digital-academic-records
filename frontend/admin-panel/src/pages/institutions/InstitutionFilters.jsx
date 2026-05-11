import { Search, Filter, X, Building2, Tag, Activity } from "lucide-react"
import { Input } from "../../components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"
import { Button } from "../../components/ui/button"

export default function InstitutionFilters({ 
  searchTerm, 
  setSearchTerm, 
  typeFilter, 
  setTypeFilter, 
  statusFilter, 
  setStatusFilter,
  onClear,
  institutionTypes = []
}) {
  const isFiltered = searchTerm || typeFilter !== "all" || statusFilter !== "all"

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-muted/20 border border-border p-1.5">
      
      {/* Search Input */}
      <div className="relative flex-grow lg:flex-[2] group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={14} />
        <Input 
          placeholder="Search by name or ID..." 
          className="pl-10 h-9 bg-card border-border rounded-none focus-visible:ring-primary/20 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 flex-grow lg:flex-[3]">
        {/* Type Select */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 bg-card border-border rounded-none flex-grow md:w-48 text-xs font-bold text-muted-foreground group">
            <div className="flex items-center gap-2">
              <Building2 size={12} className="text-primary/60" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-none border-border shadow-2xl">
            <SelectItem value="all" className="text-xs font-bold">All categories</SelectItem>
            {institutionTypes.map(type => (
              <SelectItem key={type.code} value={type.code} className="text-xs font-bold">
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 bg-card border-border rounded-none flex-grow md:w-40 text-xs font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-primary/60" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-none border-border shadow-2xl">
            <SelectItem value="all" className="text-xs font-bold">All statuses</SelectItem>
            <SelectItem value="ACTIVE" className="text-xs font-bold text-emerald-600">Active</SelectItem>
            <SelectItem value="INACTIVE" className="text-xs font-bold text-amber-600">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button 
            variant="ghost" 
            onClick={onClear}
            size="sm"
            className="h-9 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none border border-transparent hover:border-destructive/20 transition-all flex gap-2"
          >
            <X size={12} /> 
            <span className="text-[10px] font-bold">Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  )
}
