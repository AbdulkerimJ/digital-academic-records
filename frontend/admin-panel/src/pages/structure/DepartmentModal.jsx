import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createDepartment, updateDepartment } from "../../api/institutions.api"
import { toast } from "sonner"
import { Loader2, BookOpen } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  isActive: z.boolean().default(true),
})

export default function DepartmentModal({ isOpen, onClose, department, institutionId, collegeId }) {
  const queryClient = useQueryClient()
  const isEditing = !!department

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        code: department.code,
        isActive: department.isActive,
      })
    } else {
      form.reset({
        name: "",
        code: "",
        isActive: true,
      })
    }
  }, [department, form, isOpen])

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return updateDepartment(institutionId, collegeId, department.id, data)
      }
      return createDepartment(institutionId, collegeId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", institutionId, collegeId] })
      toast.success(isEditing ? "Department updated." : "Department created.")
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Operation failed")
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-none p-0 overflow-hidden border border-border shadow-2xl">
        <div className="bg-muted/30 p-8 border-b border-border text-left space-y-4">
          <div className="w-12 h-12 bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <BookOpen size={24} />
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black tracking-tighter capitalize leading-none">
              {isEditing ? "Edit department" : "Add department"}
            </DialogTitle>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed mt-2">
              {isEditing ? "Update existing department details." : "Register a new department within the academic hierarchy."}
            </p>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-bold text-muted-foreground/80">Department name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineering" {...field} className="h-11 rounded-none bg-muted/10 border-border focus-visible:ring-primary/20 text-xs font-bold" />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-bold text-muted-foreground/80">Short code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SE" {...field} className="h-11 rounded-none bg-muted/10 border-border focus-visible:ring-primary/20 text-xs font-bold font-mono" />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between border border-border p-4 bg-muted/5">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-bold text-foreground">Active status</FormLabel>
                    <p className="text-[10px] text-muted-foreground font-medium">Allow students to be registered in this department.</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-none font-bold text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="rounded-none h-11 px-8 font-bold text-xs shadow-xl shadow-primary/20 transition-all">
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? "Save changes" : "Create department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
