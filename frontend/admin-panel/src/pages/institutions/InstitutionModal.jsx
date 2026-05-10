import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createInstitution, updateInstitution } from "../../api/institutions.api"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"
import { Building2, Tag, CheckCircle2, Fingerprint, Activity } from "lucide-react"
import { cn } from "../../lib/utils"

export default function InstitutionModal({ isOpen, onClose, institution = null, institutionTypes = [] }) {
  const isEditing = !!institution
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    isActive: true
  })

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name,
        code: institution.code,
        type: institution.type,
        isActive: institution.isActive
      })
    } else {
      setFormData({
        name: "",
        code: "",
        type: "",
        isActive: true
      })
    }
  }, [institution, isOpen])

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? updateInstitution(institution.id, data) : createInstitution(data),
    onSuccess: (res) => {
      toast.success(res.message || `Institution ${isEditing ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ["institutions"] })
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Operation failed")
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-none border border-border bg-card shadow-2xl p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="bg-muted/30 py-4 px-8 border-b border-border text-left space-y-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 transition-all">
              <Building2 size={20} />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-black tracking-tighter capitalize leading-none">
                {isEditing ? "Registry entry" : "New institution"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed mt-2">
                {isEditing ? "Update existing institutional identity and access parameters." : 
                "Establish a new administrative record for an academic body."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Institution name</Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="e.g. UNIVERSITY OF ADDIS ABABA"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-14 rounded-none bg-muted/10 border border-border pl-12 focus-visible:ring-primary/20 text-sm font-black tracking-tight capitalize"
                  required
                />
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="code" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Institution code</Label>
                <div className="relative">
                  <Input
                    id="code"
                    placeholder="INST-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="h-14 rounded-none bg-muted/10 border border-border pl-12 focus-visible:ring-primary/20 font-mono text-sm font-black tracking-tight"
                    required
                  />
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="type" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Category</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger className="h-14 rounded-none bg-muted/10 border border-border focus:ring-primary/20 px-4">
                    <div className="flex items-center gap-3">
                      <Tag size={16} className="text-muted-foreground/40" />
                      <SelectValue placeholder="Select type" className="text-xs font-bold capitalize" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-none border border-border shadow-2xl p-1">
                    {institutionTypes.map(t => (
                      <SelectItem key={t.code} value={t.code} className="rounded-none text-xs font-bold capitalize p-3 focus:bg-primary/10 transition-colors tracking-tight">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-primary/[0.03] border-l-2 border-primary">
              <div className="flex items-center gap-4">
                <Activity className={cn("transition-all", formData.isActive ? "text-primary" : "text-muted-foreground/30")} size={24} />
                <div>
                  <p className="text-[10px] font-black capitalize tracking-widest text-foreground leading-none">Record status</p>
                  <p className="text-[9px] font-bold text-muted-foreground capitalize tracking-tight mt-1">Institutional access control</p>
                </div>
              </div>
              <Button
                type="button"
                variant={formData.isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-none h-10 px-6 font-black text-[10px] capitalize tracking-widest transition-all",
                  formData.isActive ? 'bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 border-none' : 'border-border'
                )}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                {formData.isActive ? "Active" : "Disabled"}
              </Button>
            </div>
          </div>

          <DialogFooter className="p-10 pt-0 flex sm:justify-between items-center gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-none h-14 px-8 font-black text-[10px] capitalize tracking-widest text-muted-foreground/60 hover:text-foreground">
              Abort
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="rounded-none h-14 px-12 font-black text-[10px] capitalize tracking-widest shadow-2xl shadow-primary/20 transition-all min-w-[180px]"
            >
              {mutation.isPending ? "Processing..." : (isEditing ? "Save changes" : "Create record")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
