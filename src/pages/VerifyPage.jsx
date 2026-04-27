import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  Upload,
  CheckCircle2,
  XCircle,
  Camera,
  ScanLine,
  ShieldCheck,
  Search,
  FileSearch
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function VerifyPage() {
  const [state, setState] = useState("idle");
  const [verifiedData, setVerifiedData] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  /* ---------------------- FILE VERIFICATION ---------------------- */
  const verifyImageFile = async (file) => {
    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File is too large. Max size is 5MB.");
      return;
    }

    const previewURL = URL.createObjectURL(file);
    setUploadPreview(previewURL);

    try {
      setState("loading");

      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("qr-file-reader");

      const decodedText = await qr.scanFile(file, true); // enhanced mode
      await qr.clear();

      // Call backend to verify
      const res = await api.get(`/verify/${decodedText}`);
      if (res.data.success) {
        setVerifiedData(res.data.data);
        setState("authentic");
      } else {
        setState("not-authentic");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Could not detect a QR code or record is invalid.");
      setState("not-authentic");
    }
  };

  /* ---------------------- CAMERA SCANNER ---------------------- */
  const startScanner = async () => {
    setScannerActive(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          stopScanner();
          setState("loading");
          api.get(`/verify/${decodedText}`).then(res => {
            if (res.data.success) {
              setVerifiedData(res.data.data);
              setState("authentic");
            } else {
              setState("not-authentic");
            }
          }).catch(() => {
            setState("not-authentic");
          });
        }
      );
    } catch {
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const reset = () => {
    setState("idle");
    stopScanner();
    setUploadPreview(null);
    setUploadError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <div className="flex-1 pt-32 pb-16 relative">
        {/* Institutional Background Element */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-secondary/30 border-b border-border pointer-events-none" />
        
        <div className="container max-w-lg mx-auto px-4 relative z-10">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="h-20 w-20 bg-primary flex items-center justify-center mx-auto mb-6 shadow-xl rounded-sm">
              <ShieldCheck className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-2 text-primary">
              Record Verification
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-accent">
              National Academic Registry
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ---------------- IDLE ---------------- */}
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-card border border-border shadow-2xl rounded-sm academic-border">
                  <CardContent className="p-6">
                    <Tabs defaultValue="scan" className="space-y-6">
                      <TabsList className="grid grid-cols-3 w-full bg-secondary/50 p-1 rounded-sm">
                        <TabsTrigger value="scan" className="gap-2 uppercase text-[10px] font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm">
                          <Camera className="h-3 w-3" /> Scan
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="gap-2 uppercase text-[10px] font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm">
                          <Upload className="h-3 w-3" /> Upload
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="gap-2 uppercase text-[10px] font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm">
                          <ScanLine className="h-3 w-3" /> Code
                        </TabsTrigger>
                      </TabsList>

                      {/* ---------------- SCAN TAB ---------------- */}
                      <TabsContent value="scan" className="space-y-4">
                        <div className="relative rounded-sm overflow-hidden bg-background min-h-[280px] border border-border flex items-center justify-center">
                          {/* Formal Scanning Frame */}
                          {scannerActive && (
                            <motion.div
                              className="absolute border-2 border-accent rounded-sm"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: 1,
                                boxShadow: "0 0 15px hsl(var(--accent) / 0.2)",
                              }}
                              style={{ width: 220, height: 220 }}
                            >
                              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-accent" />
                              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-accent" />
                              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-accent" />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-accent" />
                            </motion.div>
                          )}

                          <div id="qr-reader" ref={scannerRef} className="w-full" />

                          {!scannerActive && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
                            >
                              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                                <Camera className="h-8 w-8 text-primary/40" />
                              </div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Camera Authorization Required
                              </p>
                              <Button className="bg-primary text-primary-foreground rounded-sm uppercase text-xs font-bold tracking-widest h-12 px-6 shadow-md hover:bg-primary/90" onClick={startScanner}>
                                <Camera className="h-4 w-4 mr-2" /> Activate Scanner
                              </Button>
                            </motion.div>
                          )}
                        </div>

                        {scannerActive && (
                          <Button variant="outline" className="w-full border-primary text-primary rounded-sm uppercase text-xs font-bold tracking-widest h-12" onClick={stopScanner}>
                            Cancel Scan
                          </Button>
                        )}
                      </TabsContent>

                      {/* ---------------- UPLOAD TAB ---------------- */}
                      <TabsContent value="upload" className="space-y-4">
                        <motion.div
                          onDragEnter={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) verifyImageFile(file);
                          }}
                          onClick={() => document.getElementById("fileInput")?.click()}
                          className={`border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all 
                            ${
                              dragActive
                                ? "border-accent bg-accent/5"
                                : "border-border bg-background hover:bg-secondary/20"
                            }`}
                        >
                          <div className="h-16 w-16 bg-secondary flex items-center justify-center rounded-full mx-auto mb-4">
                            <Upload className="h-8 w-8 text-primary/60" />
                          </div>
                          <p className="font-display font-bold text-primary mb-1 text-lg">Upload Digital Record</p>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            Drop JPEG or PNG file here
                          </p>

                          <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) verifyImageFile(file);
                            }}
                          />
                        </motion.div>

                        {uploadPreview && (
                          <div className="bg-secondary/30 border border-border rounded-sm p-4 flex items-center gap-4">
                            <img
                              src={uploadPreview}
                              alt="Uploaded preview"
                              className="h-16 w-16 rounded-sm object-cover border border-border shadow-sm"
                            />
                            <div className="text-[11px] space-y-1">
                              <p className="font-bold text-primary uppercase tracking-tighter">Document Received</p>
                              <p className="text-muted-foreground italic">
                                Analyzing cryptographic signatures...
                              </p>
                            </div>
                          </div>
                        )}

                        {uploadError && (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-destructive bg-destructive/5 border border-destructive/20 rounded-sm px-4 py-3">
                            {uploadError}
                          </div>
                        )}
                      </TabsContent>

                      {/* ---------------- MANUAL TAB ---------------- */}
                      <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Verification Reference Code</label>
                           <Input
                              placeholder="e.g. NAR-2024-XXXXX"
                              className="bg-background border-border text-foreground rounded-sm h-12 focus:ring-1 focus:ring-primary transition-all"
                           />
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground rounded-sm uppercase text-xs font-bold tracking-widest h-12 shadow-md hover:bg-primary/90" onClick={() => setState("loading")}>
                          <Search className="mr-2 h-4 w-4" /> Query Registry
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ---------------- LOADING ---------------- */}
            {state === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-card border border-border shadow-2xl rounded-sm academic-border">
                  <CardContent className="p-16 text-center">
                    <motion.div
                      className="h-16 w-16 rounded-full border-2 border-primary border-t-accent mx-auto mb-6"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    />
                    <h3 className="font-display font-bold text-2xl text-primary mb-2">
                      Registry Query in Progress
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Establishing Secure Connection
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ---------------- AUTHENTIC ---------------- */}
            {state === "authentic" && (
              <motion.div key="authentic" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-card border-2 border-accent shadow-2xl rounded-sm academic-border overflow-hidden">
                  <div className="bg-accent/5 p-8 text-center border-b border-border">
                    <motion.div
                      className="h-20 w-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-xl border border-accent/20"
                      animate={{ scale: [0.95, 1.05, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-accent" />
                    </motion.div>

                    <h2 className="font-display text-3xl font-bold text-primary mb-1">
                      Record Verified
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                      Authentic National Credential
                    </p>
                  </div>

                  <CardContent className="p-8">
                    <div className="space-y-4 font-body">
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Legal Name</span>
                        <span className="font-bold text-primary text-right">{verifiedData?.studentName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Academic Level</span>
                        <span className="font-bold text-primary text-right">{verifiedData?.level}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Institution</span>
                        <span className="font-bold text-primary text-right">
                          {verifiedData?.institution}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Field of Study</span>
                        <span className="font-bold text-primary text-right">{verifiedData?.fieldOfStudy}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conferral Year</span>
                        <span className="font-bold text-primary text-right">{verifiedData?.year}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Status</span>
                        <span className="px-3 py-1 bg-accent/10 text-accent font-bold text-xs rounded-sm">ACTIVE</span>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-3">
                       <Button className="w-full bg-primary text-primary-foreground rounded-sm uppercase text-xs font-bold tracking-widest h-12 shadow-md" onClick={reset}>
                         Verify Another Record
                       </Button>
                       <Button variant="ghost" className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                         Download Official Audit Trail
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ---------------- NOT AUTHENTIC ---------------- */}
            {state === "not-authentic" && (
              <motion.div key="not-authentic" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-card border-2 border-destructive shadow-2xl rounded-sm academic-border">
                  <CardContent className="p-10 text-center">
                    <motion.div
                      className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6 shadow-inner"
                      animate={{ scale: [0.95, 1.05, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <XCircle className="h-12 w-12 text-destructive" />
                    </motion.div>

                    <h2 className="font-display text-3xl font-bold text-destructive mb-2">
                      Verification Failed
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium italic mb-8">
                      This record could not be matched with any official registry entries.
                    </p>

                    <Button className="bg-primary text-primary-foreground rounded-sm uppercase text-xs font-bold tracking-widest h-12 px-8 shadow-md" onClick={reset}>
                      Reset and Try Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />

      {/* Hidden div for file scanning */}
      <div id="qr-file-reader" className="hidden" />
    </div>
  );
}

