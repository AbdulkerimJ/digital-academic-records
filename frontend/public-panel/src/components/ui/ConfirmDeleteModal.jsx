import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from './Modal'
import Spinner from './Spinner'

export default function ConfirmDeleteModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Revoke Access", 
  description = "Are you sure you want to revoke this access token? This action cannot be undone.",
  isLoading = false 
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-5 bg-destructive/5 border border-border rounded-none text-destructive">
          <div className="w-10 h-10 bg-destructive flex items-center justify-center shrink-0 shadow-xl shadow-destructive/10 text-white">
            <AlertTriangle size={20} />
          </div>
          <p className="text-[11px] font-bold leading-relaxed capitalize tracking-tight">
            {description}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-14 border border-border text-muted-foreground font-black text-[10px] capitalize tracking-[0.3em] hover:bg-muted transition-all disabled:opacity-50 rounded-none"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-14 bg-destructive text-white font-black text-[10px] capitalize tracking-[0.3em] hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50 rounded-none shadow-lg shadow-destructive/20"
          >
            {isLoading ? <Spinner size="sm" /> : <><Trash2 size={16} /> Revoke</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}
