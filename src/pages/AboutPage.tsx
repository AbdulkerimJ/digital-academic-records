// src/pages/AboutPage.tsx
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Target, Eye, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";

/* ---------------- Floating Gold Particles ---------------- */
function FloatingParticles() {
  const particles = Array.from({ length: 18 });

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

/* ---------------- Auto-Scrolling Text ---------------- */
function AutoScrollText({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pos = 0;
    const speed = 0.3;

    const animate = () => {
      pos -= speed;
      if (Math.abs(pos) >= el.scrollHeight / 2) pos = 0;
      el.style.transform = `translateY(${pos}px)`;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="relative h-32 overflow-hidden text-[#D7D4CC]">
      <div ref={ref} className="absolute w-full text-center space-y-4">
        {children}
        {children}
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */
export default function AboutPage(): JSX.Element {
  const items = [
    {
      icon: Target,
      title: "Our Mission",
      text:
        "To deliver a reliable, secure, and intelligent digital platform that transforms academic record management and verification.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      text:
        "A world where every academic credential is instantly verifiable, fraud-proof, and universally accessible.",
    },
    {
      icon: Lock,
      title: "Security First",
      text:
        "End‑to‑end encryption, role‑based access, and complete audit trails ensure every action is authenticated and traceable.",
    },
    {
      icon: Shield,
      title: "Data Integrity",
      text:
        "NILARVS uses National ID synchronization and multi‑layer validation to guarantee tamper‑proof academic records.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1A2F] text-[#F7F4EE] relative overflow-hidden">
      <Navbar />
      <FloatingParticles />

      {/* Spotlight Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4A017]/10 blur-[180px] rounded-full pointer-events-none" />

      <div className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.h1
              className="font-display text-5xl font-bold bg-gradient-to-r from-[#D4A017] to-[#F7F4EE] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              About NILARVS
            </motion.h1>

            <p className="text-lg text-[#D7D4CC] max-w-2xl mx-auto mt-4 leading-relaxed">
              The National ID–Linked Digital Academic Record and Verification System is a secure,
              scalable platform that integrates National ID with academic records.
            </p>
          </motion.div>

          {/* Auto-Scrolling Mission Statement */}
          <div className="mb-12">
            <AutoScrollText>
              <p className="text-xl font-medium">Trusted. Secure. Nationally Integrated.</p>
              <p className="text-xl font-medium">Academic Records, Reinvented.</p>
              <p className="text-xl font-medium">Verification Made Instant.</p>
            </AutoScrollText>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <Card className="bg-[#0F2A44]/80 backdrop-blur border border-white/10 hover:border-[#D4A017]/40 transition-all">
                    <CardContent className="p-6 flex gap-5 items-start">
                      <motion.div
                        className="h-14 w-14 rounded-xl bg-[#D4A017]/10 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Icon className="h-7 w-7 text-[#D4A017]" />
                      </motion.div>

                      <div>
                        <h2 className="font-display font-semibold text-xl text-white mb-1">
                          {item.title}
                        </h2>
                        <p className="text-sm text-[#D7D4CC] leading-relaxed">{item.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
