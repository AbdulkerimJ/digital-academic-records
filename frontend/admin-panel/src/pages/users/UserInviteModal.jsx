import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listRoles, createUser } from "../../api/users.api"
import { listInstitutions } from "../../api/institutions.api"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
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
import { toast } from "sonner"

export default function UserInviteModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    trigger,
    formState: { errors } 
  } = useForm()

  // Register custom select fields with validation
  useEffect(() => {
    register("roleId", { required: "Please select a role" })
    register("institutionId")
  }, [register])

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles
  })

  const { data: institutionsData } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => listInstitutions()
  })

  const roles = (rolesData?.data?.roles || []).filter(r => r.roleName !== "SUPER_ADMIN")
  const institutions = institutionsData?.data?.institutions || []

  // Check if selected role is REGISTRAR to make institution mandatory
  const selectedRoleId = watch("roleId")
  const selectedRole = roles.find(r => r.id.toString() === selectedRoleId)
  const isRegistrar = selectedRole?.roleName === "REGISTRAR"

  const inviteMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      if (data.data?.emailSent) {
        toast.success(data.message || "Invitation sent successfully")
      } else {
        toast.warning("User created, but the invitation email failed to send. You can resend it later from the user list.")
      }
      queryClient.invalidateQueries({ queryKey: ["users"] })
      reset()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send invitation")
    }
  })

  const onSubmit = (data) => {
    if (isRegistrar && !data.institutionId) {
      toast.error("Registrars must be assigned to an institution")
      return
    }
    inviteMutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="John"
                {...register("firstName", { 
                  required: "First name is too short",
                  minLength: { value: 2, message: "First name is too short" }
                })} 
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe"
                {...register("lastName", { 
                  required: "Last name is too short",
                  minLength: { value: 2, message: "Last name is too short" }
                })} 
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="john.doe@example.com"
              {...register("email", { 
                required: "Invalid email address",
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                  message: "Invalid email address" 
                }
              })} 
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => {
              setValue("roleId", value, { shouldValidate: true })
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-xs text-destructive">{errors.roleId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">
              Affiliated Institution {isRegistrar && <span className="text-destructive">*</span>}
            </Label>
            <Select onValueChange={(value) => setValue("institutionId", value === "null" ? undefined : value)}>
              <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none">
                <SelectValue placeholder="Select an institution" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id.toString()}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground ml-1">
              Users must be assigned to an institution.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
