// src/pages/ContactPage.tsx
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Sparkles, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/* ---------------- Floating Gold Particles Background ---------------- */
function FloatingParticles() {
  const particles = Array.from({ length: 22 });

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

/* ---------------- Floating Follow Card ---------------- */
function FloatingFollowCard() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      className="fixed inset-0 pointer-events-none z-40"
    >
      <motion.div
        animate={{ x: pos.x + 20, y: pos.y + 20 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="hidden md:block bg-[#0F2A44]/80 backdrop-blur border border-white/10 text-white px-4 py-2 rounded-xl shadow-xl"
      >
        <p className="text-xs">Need help? We&apos;re here.</p>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Success Glow + Confetti ---------------- */
function SuccessGlow() {
  const confetti = Array.from({ length: 40 });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.8 }}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <div className="absolute inset-0 bg-[#D4A017]/10 blur-3xl" />
      {confetti.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-3 rounded-sm bg-[#D4A017]"
          style={{
            left: `${(i * 23) % 100}%`,
            top: `${(i * 17) % 100}%`,
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: [0, 40, 80], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5 + (i % 5) * 0.1 }}
        />
      ))}
    </motion.div>
  );
}

/* ---------------- Chatbot Bubble ---------------- */
function ChatbotBubble() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#0F2A44] border border-white/10 p-4 rounded-xl w-72 mb-3 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-[#D4A017]/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#D4A017]" />
              </div>
              <p className="text-sm font-medium text-white">NILARVS Assistant</p>
            </div>
            <p className="text-xs text-white/80 mb-3">
              This is a demo assistant. Type your question and we&apos;ll respond via email.
            </p>
            <Input
              placeholder="Type a message..."
              className="bg-[#11243D] border-white/10 text-sm mb-2"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-xs"
                onClick={() => setMsg("")}
              >
                Clear
              </Button>
              <Button size="sm" className="bg-[#D4A017] text-black text-xs">
                Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        className="h-14 w-14 rounded-full bg-[#D4A017] text-black flex items-center justify-center shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </div>
  );
}

/* ---------------- FAQ Accordion ---------------- */
function FAQ() {
  const items = [
    {
      q: "How long does verification take?",
      a: "Most verifications are instant, but manual checks may take up to 24 hours.",
    },
    {
      q: "Can I update my academic record?",
      a: "Yes. Submit a correction request through your student or registrar portal.",
    },
    {
      q: "Is NILARVS connected to National ID?",
      a: "Yes. All records are securely linked to your FAYDA ID with strict access controls.",
    },
  ];

  return (
    <div className="mt-12">
      <h2 className="font-display text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.details
            key={i}
            className="bg-[#0F2A44]/80 backdrop-blur border border-white/10 rounded-xl p-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <summary className="cursor-pointer text-white font-medium">
              {item.q}
            </summary>
            <p className="text-white/70 mt-2 text-sm">{item.a}</p>
          </motion.details>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Live Typing Assistant Text ---------------- */
function TypingHeadline() {
  const phrases = [
    "Secure. Verified. Trusted.",
    "National ID–Linked Academic Records.",
    "Verification without friction.",
  ];
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (display.length < current.length) {
          setDisplay(current.slice(0, display.length + 1));
        } else {
          setDeleting(true);
        }
      } else {
        if (display.length > 0) {
          setDisplay(current.slice(0, display.length - 1));
        } else {
          setDeleting(false);
          setIndex((i) => (i + 1) % phrases.length);
        }
      }
    }, deleting ? 60 : 90);

    return () => clearTimeout(timeout);
  }, [display, deleting, index, phrases]);

  return (
    <div className="mt-3 text-sm text-[#D7D4CC] h-5">
      <span className="opacity-80">{display}</span>
      <span className="inline-block w-2 h-4 bg-[#D4A017] ml-1 animate-pulse" />
    </div>
  );
}

