import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listDegreeTitles, createDegreeTitle, updateDegreeTitle, listDegreeLevels } from "../../api/degrees.api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../../components/ui/dialog"
import { Plus, Edit2, CheckCircle2, Search, Filter } from "lucide-react"
import { toast } from "sonner"
import useDebounce from "../../hooks/useDebounce"

export default function DegreeTitlesTable() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const debouncedSearch = useDebounce(searchTerm, 500)

  const [formData, setFormData] = useState({
    degreeLevelId: "",
    code: "",
    title: "",
    isActive: true
  })

  // Queries
  const { data: titlesData, isLoading } = useQuery({
    queryKey: ["degree-titles", debouncedSearch, levelFilter],
    queryFn: () => listDegreeTitles({ 
      search: debouncedSearch, 
      degreeLevelId: levelFilter !== 'all' ? levelFilter : undefined 
    })
  })

  const { data: levelsData } = useQuery({
    queryKey: ["degree-levels"],
    queryFn: listDegreeLevels
  })

  const titles = titlesData?.data?.degreeTitles || []
  const levels = levelsData?.data?.degreeLevels || []

  const mutation = useMutation({
    mutationFn: (data) => editingTitle ? updateDegreeTitle(editingTitle.id, data) : createDegreeTitle(data),
    onSuccess: (res) => {
      toast.success(res.message || `Title ${editingTitle ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ["degree-titles"] })
      closeModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save degree title")
    }
  })

  const openModal = (title = null) => {
    if (title) {
      setEditingTitle(title)
      setFormData({
        degreeLevelId: title.degreeLevelId.toString(),
        code: title.code,
        title: title.title,
        isActive: title.isActive
      })
    } else {
      setEditingTitle(null)
      setFormData({ degreeLevelId: "", code: "", title: "", isActive: true })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTitle(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      ...formData,
      degreeLevelId: parseInt(formData.degreeLevelId, 10)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Degree Titles</h3>
          <p className="text-xs text-muted-foreground">Manage specific academic qualifications (e.g., BSc Computer Science).</p>
        </div>
        <Button onClick={() => openModal()} className="rounded-xl gap-2 shadow-sm shrink-0">
          <Plus size={16} /> Add Title
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-card border border-border/60 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input 
            placeholder="Search titles or codes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-10 rounded-xl bg-muted/20 border-none focus-visible:ring-primary/20 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-muted-foreground" />
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-10 w-[160px] rounded-xl bg-muted/20 border-none focus:ring-primary/20 text-xs font-semibold">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map(l => (
                <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-muted/60">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-6">Level</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Code</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Qualification Title</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="text-right pr-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</TableHead>
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
            ) : titles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  No degree titles found.
                </TableCell>
              </TableRow>
            ) : (
              titles.map((t) => (
                <TableRow key={t.id} className="border-muted/40 hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6 font-bold text-xs">
                    <Badge variant="outline" className="rounded-md bg-muted/30 border-muted font-bold text-[9px] uppercase">
                      {t.levelName || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary font-semibold">{t.code}</TableCell>
                  <TableCell className="font-semibold text-sm">{t.title}</TableCell>
                  <TableCell>
                    <Badge variant={t.isActive ? "default" : "secondary"} className={`rounded-md text-[10px] uppercase font-bold px-2 ${t.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : ''}`}>
                      {t.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => openModal(t)}>
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
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="bg-primary/5 p-8 border-b border-primary/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {editingTitle ? "Edit Qualification" : "Add Qualification"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Define a specific academic title and link it to an educational level.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="level" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Educational Level</Label>
                <Select value={formData.degreeLevelId} onValueChange={(val) => setFormData({...formData, degreeLevelId: val})}>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/20 border-none focus:ring-primary/20 font-semibold">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {levels.map(l => (
                      <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Qualification Title</Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Computer Science & Engineering"
                  className="h-11 rounded-xl bg-muted/20 border-none focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Identification Code</Label>
                <Input 
                  id="code" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. CS-ENG"
                  className="h-11 rounded-xl bg-muted/20 border-none focus-visible:ring-primary/20 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-muted/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={formData.isActive ? "text-emerald-500" : "text-muted-foreground/30"} size={20} />
                  <div>
                    <p className="text-xs font-bold">Active Status</p>
                    <p className="text-[10px] text-muted-foreground">Available for student records.</p>
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
                {mutation.isPending ? "Saving..." : "Save Title"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
