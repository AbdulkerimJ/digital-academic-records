// src/pages/LandingPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, QrCode, FileCheck, Users, GraduationCap, Building2,
  ArrowRight, CheckCircle2, Fingerprint, Globe, Lock, Zap,
  ChevronRight, Sparkles, Search, MessageCircle
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

/**
 * NILARVS LandingPage
 * - Dark blue (#0A1A2F) + Creamy white (#F7F4EE) + Gold accent (#D4A017)
 * - All 15 features integrated (wave, particles, counters, carousel, map, ID card, timeline, search, assistant, footer ribbon, etc.)
 */

/* -------------------------
   Small helpers & hooks
   ------------------------- */
function useAnimatedCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(id);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return value;
}

/* -------------------------
   Visual components
   ------------------------- */

function HeroWave() {
  // subtle animated SVG wave background
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 600" aria-hidden>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#0A1A2F" stopOpacity="1" />
          <stop offset="100%" stopColor="#11243D" stopOpacity="1" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>

      <g filter="url(#blur)" opacity="0.18">
        <motion.path
          d="M0,200 C240,120 480,280 720,240 C960,200 1200,120 1440,160 L1440,600 L0,600 Z"
          fill="url(#g1)"
          initial={{ y: 0 }}
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      <motion.g opacity="0.06" initial={{ rotate: 0 }} animate={{ rotate: [0, 2, 0] }} transition={{ duration: 20, repeat: Infinity }}>
        <circle cx="1200" cy="80" r="120" fill="#D4A017" />
      </motion.g>
    </svg>
  );
}

