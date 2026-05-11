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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 border-b border-border p-1.5 gap-4">
        <div className="pl-2">
          <h3 className="text-sm font-bold tracking-tight">Degree Titles</h3>
          <p className="text-[10px] text-muted-foreground font-medium">Manage specific academic qualifications (e.g., BSc Computer Science).</p>
        </div>
        <Button onClick={() => openModal()} className="rounded-none h-9 gap-2 shadow-sm shrink-0 font-bold text-xs">
          <Plus size={14} /> Add Title
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-muted/20 border-b border-border p-1.5 relative overflow-hidden">
        <div className="relative flex-1 md:max-w-md group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search titles or codes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-10 rounded-none bg-card border-border focus-visible:ring-primary/20 text-xs font-bold"
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={12} className="text-muted-foreground/50" />
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-9 w-[160px] rounded-none bg-card border-border focus:ring-primary/20 text-xs font-bold">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="rounded-none shadow-xl border-border">
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map(l => (
                <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-none border-border overflow-hidden shadow-sm p-0">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <TableHead className="text-[13px] font-bold capitalize tracking-widest text-muted-foreground pl-6 py-2 border-r border-border/50">Level</TableHead>
              <TableHead className="text-[13px] font-bold capitalize tracking-widest text-muted-foreground py-2 border-r border-border/50">Code</TableHead>
              <TableHead className="text-[13px] font-bold capitalize tracking-widest text-muted-foreground py-2 border-r border-border/50">Qualification Title</TableHead>
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
            ) : titles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  No degree titles found.
                </TableCell>
              </TableRow>
            ) : (
              titles.map((t) => (
                <TableRow key={t.id} className="border-border hover:bg-muted/5 transition-colors group">
                  <TableCell className="py-1.5 pl-6">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted/20 border border-border text-[10px] font-bold text-muted-foreground tracking-tight uppercase">
                      {t.levelName || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 font-mono text-xs text-primary font-medium">{t.code}</TableCell>
                  <TableCell className="py-1.5 font-medium text-base tracking-tight">{t.title}</TableCell>
                  <TableCell className="py-1.5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-semibold tracking-widest ${t.isActive ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-muted/20 text-muted-foreground border-border'}`}>
                      {t.isActive ? "Active" : "Disabled"}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 text-right pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20" onClick={() => openModal(t)}>
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
        <DialogContent className="sm:max-w-[450px] rounded-none border border-border shadow-2xl p-0 overflow-hidden bg-card">
          <form onSubmit={handleSubmit}>
            <div className="bg-muted/30 p-8 border-b border-border text-left space-y-4">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-black tracking-tighter capitalize leading-none">
                  {editingTitle ? "Edit Title" : "Add Title"}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed mt-2">
                  Define a specific academic title and link it to an educational level.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="level" className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground ml-1">Educational Level</Label>
                <Select value={formData.degreeLevelId} onValueChange={(val) => setFormData({...formData, degreeLevelId: val})}>
                  <SelectTrigger className="h-11 rounded-none bg-muted/10 border border-border focus:ring-primary/20 font-bold text-xs">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none shadow-xl border-border">
                    {levels.map(l => (
                      <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground ml-1">Qualification Title</Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Computer Science & Engineering"
                  className="h-11 rounded-none bg-muted/10 border border-border focus-visible:ring-primary/20 text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground ml-1">Identification Code</Label>
                <Input 
                  id="code" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. CS-ENG"
                  className="h-11 rounded-none bg-muted/10 border border-border focus-visible:ring-primary/20 font-mono text-xs font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-none border border-border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={formData.isActive ? "text-primary" : "text-muted-foreground/30"} size={20} />
                  <div>
                    <p className="text-xs font-bold text-foreground">Active Status</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Available for student records.</p>
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
                {mutation.isPending ? "Saving..." : "Save Title"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
