import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listDegreeLevels, createDegreeLevel, updateDegreeLevel, deleteDegreeLevel } from "../../api/degrees.api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../../components/ui/dialog"
import { Plus, Edit2, CheckCircle2, XCircle, ArrowUpDown, Trash2 } from "lucide-react"
import { toast } from "sonner"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"

export default function DegreeLevelsTable() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [levelToDelete, setLevelToDelete] = useState(null)
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    rank: "",
    isActive: true
  })

  const { data: levelsData, isLoading } = useQuery({
    queryKey: ["degree-levels"],
    queryFn: listDegreeLevels
  })

  const levels = levelsData?.data?.degreeLevels || []

  const mutation = useMutation({
    mutationFn: (data) => editingLevel ? updateDegreeLevel(editingLevel.id, data) : createDegreeLevel(data),
    onSuccess: (res) => {
      toast.success(res.message || `Level ${editingLevel ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ["degree-levels"] })
      closeModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save degree level")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDegreeLevel(id),
    onSuccess: (res) => {
      toast.success(res.message || "Degree level deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["degree-levels"] })
      setIsDeleteModalOpen(false)
      setLevelToDelete(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete degree level")
    }
  })

  const openModal = (level = null) => {
    if (level) {
      setEditingLevel(level)
      setFormData({
        code: level.code,
        name: level.name,
        rank: level.rank.toString(),
        isActive: level.isActive
      })
    } else {
      setEditingLevel(null)
      setFormData({ code: "", name: "", rank: "", isActive: true })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLevel(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      ...formData,
      rank: parseInt(formData.rank, 10)
    })
  }

  const handleDeleteClick = (level) => {
    setLevelToDelete(level)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (levelToDelete) {
      deleteMutation.mutate(levelToDelete.id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/20 border-b border-border p-1.5">
        <div className="pl-2">
          <h3 className="text-sm font-bold tracking-tight">Degree Levels</h3>
          <p className="text-[10px] text-muted-foreground font-medium">Manage educational levels (e.g., Bachelor, Master, PhD).</p>
        </div>
        <Button onClick={() => openModal()} className="rounded-none h-9 gap-2 shadow-sm font-bold text-xs">
          <Plus size={14} /> Add Level
        </Button>
      </div>

      <Card className="rounded-none border-border overflow-hidden shadow-sm p-0">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <TableHead className="w-20 text-[13px] font-bold capitalize tracking-widest text-muted-foreground pl-6 py-2 border-r border-border/50">Rank</TableHead>
              <TableHead className="text-[13px] font-bold capitalize tracking-widest text-muted-foreground py-2 border-r border-border/50">Code</TableHead>
              <TableHead className="text-[13px] font-bold capitalize tracking-widest text-muted-foreground py-2 border-r border-border/50">Level Name</TableHead>
              <TableHead className="text-[13px] font-bold capitalize tracking-widest text-muted-foreground py-2 border-r border-border/50">Status</TableHead>
              <TableHead className="text-right pr-6 text-[13px] font-bold capitalize tracking-widest text-muted-foreground py-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}><div className="h-5 w-full animate-pulse bg-muted rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : levels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  No degree levels found.
                </TableCell>
              </TableRow>
            ) : (
              levels.sort((a, b) => a.rank - b.rank).map((level) => (
                <TableRow key={level.id} className="border-border hover:bg-muted/5 transition-colors group">
                  <TableCell className="py-1.5 pl-6 font-bold text-primary/80">{level.rank}</TableCell>
                  <TableCell className="py-1.5 font-mono text-xs font-medium">{level.code}</TableCell>
                  <TableCell className="py-1.5 font-medium">{level.name}</TableCell>
                  <TableCell className="py-1.5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-semibold tracking-widest ${level.isActive ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-muted/20 text-muted-foreground border-border'}`}>
                      {level.isActive ? "Active" : "Disabled"}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20" onClick={() => openModal(level)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all border border-transparent hover:border-destructive/20" onClick={() => handleDeleteClick(level)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border border-border shadow-2xl p-0 overflow-hidden bg-card">
          <form onSubmit={handleSubmit}>
            <div className="bg-muted/30 p-8 border-b border-border text-left space-y-4">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-black tracking-tighter capitalize leading-none">
                  {editingLevel ? "Edit Level" : "Add Level"}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed">
                  Define a new educational level for the platform registry.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-1.5">
                  <Label htmlFor="rank" className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground ml-1">Rank</Label>
                    <Input 
                    id="rank" 
                    type="number"
                    value={formData.rank}
                    onChange={(e) => setFormData({...formData, rank: e.target.value})}
                    placeholder="1"
                    className="h-11 rounded-none bg-muted/10 border border-border focus-visible:ring-primary/20"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="code" className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground ml-1">Code</Label>
                  <Input 
                    id="code" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="BSC"
                    className="h-11 rounded-none bg-muted/10 border border-border focus-visible:ring-primary/20 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground ml-1">Display Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Bachelor of Science"
                  className="h-11 rounded-none bg-muted/10 border border-border focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-none border border-border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={formData.isActive ? "text-primary" : "text-muted-foreground/30"} size={20} />
                  <div>
                    <p className="text-xs font-bold text-foreground">Active Status</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Available for use in records.</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={formData.isActive ? "default" : "outline"}
                  size="sm"
                  className={`rounded-none h-7 px-3 font-bold text-[10px] capitalize tracking-wider ${formData.isActive ? 'bg-primary hover:brightness-110 shadow-lg shadow-primary/20' : ''}`}
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  {formData.isActive ? "Active" : "Disabled"}
                </Button>
              </div>
            </div>

            <DialogFooter className="p-8 pt-0 gap-3">
              <Button type="button" variant="ghost" onClick={closeModal} className="rounded-none font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} className="rounded-none h-11 px-8 font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:brightness-110">
                {mutation.isPending ? "Saving..." : "Save Level"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteMutation.isPending}
          itemName={levelToDelete?.name}
          title="Delete Degree Level"
          description="Are you sure you want to delete this degree level? This action will be logged and can be undone later if needed."
        />
      )}
    </div>
  )
}
