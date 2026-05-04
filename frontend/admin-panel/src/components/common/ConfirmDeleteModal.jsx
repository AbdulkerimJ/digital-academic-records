import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../ui/dialog"
import { Button } from "../ui/button"
import { AlertTriangle } from "lucide-react"

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  title = "Confirm Deletion", 
  description,
  itemName
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-destructive/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-xl">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle size={20} />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="pt-3 text-base">
            {description ? description : (
              <>
                Are you sure you want to permanently delete <span className="font-bold text-foreground">"{itemName}"</span>? 
                <br/><br/>
                This action cannot be reversed.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-6 sm:justify-between">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto shadow-md"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
