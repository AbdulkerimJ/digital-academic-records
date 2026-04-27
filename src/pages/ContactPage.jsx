import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Landmark, Send, Info, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

/* ---------------- FAQ Section ---------------- */
function FAQ() {
  const items = [
    {
      q: "How long does verification take?",
      a: "Most verifications are instant. However, institutional manual audits may take up to 2 business days.",
    },
    {
      q: "Can I update my academic record?",
      a: "Yes. Please submit an official correction request through the Registrar Console of your institution.",
    },
    {
      q: "Is NAR linked to the National ID Registry?",
      a: "Yes. All records are cryptographically linked to the National ID for absolute identity assurance.",
    },
  ];

  return (
    <div className="mt-24">
      <div className="flex items-center gap-2 mb-8">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-bold text-primary">Frequently Asked Questions</h2>
      </div>
      <div className="grid gap-4">
        {items.map((item, i) => (
          <motion.details
            key={i}
            className="bg-card border border-border rounded-sm p-6 academic-border group"
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <summary className="cursor-pointer text-primary font-bold text-sm uppercase tracking-widest list-none flex items-center justify-between">
              {item.q}
              <span className="text-accent group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed border-t border-border pt-4">
              {item.a}
            </p>
          </motion.details>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Main Contact Page ---------------- */
export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      const res = await api.post("/contact", form);
      setStatus({
        type: "success",
        text: res.data?.message || "Your formal inquiry has been logged. Our support division will respond via official channels.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Transmission failure. Please contact the help desk directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: "Registry Email", value: "support@nar.gov.et" },
    { icon: Phone, label: "Official Hotline", value: "+251 911 000 000" },
    { icon: MapPin, label: "Registry Headquarters", value: "Addis Ababa, Ethiopia" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Institutional Background Element */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-secondary/20 border-b border-border pointer-events-none" />

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="h-1 bg-accent w-24 mx-auto mb-8 rounded-full" />
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
              Institutional Support
            </h1>
            <p className="text-xs uppercase tracking-[0.4em] font-bold text-accent mb-6">
              National Registry Help Desk
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-body">
              For technical inquiries, institutional onboarding, or record verification assistance, 
              please establish contact through our official communication channels.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-card border border-border shadow-sm rounded-sm academic-border h-full text-center">
                  <CardContent className="p-8">
                    <div className="h-14 w-14 rounded-sm bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <item.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                      {item.label}
                    </h2>
                    <p className="text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
             <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-sm shadow-xl p-10 academic-border"
                >
                  <h2 className="font-display text-2xl font-bold text-primary mb-8 border-b border-border pb-4">
                    Formal Inquiry Form
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Full Name</Label>
                        <Input
                          value={form.name}
                          onChange={handleChange("name")}
                          placeholder="Hon. John Doe"
                          className="rounded-sm border-border h-12 focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Official Email</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={handleChange("email")}
                          placeholder="j.doe@institution.edu"
                          className="rounded-sm border-border h-12 focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Inquiry Subject</Label>
                      <Input
                        value={form.subject}
                        onChange={handleChange("subject")}
                        placeholder="e.g. Institutional Onboarding Request"
                        className="rounded-sm border-border h-12 focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Message Detail</Label>
                      <Textarea
                        value={form.message}
                        onChange={handleChange("message")}
                        placeholder="Please provide comprehensive details regarding your inquiry..."
                        rows={6}
                        className="rounded-sm border-border focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {status && (
                      <div className={`p-4 rounded-sm border text-[10px] font-bold uppercase tracking-widest text-center ${
                        status.type === "success" 
                          ? "bg-success/5 border-success text-success" 
                          : "bg-destructive/5 border-destructive text-destructive"
                      }`}>
                        {status.text}
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full bg-primary text-primary-foreground rounded-sm h-14 uppercase text-xs font-bold tracking-[0.2em] shadow-lg hover:bg-primary/90"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Transmitting..." : "Submit Formal Inquiry"}
                    </Button>
                  </form>
                </motion.div>
             </div>

             <div className="lg:col-span-2 space-y-8">
                <div className="bg-secondary/30 border border-border p-8 rounded-sm">
                   <div className="flex items-center gap-3 mb-4">
                      <Landmark className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-bold text-lg text-primary">Office Hours</h3>
                   </div>
                   <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-border/50 pb-2">
                         <span className="text-muted-foreground">Monday – Friday</span>
                         <span className="font-bold">08:30 – 17:30</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                         <span className="text-muted-foreground">Saturday</span>
                         <span className="font-bold">09:00 – 12:30</span>
                      </div>
                      <div className="flex justify-between text-accent">
                         <span>Sunday</span>
                         <span className="font-bold uppercase text-[10px]">Closed</span>
                      </div>
                   </div>
                </div>

                <div className="bg-primary p-8 rounded-sm text-primary-foreground shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Send className="h-24 w-24 rotate-12" />
                   </div>
                   <h3 className="font-display font-bold text-xl mb-4 relative z-10">Urgent Verification?</h3>
                   <p className="text-sm opacity-90 leading-relaxed relative z-10 mb-6">
                      For immediate verification requirements, please utilize the automated registry portal accessible via the main navigation.
                   </p>
                   <Link to="/verify" className="block w-full">
                      <Button variant="outline" className="w-full border-white/30 hover:bg-white/10 text-white rounded-sm text-[10px] uppercase font-bold tracking-widest">
                         Go to Verification
                      </Button>
                   </Link>
                </div>
             </div>
          </div>

          <FAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
}

