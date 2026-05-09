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
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Institutional Background Element */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-secondary/30 border-b border-border pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <AnimatePresence mode="wait">
            <StudentAuth
              key="student-auth"
              onBack={() => {}} // No back needed anymore
            />
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { getMainUrl } from "@/lib/domain";

/* ---------------- Student Auth (Login Only) ---------------- */
function StudentAuth({ onBack }) {
  const navigate = useNavigate();
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
      // Backend expects { faydaId }
      const res = await api.studentLogin({ faydaId: formData.nationalId.trim() });
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
      const res = await api.verifyStudent({ 
        faydaId: formData.nationalId.trim(), 
        otp: otp.trim() 
      });
      
      if (res.data.success) {
        const { accessToken, user } = res.data.data;
        localStorage.setItem("nar-token", accessToken);
        localStorage.setItem("nar-user", JSON.stringify(user));
        localStorage.setItem("nar-current-student-id", formData.nationalId.trim());
        navigate("/student");
      } else {
        setNotice(res.data.message || "Authorization failed.");
      }
    } catch (err) {
      setNotice(err.response?.data?.message || "Invalid security code.");
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
      <div className="text-center mb-10">
        <div className="h-1 bg-accent w-20 mx-auto mb-6 rounded-full" />
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-2 tracking-tight">
          Student Portal
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-4">
          National Academic Registry
        </p>
      </div>

      <Card className="bg-card border border-border shadow-2xl rounded-sm academic-border">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-sm mx-auto mb-4 shadow-md">
             <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display font-bold text-3xl text-primary">Establish Identity</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
            Login with your Verified National ID
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {step === "id" ? (
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
                  {loading ? "Authenticating..." : "Authorize with Fayda"}
                </Button>
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
          )}
        </CardContent>
      </Card>
      
      <div className="text-center mt-10">
        <a
          href="http://localhost:8080/"
          className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="h-3 w-3 rotate-180" /> Back to Home
        </a>
      </div>
    </motion.div>
  );
}

