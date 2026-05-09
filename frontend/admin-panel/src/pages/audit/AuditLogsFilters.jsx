import { Search, X, Filter } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const ENTITY_TYPES = [
  "USER", "STUDENT", "INSTITUTION", "COLLEGE", "DEPARTMENT", "DEGREE", "DEGREE_LEVEL", "DEGREE_TITLE", "EXAM", "EXAM_LEVEL", "CORRECTION_REQUEST"
]

const ACTIONS = [
  "LOGIN_SUCCESS", "LOGOUT", "ACCOUNT_ACTIVATED", "PASSWORD_CHANGED",
  "CREATE_INSTITUTION", "UPDATE_INSTITUTION", "DELETE_INSTITUTION", "RESTORE_INSTITUTION",
  "CREATE_COLLEGE", "UPDATE_COLLEGE", "DELETE_COLLEGE", "RESTORE_COLLEGE",
  "CREATE_DEPARTMENT", "UPDATE_DEPARTMENT", "DELETE_DEPARTMENT", "RESTORE_DEPARTMENT",
  "INVITE_USER", "UPDATE_USER", "DELETE_USER", "RESTORE_USER", "SUSPEND_USER", "UNSUSPEND_USER",
  "REGISTER_STUDENT", "DELETE_STUDENT", "RESTORE_STUDENT", "BULK_REGISTER_STUDENTS",
  "ISSUE_DEGREE", "UPDATE_DEGREE", "DELETE_DEGREE", "BULK_ISSUE_DEGREES",
  "CREATE_EXAM_LEVEL", "UPDATE_EXAM_LEVEL", "ISSUE_EXAM", "UPDATE_EXAM", "DELETE_EXAM", "BULK_ISSUE_EXAMS",
  "SUBMIT_CORRECTION", "APPROVE_CORRECTION", "REJECT_CORRECTION"
]

export default function AuditLogsFilters({
  actionFilter,
  setActionFilter,
  entityFilter,
  setEntityFilter,
  onClear
}) {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground mr-2">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Action Filter */}
        <div className="w-full md:w-64">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-10 bg-background/50 border-primary/10">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {ACTIONS.map(action => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Entity Filter */}
        <div className="w-full md:w-56">
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="h-10 bg-background/50 border-primary/10">
              <SelectValue placeholder="Filter by Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {ENTITY_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {(actionFilter !== "all" || entityFilter !== "all") && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground h-10 px-3 rounded-lg"
          >
            <X size={16} className="mr-2" />
            Clear
          </Button>
        )}
      </div>
    </Card>
  )
}
