import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Target, Eye, Lock, Landmark, Award, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const items = [
    {
      icon: Target,
      title: "Our Mission",
      text: "Transforming academic record verification through intelligent automation and national registry integration.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      text: "A fraud-proof future where credentials are instantly verifiable by employers and institutions worldwide.",
    },
    {
      icon: Lock,
      title: "Security Framework",
      text: "End-to-end cryptographic protection ensuring every record maintains absolute integrity and non-repudiation.",
    },
    {
      icon: Landmark,
      title: "Institutional Integrity",
      text: "Direct synchronization with the National ID Registry for permanent, immutable identity verification.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <div className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Institutional Background Element */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-secondary/20 border-b border-border pointer-events-none" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="h-1 bg-accent w-24 mx-auto mb-8 rounded-full" />
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
              About NAR
            </h1>
            <p className="text-xs uppercase tracking-[0.4em] font-bold text-accent mb-6">
              National Academic Registry
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-body">
              A secure, high-integrity platform bridging the gap between educational institutions, 
              graduates, and verification authorities through a unified digital architecture.
            </p>
          </motion.div>

          {/* Core Values / Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="bg-card border border-border shadow-sm rounded-sm academic-border h-full group hover:shadow-md transition-shadow">
                    <CardContent className="p-8">
                      <div className="h-14 w-14 rounded-sm bg-primary flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform">
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      </div>

                      <h2 className="font-display font-bold text-2xl text-primary mb-3">
                        {item.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Stats / Final Note Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24 p-12 border border-border bg-secondary/30 rounded-sm text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <GraduationCap className="h-40 w-40 text-primary" />
            </div>
            <h3 className="font-display font-bold text-2xl text-primary mb-4">Official Registry Standard</h3>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              NAR is designed to operate as the authoritative source of truth for academic credentials, 
              ensuring that years of hard work are protected and easily shared across professional borders.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