function Particles() {
  // lightweight particle system (decorative)
  const particles = useMemo(() => Array.from({ length: 18 }), []);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#D4A017] opacity-20"
          style={{
            width: `${8 + (i % 5) * 6}px`,
            height: `${8 + (i % 5) * 6}px`,
            left: `${(i * 37) % 100}%`,
            top: `${(i * 23) % 100}%`,
            filter: "blur(6px)"
          }}
          animate={{ y: [0, -12, 0], x: [0, 6, 0], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 8 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/* Trusted logos carousel (placeholder) */
function TrustedCarousel() {
  const logos = [
    { name: "Ministry of Education", src: "/logos/ministry.svg" },
    { name: "Fayda", src: "/logos/fayda.svg" },
    { name: "Addis Ababa University", src: "/logos/aau.svg" },
    { name: "Employer X", src: "/logos/employer.svg" },
  ];
  return (
    <div className="overflow-hidden">
      <motion.div className="flex gap-8" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
        {logos.concat(logos).map((l, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 min-w-[220px]">
            <img src={l.src} alt={l.name} className="h-8 object-contain" />
            <div className="text-sm">{l.name}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* Simple SVG Ethiopia map placeholder with pulsing dots */
function EthiopiaMap({ points = 8 }: { points?: number }) {
  const dots = Array.from({ length: points }).map((_, i) => ({
    id: i,
    left: `${10 + (i * 11) % 80}%`,
    top: `${20 + (i * 9) % 60}%`
  }));
  return (
    <div className="relative w-full h-64 bg-[#071226] rounded-xl border border-white/6 overflow-hidden">
      <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full opacity-6">
        <rect x="0" y="0" width="100" height="60" fill="#0A1A2F" />
        {/* stylized outline */}
        <path d="M10 20 C20 5, 40 5, 60 15 C80 25, 85 40, 70 50 C50 58, 30 55, 12 45 Z" fill="#0F2A44" />
      </svg>

      {dots.map(d => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-[#D4A017] shadow-lg"
          style={{ width: 10, height: 10, left: d.left, top: d.top }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.6 + (d.id % 3) * 0.6, repeat: Infinity }}
          title={`Institution ${d.id + 1}`}
        />
      ))}
    </div>
  );
}

/* Floating National ID Card */
function FloatingIDCard() {
  return (
    <motion.div
      className="w-[320px] bg-[#0F2A44] border border-white/6 rounded-2xl p-4 shadow-2xl text-[#F7F4EE]"
      initial={{ rotateY: -12, rotateX: 6, scale: 0.98 }}
      animate={{ rotateY: [ -8, 8, -8 ], rotateX: [6, -4, 6], scale: [0.98, 1.02, 0.98] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-[#D4A017]/20 flex items-center justify-center">
            <Fingerprint className="h-5 w-5 text-[#D4A017]" />
          </div>
          <div>
            <div className="text-xs text-[#D7D4CC]">National ID</div>
            <div className="font-semibold">FAYDA • 1234 5678 9012</div>
          </div>
        </div>
        <div className="text-xs text-[#D7D4CC]">Verified</div>
      </div>

      <div className="bg-white/5 rounded-md p-3">
        <div className="text-sm text-[#D7D4CC]">Abebe Kebede</div>
        <div className="text-xs text-[#D7D4CC]">Addis Ababa University</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-[#D7D4CC]">Degree</div>
          <div className="font-medium">B.Sc. Computer Science</div>
        </div>
      </div>
    </motion.div>
  );
}

/* Floating Quick Access Panel */
function QuickAccessPanel() {
  const items = [
    { label: "Verify Record", to: "/verify", icon: QrCode },
    { label: "Student Login", to: "/student", icon: GraduationCap },
    { label: "Registrar Login", to: "/registrar", icon: Building2 },
    { label: "Admin Login", to: "/admin", icon: Shield },
  ];
  return (
    <div className="fixed right-6 bottom-8 z-50 hidden md:flex flex-col gap-3">
      {items.map((it, i) => (
        <motion.div key={it.label} whileHover={{ x: -6 }} initial={{ x: 0 }}>
          <Link to={it.to}>
            <div className="flex items-center gap-3 bg-[#0F2A44]/90 border border-white/6 rounded-full px-4 py-2 shadow-lg">
              <it.icon className="h-5 w-5 text-[#D4A017]" />
              <span className="text-sm">{it.label}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

/* Floating Assistant Bubble */
function AssistantBubble() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="fixed left-6 bottom-8 z-50 md:flex hidden items-end">
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="bg-[#0F2A44] border border-white/6 rounded-xl p-4 shadow-xl w-72 text-[#F7F4EE]">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-[#D4A017]" />
                <div>
                  <div className="font-semibold">Need help verifying a record?</div>
                  <div className="text-sm text-[#D7D4CC]">Open the Verify page and scan the QR code or paste the QR payload.</div>
                  <div className="mt-3 flex gap-2">
                    <Link to="/verify"><Button size="sm" className="bg-[#D4A017] text-white">Open Verify</Button></Link>
                    <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Close</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setOpen(v => !v)}
        className="fixed left-6 bottom-6 z-50 md:hidden bg-[#D4A017] text-white rounded-full p-3 shadow-lg"
        aria-label="Assistant"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </>
  );
}

/* Footer ribbon animation */
function FooterRibbon() {
  return (
    <div className="absolute inset-x-0 -top-2 h-1 overflow-hidden">
      <motion.div className="h-1 bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}

/* -------------------------
   Main LandingPage
   ------------------------- */

export default function LandingPage(): JSX.Element {
  // counters
  const verifiedCount = useAnimatedCounter(500000);
  const institutionsCount = useAnimatedCounter(1200);
  const uptime = useAnimatedCounter(999); // 99.9% -> show as 999/1000
  const avgVerify = useAnimatedCounter(2);

  // search suggestions (mock)
  const [query, setQuery] = useState("");
  const suggestions = ["Addis Ababa University", "Fayda", "How to verify", "Student login"].filter(s => s.toLowerCase().includes(query.toLowerCase()));

  // page transition wrapper (for React Router, you can wrap routes with AnimatePresence)
  const pageRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen relative bg-[#0A1A2F] text-[#F7F4EE]">
      <Navbar />

      {/* Quick access & assistant */}
      <QuickAccessPanel />
      <AssistantBubble />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <HeroWave />
        <Particles />

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <span className="text-sm font-medium">National Digital Verification Platform</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Ethiopia’s Trusted
              <br />
              Academic Verification
              <span className="block text-[#D4A017]">Powered by National ID</span>
            </h1>

            <p className="text-lg text-[#D7D4CC] max-w-lg mb-6">
              NILARVS links National ID with academic records to provide secure, tamper‑proof verification across the nation — instant, auditable, and trusted.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/verify">
                <Button size="lg" className="gap-2 text-base px-8 h-12 rounded-xl bg-[#D4A017] text-white hover:bg-[#b88a12]">
                  <QrCode className="h-5 w-5" />
                  Verify a Record
                </Button>
              </Link>

              <Link to="/portal">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12 rounded-xl border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017]/10">
                  Access Portal
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Search bar */}
            <div className="mt-8 max-w-xl">
              <div className="flex items-center gap-3 bg-white/6 rounded-full px-3 py-2 border border-white/8">
                <Search className="h-5 w-5 text-[#D4A017]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search institutions, records, or help..."
                  className="bg-transparent outline-none flex-1 text-[#F7F4EE] placeholder:text-[#D7D4CC]"
                />
                <Button size="sm" className="bg-[#D4A017] text-white">Search</Button>
              </div>

              {query && suggestions.length > 0 && (
                <div className="mt-2 bg-[#0F2A44] border border-white/6 rounded-md p-2">
                  {suggestions.map(s => (
                    <div key={s} className="py-2 px-3 hover:bg-white/4 rounded-md cursor-pointer text-sm">{s}</div>
                  ))}
                </div>
              )}
            </div>

            {/* trust indicators */}
            <div className="flex items-center gap-6 mt-8 text-sm text-[#D7D4CC]">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#D4A017]" />
                <span>End‑to‑end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#D4A017]" />
                <span>Real‑time verification</span>
              </div>
            </div>
          </motion.div>

          {/* Right visual cluster */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="relative mx-auto w-full max-w-md">
              <motion.div className="bg-[#11243D] border border-white/6 rounded-2xl p-6 shadow-2xl" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 260 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#D4A017]/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-[#D4A017]" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-lg">Verified ✓</div>
                    <div className="text-sm text-[#D7D4CC]">Academic Record Authentic</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-[#D7D4CC]">Student</span><span className="font-medium">Abebe Kebede</span></div>
                  <div className="flex justify-between"><span className="text-[#D7D4CC]">Institution</span><span className="font-medium">Addis Ababa University</span></div>
                  <div className="flex justify-between"><span className="text-[#D7D4CC]">Level</span><span className="font-medium">Bachelor's Degree</span></div>
                  <div className="flex justify-between"><span className="text-[#D7D4CC]">Year</span><span className="font-medium">2024</span></div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#D4A017] font-medium"><Shield className="h-4 w-4" /> National ID Verified</div>
                  <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center"><QrCode className="h-6 w-6 text-white/40" /></div>
                </div>
              </motion.div>

              {/* floating ID card */}
              <div className="absolute -right-8 -top-8 hidden lg:block">
                <FloatingIDCard />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live counters */}
      <section className="py-8 border-y border-white/6 bg-[#071226]">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#D4A017]/10 flex items-center justify-center"><FileCheck className="h-5 w-5 text-[#D4A017]" /></div>
            <div>
              <div className="font-display font-bold text-xl">{verifiedCount.toLocaleString()}</div>
              <div className="text-xs text-[#D7D4CC]">Records Verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#D4A017]/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-[#D4A017]" /></div>
            <div>
              <div className="font-display font-bold text-xl">{institutionsCount.toLocaleString()}</div>
              <div className="text-xs text-[#D7D4CC]">Institutions</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#D4A017]/10 flex items-center justify-center"><Shield className="h-5 w-5 text-[#D4A017]" /></div>
            <div>
              <div className="font-display font-bold text-xl">{(uptime / 10).toFixed(1)}%</div>
              <div className="text-xs text-[#D7D4CC]">System Uptime</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#D4A017]/10 flex items-center justify-center"><Zap className="h-5 w-5 text-[#D4A017]" /></div>
            <div>
              <div className="font-display font-bold text-xl">{avgVerify}s</div>
              <div className="text-xs text-[#D7D4CC]">Avg. Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted carousel */}
      <section className="py-8">
        <div className="container">
          <div className="mb-4 text-[#D7D4CC]">Trusted by</div>
          <TrustedCarousel />
        </div>
      </section>

      {/* Map + features */}
      <section className="py-12 bg-[#071226]">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="font-display text-2xl font-bold mb-3">Nationwide Coverage</h2>
            <p className="text-[#D7D4CC] mb-6">Institutions across Ethiopia are connected to NILARVS — visualized below. Hover or tap a dot to see institution details.</p>
            <EthiopiaMap points={12} />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Key Capabilities</h3>
            <ul className="space-y-3 text-[#D7D4CC]">
              <li className="flex items-start gap-3"><Shield className="h-5 w-5 text-[#D4A017]" /><span>National ID linked records with cryptographic hashing</span></li>
              <li className="flex items-start gap-3"><QrCode className="h-5 w-5 text-[#D4A017]" /><span>QR code verification for instant, tamper‑proof checks</span></li>
              <li className="flex items-start gap-3"><FileCheck className="h-5 w-5 text-[#D4A017]" /><span>Standardized PDF transcripts and audit logs</span></li>
              <li className="flex items-start gap-3"><Users className="h-5 w-5 text-[#D4A017]" /><span>Role‑based access for students, registrars, and admins</span></li>
            </ul>
            <div className="mt-6">
              <Link to="/portal"><Button size="lg" className="bg-[#D4A017] text-white">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works timeline (scroll triggered) */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-2">How Verification Works</h2>
            <p className="text-[#D7D4CC]">Three steps. Under two seconds.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              { step: "01", title: "Scan or Upload QR", desc: "Use your camera or upload the QR code from the academic document.", icon: QrCode },
              { step: "02", title: "Instant Validation", desc: "NILARVS queries the secure database and verifies authenticity in real-time.", icon: Shield },
              { step: "03", title: "Get Results", desc: "Receive a clear verification result — Authentic or Not Authentic.", icon: CheckCircle2 },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className={`flex items-start gap-6 mb-8 ${i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""}`}>
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-[#D4A017] text-white font-bold shadow-md">{item.step}</div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-[#D7D4CC]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security transparency */}
      <section className="py-12 bg-[#071226]">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0F2A44] border border-white/6 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3"><Lock className="h-5 w-5 text-[#D4A017]" /><h4 className="font-semibold">Encryption</h4></div>
            <p className="text-[#D7D4CC]">All data in transit and at rest is encrypted using modern TLS and AES standards.</p>
          </div>

          <div className="bg-[#0F2A44] border border-white/6 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3"><Fingerprint className="h-5 w-5 text-[#D4A017]" /><h4 className="font-semibold">Audit & Logs</h4></div>
            <p className="text-[#D7D4CC]">Immutable audit trails record every upload, verification, and correction request for accountability.</p>
          </div>

          <div className="bg-[#0F2A44] border border-white/6 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3"><Shield className="h-5 w-5 text-[#D4A017]" /><h4 className="font-semibold">Tamper Proofing</h4></div>
            <p className="text-[#D7D4CC]">Records are hashed and optionally anchored to a tamper-evident ledger for long-term integrity.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="relative bg-gradient-to-br from-[#0F2A44] to-[#11243D] rounded-3xl p-10 md:p-16 text-center overflow-hidden border border-white/6">
            <FooterRibbon />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Verify?</h2>
            <p className="text-[#D7D4CC] max-w-2xl mx-auto mb-6">Join institutions and verifiers using NILARVS for trusted academic credential verification.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/verify"><Button size="lg" className="bg-[#D4A017] text-white">Verify Now</Button></Link>
              <Link to="/portal"><Button size="lg" variant="outline" className="bg-[#D4A017] text-white">Sign In</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

