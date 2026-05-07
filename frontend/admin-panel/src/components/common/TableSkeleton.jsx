import { Skeleton } from "../ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table"

export function TableBodySkeleton({ rows = 5, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j} className="py-4">
              {j === 0 ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ) : (
                <Skeleton className="h-4 w-full max-w-[120px]" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="rounded-2xl border border-muted overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i} className="py-5">
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableBodySkeleton rows={rows} columns={columns} />
        </TableBody>
      </Table>
    </div>
  )
}
