import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../ui/dialog"
import { Button } from "../ui/button"
import { AlertTriangle, ShieldAlert } from "lucide-react"

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  title = "Revoke Entry Protocol", 
  description,
  itemName
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-none border border-border bg-card p-0 overflow-hidden shadow-2xl">
        {/* Technical Warning Header */}
        <div className="bg-destructive/5 py-6 px-8 border-b border-border text-left space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
            <ShieldAlert size={120} />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 bg-destructive flex items-center justify-center text-white shadow-xl shadow-destructive/20">
              <AlertTriangle size={24} />
            </div>
            <div className="px-3 py-1 bg-destructive/10 border border-destructive/20 text-[9px] font-black text-destructive uppercase tracking-widest">
              Critical Action
            </div>
          </div>
          
          <DialogHeader className="text-left relative z-10">
            <DialogTitle className="text-2xl font-black tracking-tighter capitalize leading-none text-destructive">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed mt-1 tracking-tight">
              {description ? description : (
                <>
                  Confirm permanent removal of <span className="text-foreground">"{itemName}"</span> from the registry.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="p-8 flex sm:justify-between items-center gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            className="rounded-none h-14 px-8 font-black text-[10px] capitalize tracking-widest text-muted-foreground/60 hover:text-foreground"
          >
            Abort Operation
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-none h-14 px-12 font-black text-[10px] capitalize tracking-widest shadow-2xl shadow-destructive/20 transition-all min-w-[200px]"
          >
            {isDeleting ? "Processing..." : "Confirm Deletion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
