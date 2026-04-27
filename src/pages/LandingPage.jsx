import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import {
  ShieldCheck, QrCode, ArrowRight, Award, Shield,
  Zap, Landmark, Search, GraduationCap, CheckCircle2,
  BookOpen, FileText, Globe
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getPortalUrl } from "@/lib/domain";

export default function LandingPage() {
  const [stats, setStats] = useState([
    { label: "Verified Graduates", value: "...", key: 'graduates' },
    { label: "Institutions", value: "...", key: 'institutions' },
    { label: "Verification Requests", value: "...", key: 'requests' },
    { label: "Security Level", value: "...", key: 'security' }
  ]);

  useEffect(() => {
    api.get("/public/stats")
      .then(res => {
        const data = res.data?.data || res.data;
        setStats([
          { label: "Verified Graduates", value: data.graduates },
          { label: "Institutions", value: data.institutions },
          { label: "Verification Requests", value: data.requests },
          { label: "Security Level", value: data.security }
        ]);
      })
      .catch(() => {
        // Fallback to defaults
        setStats([
          { label: "Verified Graduates", value: "2.4M+" },
          { label: "Institutions", value: "150+" },
          { label: "Verification Requests", value: "10M+" },
          { label: "Security Level", value: "Bank-Grade" }
        ]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Institutional & Formal */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-secondary/30 overflow-hidden border-b border-border">
        {/* Subtle Pinstripe Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="container px-4 md:px-6 mx-auto relative z-10 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Column: Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col space-y-8"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary text-primary-foreground rounded-sm w-fit shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Official Government Portal</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1] text-primary">
                National Academic <br />
                <span className="text-accent italic font-medium">Registry.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed max-w-lg">
                Securely verifying the academic achievements of every citizen. A unified, tamper-proof system for institutions, employers, and students.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link to="/verify" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 rounded-sm text-lg font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all uppercase tracking-wider">
                    Verify Records
                  </Button>
                </Link>
                <a href={getPortalUrl()} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full h-14 px-8 rounded-sm text-lg font-bold border-2 border-primary text-primary hover:bg-primary/5 transition-all uppercase tracking-wider">
                    Portal Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>


            </motion.div>

            {/* Right Column: Visual Mockup (Official Document Style) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:ml-auto w-full max-w-lg"
            >
              <div className="relative bg-card rounded-sm p-1 border-4 border-double border-primary/20 shadow-2xl overflow-hidden">
                <div className="bg-white p-8 border border-primary/10 academic-border min-h-[480px] flex flex-col">
                   <div className="flex justify-between items-start mb-12">
                      <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center border-2 border-primary/20">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1">Authenticity Seal</div>
                         <div className="text-xs font-mono text-muted-foreground">REG-ID: #ET-2024-8F3C</div>
                      </div>
                   </div>
                   
                   <div className="space-y-8 flex-grow">
                      <div className="text-center border-b border-border pb-6 mb-6">
                         <h3 className="text-3xl font-display font-bold text-primary mb-1">Official Transcript</h3>
                         <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">National Academic Registry (NAR)</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                         <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Graduate Name</div>
                            <div className="text-xl font-display font-bold text-foreground">Abebe Kebede</div>
                         </div>
                         <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Fayda ID</div>
                            <div className="text-lg font-mono font-medium text-foreground">1234-5678-9012</div>
                         </div>
                      </div>

                      <div>
                         <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Conferred By</div>
                         <div className="text-lg font-display font-semibold text-primary">Arba Minch University</div>
                         <div className="text-[11px] text-muted-foreground">Bachelor of Science in Software Engineering</div>
                      </div>
                   </div>

                   <div className="mt-8 pt-6 border-t-2 border-dashed border-border flex justify-between items-end">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                           <ShieldCheck className="h-4 w-4 text-accent" />
                           Digitally Signed
                        </div>
                        <div className="h-10 w-32 border-b border-primary/30 flex items-end pb-1 italic text-primary/40 text-xs font-serif">
                          Electronic Signature
                        </div>
                      </div>
                      <div className="p-2 bg-secondary rounded-sm">
                        <QrCode className="h-16 w-16 text-primary" />
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* Core Functions - 3 Column Grid */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="h-1 w-20 bg-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-primary">Registry Functions</h2>
            <p className="text-lg text-muted-foreground">Operating at the intersection of academic integrity and digital innovation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: FileText, title: "Records Management", desc: "Centralized repository for all higher education degrees and certifications." },
              { icon: Globe, title: "Global Portability", desc: "Digital records recognized by international institutions and employers." },
              { icon: Landmark, title: "Institutional Oversight", desc: "Real-time monitoring and reporting for educational governing bodies." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wider text-primary">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Solid & Trustworthy */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-3xl md:text-4xl font-display font-bold text-accent">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-secondary/30 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-primary">
              Securing the Future of <br />
              <span className="italic">Academic Excellence.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <a href={getPortalUrl()} className="w-full sm:w-auto">
                 <Button size="lg" className="w-full h-14 px-10 rounded-sm text-lg font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all uppercase tracking-widest">
                    Access Portal
                 </Button>
               </a>
               <Link to="/contact" className="w-full sm:w-auto">
                 <Button variant="outline" size="lg" className="w-full h-14 px-10 rounded-sm text-lg font-bold border-2 border-primary text-primary hover:bg-primary/5 transition-all uppercase tracking-widest">
                    Contact Registrar
                 </Button>
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

