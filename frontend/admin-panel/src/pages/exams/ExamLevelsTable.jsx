import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listExamLevels, createExamLevel, updateExamLevel } from "../../api/exams.api"
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
import { Plus, Edit2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function ExamLevelsTable() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState(null)
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    isActive: true
  })

  const { data: levelsData, isLoading } = useQuery({
    queryKey: ["exam-levels"],
    queryFn: listExamLevels
  })

  const levels = levelsData?.data?.examLevels || []

  const mutation = useMutation({
    mutationFn: (data) => editingLevel ? updateExamLevel(editingLevel.id, data) : createExamLevel(data),
    onSuccess: (res) => {
      toast.success(res.message || `Level ${editingLevel ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ["exam-levels"] })
      closeModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save exam level")
    }
  })

  const openModal = (level = null) => {
    if (level) {
      setEditingLevel(level)
      setFormData({
        code: level.code,
        name: level.name,
        isActive: level.isActive
      })
    } else {
      setEditingLevel(null)
      setFormData({ code: "", name: "", isActive: true })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLevel(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Exam Levels</h3>
          <p className="text-xs text-muted-foreground">Manage examination categories (e.g., Primary, Secondary, University Entrance).</p>
        </div>
        <Button onClick={() => openModal()} className="rounded-xl gap-2 shadow-sm">
          <Plus size={16} /> Add Level
        </Button>
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-muted/60">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-6">Code</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="text-right pr-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(4)].map((_, j) => (
                    <TableCell key={j}><div className="h-5 w-full animate-pulse bg-muted rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : levels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                  No exam levels found.
                </TableCell>
              </TableRow>
            ) : (
              levels.map((level) => (
                <TableRow key={level.id} className="border-muted/40 hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6 font-mono text-xs font-semibold text-primary">{level.code}</TableCell>
                  <TableCell className="font-semibold">{level.name}</TableCell>
                  <TableCell>
                    <Badge variant={level.isActive ? "default" : "secondary"} className={`rounded-md text-[10px] uppercase font-bold px-2 ${level.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : ''}`}>
                      {level.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => openModal(level)}>
                      <Edit2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="bg-primary/5 p-8 border-b border-primary/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {editingLevel ? "Edit Exam Level" : "Add Exam Level"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Define a new category for examination records.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Identification Code</Label>
                <Input 
                  id="code" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. SEC-L1"
                  className="h-11 rounded-xl bg-muted/20 border-none focus-visible:ring-primary/20 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Secondary Education Level"
                  className="h-11 rounded-xl bg-muted/20 border-none focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-muted/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={formData.isActive ? "text-emerald-500" : "text-muted-foreground/30"} size={20} />
                  <div>
                    <p className="text-xs font-bold">Active Status</p>
                    <p className="text-[10px] text-muted-foreground">Allow registrars to issue records for this level.</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={formData.isActive ? "default" : "outline"}
                  size="sm"
                  className={`rounded-lg h-7 px-3 font-bold text-[10px] uppercase tracking-wider ${formData.isActive ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : ''}`}
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  {formData.isActive ? "Active" : "Disabled"}
                </Button>
              </div>
            </div>

            <DialogFooter className="p-8 pt-0 gap-3">
              <Button type="button" variant="ghost" onClick={closeModal} className="rounded-xl font-semibold">Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                {mutation.isPending ? "Saving..." : "Save Level"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
