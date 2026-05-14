import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listRoles, updateUser } from "../../api/users.api"
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

export default function EditUserModal({ isOpen, onClose, user }) {
  const queryClient = useQueryClient()
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    formState: { errors } 
  } = useForm()

  useEffect(() => {
    register("roleId", { required: "Please select a role" })
    register("institutionId")
  }, [register])

  useEffect(() => {
    if (user && isOpen) {
      // Setup the form with user's existing data
      setValue("firstName", user.firstName)
      setValue("lastName", user.lastName)
      setValue("email", user.email)
      setValue("roleId", user.roleId?.toString())
      setValue("institutionId", user.institutionId ? user.institutionId.toString() : "null")
    }
  }, [user, isOpen, setValue])

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

  const editMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      toast.success(data.message || "User updated successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user")
    }
  })

  const onSubmit = (data) => {
    if (!data.institutionId || data.institutionId === "null") {
      toast.error("Users must be assigned to an institution")
      return
    }

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      roleId: parseInt(data.roleId, 10),
      institutionId: data.institutionId
    }

    editMutation.mutate({ userId: user.id, data: payload })
  }

  // Handle close cleanly
  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">First Name</Label>
              <Input 
                id="edit-firstName" 
                placeholder="John"
                {...register("firstName", { 
                  required: "First name is too short",
                  minLength: { value: 2, message: "First name is too short" }
                })} 
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Last Name</Label>
              <Input 
                id="edit-lastName" 
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
            <Label htmlFor="edit-email">Email Address</Label>
            <Input 
              id="edit-email" 
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
            <Label htmlFor="edit-role">Role</Label>
            <Select 
              value={watch("roleId")} 
              onValueChange={(value) => {
                setValue("roleId", value, { shouldValidate: true })
              }}
            >
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
            <Label htmlFor="edit-institution">Institution <span className="text-destructive">*</span></Label>
            <Select 
              value={watch("institutionId") || ""} 
              onValueChange={(value) => setValue("institutionId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id.toString()}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Users must be assigned to an institution.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
