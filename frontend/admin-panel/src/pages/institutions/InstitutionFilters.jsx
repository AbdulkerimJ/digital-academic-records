import { Search, Filter, X, Building2, Tag } from "lucide-react"
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
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-background p-3 rounded-2xl border border-muted shadow-sm">
      <div className="relative flex-grow lg:flex-[2]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Search by name or code..." 
          className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-primary/20 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 flex-grow lg:flex-[3]">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-11 bg-muted/30 border-none rounded-xl flex-grow md:w-48">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-muted-foreground" />
              <SelectValue placeholder="Institution Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl">
            <SelectItem value="all">All Types</SelectItem>
            {institutionTypes.map(type => (
              <SelectItem key={type.code} value={type.code}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 bg-muted/30 border-none rounded-xl flex-grow md:w-40">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button 
            variant="ghost" 
            onClick={onClear}
            size="sm"
            className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1.5 transition-all animate-in fade-in slide-in-from-right-2 shrink-0"
          >
            <X size={14} /> 
            <span className="text-xs font-medium">Clear</span>
          </Button>
        )}
      </div>
    </div>
  )
}
