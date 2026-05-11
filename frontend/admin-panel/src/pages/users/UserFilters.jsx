import { Search, ShieldAlert, Filter, GraduationCap, X } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"

export default function UserFilters({ 
  searchTerm, 
  setSearchTerm, 
  roleFilter, 
  setRoleFilter, 
  statusFilter, 
  setStatusFilter, 
  institutionFilter, 
  setInstitutionFilter, 
  roles, 
  institutions, 
  onClear 
}) {
  const isFiltered = searchTerm || roleFilter !== "all" || statusFilter !== "all" || institutionFilter !== "all"

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-muted/20 border border-border p-1.5">
      <div className="relative flex-grow lg:flex-[2]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Search by name or email..." 
          className="pl-10 h-9 bg-card border-border rounded-none focus-visible:ring-primary/20 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 flex-grow lg:flex-[3]">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-9 bg-card border-border rounded-none flex-grow md:w-40 text-xs font-bold text-muted-foreground group">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-muted-foreground" />
              <SelectValue placeholder="Role" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-none border-border shadow-2xl">
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.roleName}>{role.roleName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 bg-card border-border rounded-none flex-grow md:w-40 text-xs font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-none border-border shadow-2xl">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="REVOKED">Revoked</SelectItem>
          </SelectContent>
        </Select>

        <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
          <SelectTrigger className="h-9 bg-card border-border rounded-none flex-grow md:w-48 text-xs font-bold text-muted-foreground">
            <div className="flex items-center gap-2 text-left truncate">
              <GraduationCap size={16} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="Institution" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-none border-border shadow-2xl max-h-[300px]">
            <SelectItem value="all">All Institutions</SelectItem>
            {institutions.map(inst => (
              <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button 
            variant="ghost" 
            onClick={onClear}
            size="sm"
            className="h-9 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none border border-transparent hover:border-destructive/20 transition-all flex gap-2 shrink-0"
          >
            <X size={14} /> 
            <span className="text-xs font-medium">Clear</span>
          </Button>
        )}
      </div>
    </div>
  )
}
