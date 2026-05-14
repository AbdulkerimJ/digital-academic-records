import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateMe, changePassword } from "../../api/users.api"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { Building2, Shield, Save, KeyRound, Activity, Fingerprint, Lock, Eye, EyeOff } from "lucide-react"
import { cn } from "../../lib/utils"

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

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* 1. Technical Profile Header */}
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-end p-10 bg-card border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10">
           <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 capitalize tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Shield size={12} /> Account verified
           </div>
        </div>

        <div className="h-32 w-32 bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/20 shrink-0 font-mono">
          {getInitials()}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground capitalize leading-none">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-primary capitalize tracking-widest bg-primary/5 px-3 py-1 border border-primary/20">
                  {user?.roleName?.replace("_", " ").toLowerCase()}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground capitalize tracking-widest">
                  <Building2 size={12} className="opacity-40" />
                  {user?.institutionName || "Global administration"}
               </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2 border-t border-border/50">
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-muted-foreground capitalize tracking-tighter opacity-40">System id:</span>
                <code className="text-[10px] font-bold text-primary/60 font-mono capitalize tracking-widest">{user?.id?.slice(0, 8)}</code>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 2. Account Information */}
        <Card className="rounded-none border-border shadow-sm overflow-hidden bg-card">
          <CardHeader className="p-8 border-b border-border bg-muted/10">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary/10 border border-primary/20 text-primary">
                <Fingerprint size={20} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tighter capitalize leading-none text-foreground">Identity record</CardTitle>
                <CardDescription className="text-[10px] font-bold text-muted-foreground capitalize tracking-tight opacity-70">Update your administrative profile data.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">First name</Label>
                  <Input 
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="h-12 rounded-none bg-muted/10 border-border focus-visible:ring-primary/20 font-bold text-sm capitalize tracking-tight"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Last name</Label>
                  <Input 
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="h-12 rounded-none bg-muted/10 border-border focus-visible:ring-primary/20 font-bold text-sm capitalize tracking-tight"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email-display" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Email address (locked)</Label>
                <div className="relative">
                   <Input 
                    id="email-display"
                    value={profileData.email}
                    disabled
                    className="h-12 rounded-none bg-muted/20 border-dashed border-border cursor-not-allowed opacity-60 font-mono text-xs font-bold"
                  />
                  <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button 
              form="profile-form" 
              disabled={updateProfileMutation.isPending}
              className="w-full md:w-auto ml-auto rounded-none h-12 px-10 font-black text-[10px] capitalize tracking-widest shadow-xl shadow-primary/20 transition-all hover:brightness-110"
            >
              {updateProfileMutation.isPending ? "Processing..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>

        {/* 3. Security & Access */}
        <Card className="rounded-none border-border shadow-sm overflow-hidden bg-card">
          <CardHeader className="p-8 border-b border-border bg-muted/10">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600">
                <Activity size={20} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tighter capitalize leading-none text-foreground">Security access</CardTitle>
                <CardDescription className="text-[10px] font-bold text-muted-foreground capitalize tracking-tight opacity-70">Manage your administrative credentials.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="currentPassword" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Current password</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="h-12 rounded-none bg-muted/10 border-border focus-visible:ring-primary/20 font-bold pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="newPassword" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">New password</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="h-12 rounded-none bg-muted/10 border-border focus-visible:ring-primary/20 font-bold pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Confirm password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="h-12 rounded-none bg-muted/10 border-border focus-visible:ring-primary/20 font-bold pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button 
              form="password-form" 
              disabled={changePasswordMutation.isPending}
              variant="outline"
              className="w-full md:w-auto ml-auto rounded-none h-12 px-10 font-black text-[10px] capitalize tracking-widest border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
            >
              {changePasswordMutation.isPending ? "Updating credentials..." : "Update password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
