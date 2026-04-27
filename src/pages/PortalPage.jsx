import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Building2,
  Shield,
  ArrowRight,
  User,
  Key,
  ShieldCheck,
  Search
} from "lucide-react";
import api from "@/lib/api";

export default function PortalPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "student",
      icon: GraduationCap,
      title: "Student Portal",
      desc: "Securely access and share your verified academic transcripts",
    },
    {
      id: "registrar",
      icon: Building2,
      title: "Registrar Console",
      desc: "Manage official student records and institutional credentials",
    },
    {
      id: "admin",
      icon: ShieldCheck,
      title: "Administration",
      desc: "System oversight and national registry synchronization",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Institutional Background Element */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-secondary/30 border-b border-border pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.section
                key="role-select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="text-center mb-16">
                  <div className="h-1 bg-accent w-20 mx-auto mb-6 rounded-full" />
                  <h1 className="text-5xl md:text-6xl font-display font-bold text-primary mb-4 tracking-tight">
                    Access Portal
                  </h1>
                  <p className="text-xs uppercase tracking-[0.4em] font-bold text-accent mb-6">
                    Identity Verification Gateway
                  </p>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                    Select your identity profile to establish a secure connection with the national academic registry.
                  </p>
                </div>

                <div className="grid gap-6">
                  {roles.map((role, idx) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card
                        className="cursor-pointer bg-card border border-border shadow-sm rounded-sm hover:shadow-md transition-all group overflow-hidden academic-border"
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <CardContent className="flex items-center gap-6 p-8">
                          <div className="h-16 w-16 rounded-sm bg-primary flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                            <role.icon className="h-8 w-8 text-primary-foreground" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-2xl font-display font-bold text-primary mb-1">
                              {role.title}
                            </h3>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              {role.desc}
                            </p>
                          </div>

                          <div className="h-10 w-10 rounded-sm border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                            <ArrowRight className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <Link
                    to="/verify"
                    className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="h-3 w-3" /> External Record Verification
                  </Link>
                </div>
              </motion.section>
            ) : selectedRole === "student" ? (
              <StudentAuth
                key="student-auth"
                onBack={() => setSelectedRole(null)}
              />
            ) : (
              <CredentialLogin
                key="cred-login"
                role={selectedRole}
                onBack={() => setSelectedRole(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------------- Student Auth (Login/Register) ---------------- */
function StudentAuth({ onBack }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [step, setStep] = useState("id");
  const [formData, setFormData] = useState({ nationalId: "ETH-1234-5678", firstName: "Samuel", lastName: "Kebede", email: "student@test.com", password: "password" });
  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const sendOtp = async () => {
    if (!formData.nationalId.trim()) {
      setNotice("Please provide a valid National ID.");
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const res = await api.post("/auth/login", { faydaId: formData.nationalId.trim() });
      if (res.data.success) {
        setStep("otp");
        setNotice("Authorization code transmitted to your verified device.");
      } else {
        setNotice(res.data.message || "Identification failed.");
      }
    } catch (err) {
      setNotice(err.response?.data?.message || "Registry connection timeout.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setNotice("Enter the 6-digit authorization code.");
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const res = await api.post("/auth/verify", { 
        faydaId: formData.nationalId.trim(), 
        otp: otp.trim() 
      });
      
      if (res.data.success) {
        const { token, user } = res.data.data;
        localStorage.setItem("nar-token", token);
        localStorage.setItem("nar-user", JSON.stringify(user));
        localStorage.setItem("nar-current-student-id", formData.nationalId.trim());
        navigate(`/student?nationalId=${encodeURIComponent(formData.nationalId.trim())}`);
      } else {
        setNotice(res.data.message || "Authorization failed.");
      }
    } catch (err) {
      setNotice(err.response?.data?.message || "Invalid security code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.nationalId || !formData.email || !formData.firstName || !formData.lastName) {
      setNotice("All formal identification fields are required.");
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const res = await api.post("/auth/register", formData);
      if (res.data.success) {
        setNotice("Registration successful. Please proceed to login.");
        setMode("login");
      } else {
        setNotice(res.data.message || "Registration failed.");
      }
    } catch (err) {
      setNotice(err.response?.data?.message || "Registry transmission error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border border-border shadow-2xl rounded-sm academic-border">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-sm mx-auto mb-4 shadow-md">
             <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display font-bold text-3xl text-primary">Student Identity</CardTitle>
          <div className="flex justify-center gap-4 mt-4 border-b border-border pb-4">
             <button onClick={() => { setMode("login"); setNotice(null); }} className={`text-[10px] uppercase font-bold tracking-widest pb-1 transition-all ${mode === "login" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary"}`}>Login</button>
             <button onClick={() => { setMode("register"); setNotice(null); }} className={`text-[10px] uppercase font-bold tracking-widest pb-1 transition-all ${mode === "register" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary"}`}>Register</button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {mode === "login" ? (
            step === "id" ? (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Verified National ID</Label>
                  <Input
                    name="nationalId"
                    className="rounded-sm border-border h-12 focus:ring-1 focus:ring-primary text-center font-mono tracking-widest text-lg"
                    placeholder="ETH-XXXX-XXXX"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                  />
                </div>
                {notice && <div className="text-[10px] font-bold uppercase text-accent text-center bg-accent/5 py-2 rounded-sm border border-accent/20">{notice}</div>}
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-primary text-primary-foreground rounded-sm h-12 uppercase text-xs font-bold tracking-widest shadow-md hover:bg-primary/90" onClick={sendOtp} disabled={loading}>
                    {loading ? "Authenticating..." : "Establish Identity"}
                  </Button>
                  <Button variant="ghost" className="w-full text-muted-foreground uppercase text-[10px] font-bold tracking-widest" onClick={onBack}>Return to Portal Select</Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Secure Authorization Code</Label>
                  <Input
                    className="rounded-sm border-border h-12 focus:ring-1 focus:ring-primary text-center font-mono tracking-[0.5em] text-2xl"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
                {notice && <div className="text-[10px] font-bold uppercase text-accent text-center bg-accent/5 py-2 rounded-sm border border-accent/20">{notice}</div>}
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-primary text-primary-foreground rounded-sm h-12 uppercase text-xs font-bold tracking-widest shadow-md hover:bg-primary/90" onClick={verifyOtp} disabled={loading}>
                    {loading ? "Verifying..." : "Confirm & Enter Portal"}
                  </Button>
                  <Button variant="ghost" className="w-full text-muted-foreground uppercase text-[10px] font-bold tracking-widest" onClick={() => setStep("id")}>Re-enter ID</Button>
                </div>
              </>
            )
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">First Name</Label>
                    <Input name="firstName" className="rounded-sm h-10" value={formData.firstName} onChange={handleInputChange} placeholder="John" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Last Name</Label>
                    <Input name="lastName" className="rounded-sm h-10" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                  </div>
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">National ID (Fayda)</Label>
                  <Input name="nationalId" className="rounded-sm h-10 font-mono" value={formData.nationalId} onChange={handleInputChange} placeholder="ETH-XXXX-XXXX" />
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Official Email</Label>
                  <Input name="email" type="email" className="rounded-sm h-10" value={formData.email} onChange={handleInputChange} placeholder="j.doe@example.com" />
               </div>
               {notice && <div className="text-[10px] font-bold uppercase text-accent text-center bg-accent/5 py-2 rounded-sm border border-accent/20">{notice}</div>}
               <div className="flex flex-col gap-3 pt-2">
                  <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-sm h-12 uppercase text-xs font-bold tracking-widest shadow-md hover:bg-primary/90" disabled={loading}>
                    {loading ? "Transmitting..." : "Submit Registration"}
                  </Button>
                  <Button variant="ghost" type="button" className="w-full text-muted-foreground uppercase text-[10px] font-bold tracking-widest" onClick={onBack}>Cancel</Button>
               </div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}


/* ---------------- Registrar / Admin Login ---------------- */
function CredentialLogin({
  role,
  onBack,
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(role === "registrar" ? "demo@registrar.edu" : "demo@admin.gov");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const title = role === "registrar" ? "Registrar Credentials" : "Administrative Access";
  const dashboardPath = role === "registrar" ? "/registrar" : "/admin";

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Institutional credentials are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Pass the intended role to the mock API so it can return the correct user type
      const res = await api.login({ email, password, intendedRole: role });
      console.log("[NAR-DEBUG] Login Response:", res.data);
      if (res.data.success) {
        const { token, user } = res.data.data;
        const userRole = user.roleName || user.role_name;

        // Automated Role Redirection
        let targetPath = "/";
        if (userRole === "SUPER_ADMIN" || userRole === "INSTITUTION_ADMIN") {
          targetPath = "/admin";
        } else if (userRole === "REGISTRAR") {
          targetPath = "/registrar";
        } else if (userRole === "STUDENT") {
          targetPath = "/student";
        }

        localStorage.setItem("nar-token", token);
        localStorage.setItem("nar-user", JSON.stringify(user));
        navigate(targetPath);
      } else {
        setError(res.data.message || "Access denied.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials provided.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border border-border shadow-2xl rounded-sm academic-border">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-sm mx-auto mb-4 shadow-md">
             <Key className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display font-bold text-3xl text-primary">{title}</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Secure Institutional Gateway
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Official Email</Label>
              <Input 
                className="rounded-sm border-border h-12 focus:ring-1 focus:ring-primary"
                type="email" 
                placeholder="authority@institution.edu.et" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Security Password</Label>
              <Input 
                className="rounded-sm border-border h-12 focus:ring-1 focus:ring-primary"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {error && <div className="text-[10px] font-bold uppercase text-destructive text-center bg-destructive/5 py-2 rounded-sm border border-destructive/20">{error}</div>}

          <div className="flex flex-col gap-3">
            <Button className="w-full bg-primary text-primary-foreground rounded-sm h-12 uppercase text-xs font-bold tracking-widest shadow-md hover:bg-primary/90" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <div className="flex flex-col items-center leading-none">
                  <span className="text-[10px]">Authorizing...</span>
                  <span className="text-[7px] opacity-60 mt-1 font-normal tracking-normal lowercase">(Waiting for Render server to wake)</span>
                </div>
              ) : "Authorize Access"}
            </Button>

            <Button variant="ghost" className="w-full text-muted-foreground uppercase text-[10px] font-bold tracking-widest" onClick={onBack}>
              Return to Profile Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