/* ---------------- 3D Parallax Hero Wrapper ---------------- */
function ParallaxHero({ children }: { children: React.ReactNode }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setTilt({ x, y });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      className="relative"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: tilt.y * -10,
          rotateY: tilt.x * 10,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Main Contact Page ---------------- */
export default function ContactPage(): JSX.Element {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showGlow, setShowGlow] = useState(false);

  const handleChange =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      return "Please enter a valid email address.";
    if (!form.subject.trim()) return "Please add a subject.";
    if (!form.message.trim() || form.message.trim().length < 10)
      return "Message must be at least 10 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const err = validate();
    if (err) {
      setStatus({ type: "error", text: err });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Network error");
      setStatus({
        type: "success",
        text: "Message sent — we will get back to you within 2 business days.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setShowGlow(true);
      setTimeout(() => setShowGlow(false), 1800);
    } catch {
      setStatus({
        type: "error",
        text: "Failed to send message. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: "Email", value: "support@nilarvs.gov" },
    { icon: Phone, label: "Phone", value: "+251 911 000 000" },
    { icon: MapPin, label: "Location", value: "Addis Ababa, Ethiopia" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1A2F] text-[#F7F4EE] relative overflow-hidden">
      <Navbar />
      <FloatingParticles />
      <FloatingFollowCard />
      <ChatbotBubble />
      {showGlow && <SuccessGlow />}

      {/* Spotlight Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#D4A017]/10 blur-[200px] rounded-full pointer-events-none" />

      <div className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* 3D Parallax Hero */}
            <ParallaxHero>
              <div className="text-center mb-12">
                <motion.h1
                  className="font-display text-5xl font-bold bg-gradient-to-r from-[#D4A017] to-[#F7F4EE] bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  Contact Us
                </motion.h1>

                <p className="text-[#D7D4CC] text-lg max-w-2xl mx-auto mt-3">
                  Have questions about NILARVS? Reach out using the form below or
                  contact us directly.
                </p>

                <TypingHeadline />
              </div>
            </ParallaxHero>

            {/* Contact Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="relative bg-[#0F2A44]/80 backdrop-blur border border-white/10 hover:border-[#D4A017]/40 transition-all group">
                    <CardContent className="p-6 text-center">
                      {/* Map Pin Pulse for Location */}
                      {item.label === "Location" && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.05, 0.2] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="h-20 w-20 rounded-full bg-[#D4A017]/10 blur-xl" />
                        </motion.div>
                      )}

                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 6 }}
                        className="h-12 w-12 rounded-lg bg-[#D4A017]/10 flex items-center justify-center mx-auto mb-4 relative z-10"
                      >
                        <item.icon className="h-6 w-6 text-[#D4A017]" />
                      </motion.div>

                      <p className="font-display font-semibold text-sm text-white mb-1 relative z-10">
                        {item.label}
                      </p>

                      <motion.p
                        className="text-sm text-white relative z-10 cursor-pointer inline-block"
                        whileHover={{ textShadow: "0px 0px 8px rgba(255,255,255,0.8)" }}
                      >
                        <span className="relative after:absolute after:left-0 after:-bottom-0.5 after:w-0 after:h-[2px] after:bg-[#D4A017] after:transition-all after:duration-300 group-hover:after:w-full">
                          {item.value}
                        </span>
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-[#11243D]/90 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl mt-10"
            >
              <h2 className="font-display text-2xl font-semibold mb-6">
                Send us a message
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm">Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Your name"
                    className="bg-[#0F2A44] border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="you@example.com"
                    className="bg-[#0F2A44] border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-sm">Subject</Label>
                <Input
                  value={form.subject}
                  onChange={handleChange("subject")}
                  placeholder="How can we help?"
                  className="bg-[#0F2A44] border-white/10"
                />
              </div>

              <div className="space-y-2 mb-6">
                <Label className="text-sm">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={handleChange("message")}
                  placeholder="Tell us more..."
                  rows={8}
                  className="bg-[#0F2A44] border-white/10"
                />
              </div>

              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded ${
                    status.type === "success"
                      ? "bg-green-900/40 border border-green-600"
                      : "bg-red-900/40 border border-red-600"
                  }`}
                >
                  <div className="text-sm">{status.text}</div>
                </motion.div>
              )}

              <Button
                size="lg"
                className="bg-[#D4A017] text-black font-semibold w-full sm:w-auto mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </motion.form>

            {/* FAQ */}
            <FAQ />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
