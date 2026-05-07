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
import { createCollege, updateCollege } from "../../api/institutions.api"
import { toast } from "sonner"
import { Loader2, GraduationCap } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  isActive: z.boolean().default(true),
})

export default function CollegeModal({ isOpen, onClose, institutionId, college }) {
  const queryClient = useQueryClient()
  const isEditing = !!college

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (college) {
      form.reset({
        name: college.name,
        code: college.code,
        isActive: college.isActive,
      })
    } else {
      form.reset({
        name: "",
        code: "",
        isActive: true,
      })
    }
  }, [college, form, isOpen])

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return updateCollege(institutionId, college.id, data)
      }
      return createCollege(institutionId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges", institutionId] })
      toast.success(isEditing ? "College updated" : "College created")
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong")
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-6 border-b border-primary/10">
          <div className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg mb-3">
            <GraduationCap size={24} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-center">
              {isEditing ? "Edit College" : "Add New College"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">College Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. College of Natural Sciences" {...field} className="rounded-xl h-11" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Short Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CNS" {...field} className="rounded-xl h-11 uppercase" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4 bg-muted/20 border-border/40">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-black uppercase tracking-tight">Active Status</FormLabel>
                    <p className="text-[10px] text-muted-foreground font-medium">Allow degrees to be issued from this college</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="rounded-xl font-black px-8">
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? "Save Changes" : "Create College"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
