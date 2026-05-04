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
import { Building2, Hash, Tag, CheckCircle2 } from "lucide-react"

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
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-primary/5 p-8 border-b border-primary/10">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-background rounded-2xl text-primary shadow-sm">
                  <Building2 size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {isEditing ? "Edit Institution" : "Add Institution"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {isEditing ? "Update institutional details." : 
                    "Register a new academic body."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Official Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="e.g. University of Science & Technology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl bg-muted/30 border-none pl-10 focus-visible:ring-primary/20"
                  required
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Identity Code</Label>
                <div className="relative">
                  <Input
                    id="code"
                    placeholder="e.g. UST-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="h-12 rounded-xl bg-muted/30 border-none pl-10 focus-visible:ring-primary/20"
                    required
                  />
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-muted-foreground/50" />
                      <SelectValue placeholder="Select type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {institutionTypes.map(t => (
                      <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-muted/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={formData.isActive ? "text-emerald-500" : "text-muted-foreground/30"} size={20} />
                <div>
                  <p className="text-sm font-semibold">Active Status</p>
                  <p className="text-xs text-muted-foreground">Enable or disable institutional access.</p>
                </div>
              </div>
              <Button
                type="button"
                variant={formData.isActive ? "default" : "outline"}
                size="sm"
                className={`rounded-lg h-8 px-4 font-bold text-[11px] uppercase tracking-wider transition-all ${formData.isActive ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : ''}`}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                {formData.isActive ? "Active" : "Inactive"}
              </Button>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex sm:justify-between items-center gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6 font-semibold">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all min-w-[140px]"
            >
              {mutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                isEditing ? "Update Institution" : "Create Institution"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
