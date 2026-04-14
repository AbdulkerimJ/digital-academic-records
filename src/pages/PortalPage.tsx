// src/pages/PortalPage.tsx
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
} from "lucide-react";

/* ---------------- Floating Gold Particles ---------------- */
function FloatingParticles() {
  const particles = Array.from({ length: 20 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#D4A017]"
          style={{
            width: `${6 + (i % 4) * 4}px`,
            height: `${6 + (i % 4) * 4}px`,
            left: `${(i * 37) % 100}%`,
            top: `${(i * 19) % 100}%`,
            filter: "blur(4px)",
            opacity: 0.25,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 6 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Main Portal Page ---------------- */
export default function PortalPage(): JSX.Element {
  const [selectedRole, setSelectedRole] = useState<
    "student" | "registrar" | "admin" | null
  >(null);

  const roles = [
    {
      id: "student" as const,
      icon: GraduationCap,
      title: "Student",
      desc: "Access your academic records",
    },
    {
      id: "registrar" as const,
      icon: Building2,
      title: "Registrar",
      desc: "Manage institution records",
    },
    {
      id: "admin" as const,
      icon: Shield,
      title: "Administrator",
      desc: "System management",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1A2F] text-white relative overflow-hidden">
      <Navbar />
      <FloatingParticles />

      {/* Spotlight Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4A017]/10 blur-[180px] rounded-full pointer-events-none" />

      <main className="flex-1 pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.section
                key="role-select"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-center mb-10">
                  <motion.h1
                    className="font-display text-4xl font-bold bg-gradient-to-r from-[#D4A017] to-[#F7F4EE] bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    Access Portal
                  </motion.h1>

                  <p className="text-sm text-white/80 mt-2">
                    Choose your role to continue into the NILARVS portal
                  </p>
                </div>

                <div className="grid gap-5">
                  {roles.map((role) => (
                    <motion.div
                      key={role.id}
                      whileHover={{ scale: 1.02, y: -3 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Card
                        className="cursor-pointer bg-[#0F2A44]/80 backdrop-blur border border-white/10 hover:border-[#D4A017]/40 transition-all"
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <CardContent className="flex items-center gap-4 p-5">
                          <motion.div
                            whileHover={{ rotate: 6, scale: 1.1 }}
                            className="h-12 w-12 rounded-lg bg-[#D4A017]/10 flex items-center justify-center shrink-0"
                          >
                            <role.icon className="h-6 w-6 text-[#D4A017]" />
                          </motion.div>

                          <div className="flex-1">
                            <h3 className="font-display font-semibold text-white">
                              {role.title}
                            </h3>
                            <p className="text-sm text-white/80">{role.desc}</p>
                          </div>

                          <ArrowRight className="h-5 w-5 text-white/80" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <Link
                    to="/verify"
                    className="text-sm text-[#D4A017] hover:underline"
                  >
                    Need to verify a record? Click here
                  </Link>
                </div>
              </motion.section>
            ) : selectedRole === "student" ? (
              <StudentLogin
                key="student-login"
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

/* ---------------- Student Login ---------------- */
function StudentLogin({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"id" | "otp">("id");
  const [nationalId, setNationalId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sendOtp = async () => {
    if (!nationalId.trim()) {
      setNotice("Please enter your National ID.");
      return;
    }
    setLoading(true);
    setNotice(null);
    await new Promise((r) => setTimeout(r, 700));
    setStep("otp");
    setNotice("OTP sent to your registered phone.");
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setNotice("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    setNotice(null);
    await new Promise((r) => setTimeout(r, 700));
    window.localStorage.setItem("nilarvs-current-student-id", nationalId.trim());
    navigate(`/student?nationalId=${encodeURIComponent(nationalId.trim())}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="bg-[#0F2A44]/90 backdrop-blur border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="font-display text-white">Student Login</CardTitle>
          <CardDescription className="text-white/80">
            {step === "id"
              ? "Enter your National ID to continue"
              : "Enter the OTP sent to your registered phone"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "id" ? (
            <>
              <div className="space-y-2">
                <Label className="text-white">National ID Number</Label>
                <Input
                  placeholder="ETH-XXXX-XXXX"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
              </div>

              {notice && <div className="text-sm text-white/80">{notice}</div>}

              <div className="flex gap-3">
                <Button className="w-full" onClick={sendOtp} disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
                <Button className="w-full" onClick={onBack}>
                  Back
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-white">One-Time Password</Label>
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>

              {notice && <div className="text-sm text-white/80">{notice}</div>}

              <div className="flex gap-3">
                <Button className="w-full" onClick={verifyOtp} disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button className="w-full" onClick={() => setStep("id")}>
                  Back
                </Button>
              </div>
            </>
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
}: {
  role: "registrar" | "admin";
  onBack: () => void;
}) {
  const title = role === "registrar" ? "Registrar Login" : "Admin Login";
  const dashboardPath = role === "registrar" ? "/registrar" : "/admin";

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="bg-[#0F2A44]/90 backdrop-blur border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="font-display text-white">{title}</CardTitle>
          <CardDescription className="text-white/80">
            Enter your institutional credentials
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input type="email" placeholder="you@institution.edu" />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>

          <div className="flex gap-3">
            <Link to={dashboardPath} className="w-full">
              <Button className="w-full">Sign In</Button>
            </Link>

            <Button className="w-full" onClick={onBack}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
