import { Button } from "../ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export default function Pagination({ 
  page, 
  totalPages, 
  setPage, 
  limit, 
  setLimit, 
  totalCount, 
  itemName = "items",
  isFetching = false
}) {
  const isComplex = limit !== undefined && totalCount !== undefined;

  if (!isComplex) {
    return (
      <div className="bg-muted/20 px-8 py-5 flex items-center justify-between border-t border-border/40">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Page {page} of {totalPages || 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={page === 1 || isFetching}
            onClick={() => setPage(page - 1)}
            className="h-10 w-10 rounded-xl border-border/60 hover:bg-background"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            disabled={page === totalPages || totalPages === 0 || isFetching}
            onClick={() => setPage(page + 1)}
            className="h-10 w-10 rounded-xl border-border/60 hover:bg-background"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/5 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
      <div className="flex items-center gap-4 order-2 sm:order-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-bold lowercase tracking-tight">Show</span>
          <Select 
            value={limit.toString()} 
            onValueChange={(val) => setLimit && setLimit(parseInt(val, 10))}
          >
            <SelectTrigger className="h-8 w-16 bg-muted/30 border-none rounded-lg text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl border-border/60">
              {[5, 10, 20, 50].map(size => (
                <SelectItem key={size} value={size.toString()} className="text-xs font-medium">{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-muted-foreground font-bold lowercase tracking-tight border-l border-muted/40 pl-4">
          showing <span className="text-foreground">{Math.min((page - 1) * limit + 1, totalCount)}</span> to <span className="text-foreground">{Math.min(page * limit, totalCount)}</span> of <span className="text-foreground">{totalCount}</span> {itemName}
        </div>
      </div>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-lg border-muted/60 bg-background hover:bg-muted disabled:opacity-30"
          onClick={() => setPage(page - 1)}
          disabled={page === 1 || isFetching}
        >
          <ChevronLeft size={16} />
        </Button>
        
        <div className="flex items-center">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = page
            if (totalPages <= 5) pageNum = i + 1
            else if (page <= 3) pageNum = i + 1
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
            else pageNum = page - 2 + i

            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 rounded-lg text-xs font-bold ${page === pageNum ? "shadow-md bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                onClick={() => setPage(pageNum)}
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
          className="h-8 w-8 rounded-lg border-muted/60 bg-background hover:bg-muted disabled:opacity-30"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || totalPages === 0 || isFetching}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
