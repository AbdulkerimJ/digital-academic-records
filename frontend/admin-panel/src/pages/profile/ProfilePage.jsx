import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateMe, changePassword } from "../../api/users.api"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { User, Mail, Lock, Shield, Building2, Save, KeyRound } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Profile Info State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || ""
  })

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (res) => {
      toast.success(res.message || "Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ["auth-user"] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile")
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      toast.success(res.message || "Password changed successfully")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to change password")
    }
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      firstName: profileData.firstName,
      lastName: profileData.lastName
    })
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  const getInitials = () => {
    return `${user?.firstName?.[0] || 'D'}${user?.lastName?.[0] || 'A'}`.toUpperCase()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 bg-card border border-border/60 rounded-2xl shadow-sm">
        <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{user?.firstName} {user?.lastName}</h2>
            <Badge variant="outline" className="w-fit mx-auto md:mx-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-muted/30">
              {user?.roleName?.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-1 text-xs text-muted-foreground">
            <Building2 size={14} className="opacity-70" />
            <span className="font-medium tracking-tight">{user?.institutionName || "Global Administration"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-muted/20">
            <CardTitle className="text-lg font-bold tracking-tight">Account Details</CardTitle>
            <CardDescription className="text-xs font-medium">Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5">First Name</Label>
                  <Input 
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="h-11 rounded-xl bg-muted/10 border-muted focus-visible:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Last Name</Label>
                  <Input 
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="h-11 rounded-xl bg-muted/10 border-muted focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-display" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Email Address (Read-only)</Label>
                <Input 
                  id="email-display"
                  value={profileData.email}
                  disabled
                  className="h-11 rounded-xl bg-muted/40 border-dashed cursor-not-allowed opacity-80"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              form="profile-form" 
              disabled={updateProfileMutation.isPending}
              className="w-full md:w-auto ml-auto rounded-xl h-11 px-8 font-bold shadow-sm transition-all hover:shadow-md"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        {/* Security */}
        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-muted/20">
            <CardTitle className="text-lg font-bold tracking-tight">Security Settings</CardTitle>
            <CardDescription className="text-xs font-medium">Manage your account access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Current Password</Label>
                <Input 
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="h-11 rounded-xl bg-muted/10 border-muted focus-visible:ring-primary/20"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5">New Password</Label>
                <Input 
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="h-11 rounded-xl bg-muted/10 border-muted focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Confirm New Password</Label>
                <Input 
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="h-11 rounded-xl bg-muted/10 border-muted focus-visible:ring-primary/20"
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              form="password-form" 
              disabled={changePasswordMutation.isPending}
              variant="outline"
              className="w-full md:w-auto ml-auto rounded-xl h-11 px-8 font-bold border-muted-foreground/20 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
            >
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
