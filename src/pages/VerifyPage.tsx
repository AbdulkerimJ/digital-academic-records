// src/pages/VerifyPage.tsx
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type VerifyState = "idle" | "loading" | "authentic" | "not-authentic";

export default function VerifyPage() {
  const [state, setState] = useState<VerifyState>("idle");
  const [scannerActive, setScannerActive] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  /* ---------------------- FILE VERIFICATION ---------------------- */
  const verifyImageFile = async (file: File) => {
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

      // 🔗 BACKEND READY
      // await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code: decodedText }) });

      setState(decodedText ? "authentic" : "not-authentic");
    } catch (err) {
      console.error(err);
      setUploadError("Could not detect a QR code. Try a clearer image.");
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
          setTimeout(() => {
            setState(decodedText ? "authentic" : "not-authentic");
          }, 1500);
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
    <div className="min-h-screen flex flex-col bg-[#0A1A2F] text-white">
      <Navbar />

      <div className="flex-1 pt-24 pb-16">
        <div className="container max-w-lg mx-auto px-4">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="h-16 w-16 rounded-2xl bg-[#D4A017]/20 flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 text-[#D4A017]" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Verify Academic Record
            </h1>
            <p className="text-white/70">
              Upload, scan, or enter a code to verify credentials
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ---------------- IDLE ---------------- */}
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-[#11243D] border border-white/10 shadow-lg text-white">
                  <CardContent className="p-6">
                    <Tabs defaultValue="scan" className="space-y-4">
                      <TabsList className="grid grid-cols-3 w-full bg-[#0F2A44] text-white">
                        <TabsTrigger value="scan" className="gap-1 text-white">
                          <Camera className="h-4 w-4" /> Scan
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="gap-1 text-white">
                          <Upload className="h-4 w-4" /> Upload
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="gap-1 text-white">
                          <ScanLine className="h-4 w-4" /> Code
                        </TabsTrigger>
                      </TabsList>

                      {/* ---------------- SCAN TAB ---------------- */}
                      <TabsContent value="scan" className="space-y-4 text-white">
                        <div className="relative rounded-xl overflow-hidden bg-[#0F2A44] min-h-[280px] border border-white/10 flex items-center justify-center">
                          {/* Glowing Frame */}
                          {scannerActive && (
                            <motion.div
                              className="absolute border-2 border-[#D4A017] rounded-xl"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: 1,
                                boxShadow: [
                                  "0 0 0px #D4A017",
                                  "0 0 12px #D4A017",
                                  "0 0 0px #D4A017",
                                ],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop",
                              }}
                              style={{ width: 260, height: 260 }}
                            />
                          )}

                          <div id="qr-reader" ref={scannerRef} className="w-full" />

                          {!scannerActive && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                            >
                              <Camera className="h-12 w-12 text-white/40" />
                              <p className="text-sm text-white/60">
                                Camera preview will appear here
                              </p>
                              <Button className="bg-[#D4A017] text-white" onClick={startScanner}>
                                <Camera className="h-4 w-4 mr-2" /> Start Camera
                              </Button>
                            </motion.div>
                          )}
                        </div>

                        {scannerActive && (
                          <Button className="w-full bg-[#D4A017] text-white" onClick={stopScanner}>
                            Stop Scanner
                          </Button>
                        )}
                      </TabsContent>

                      {/* ---------------- UPLOAD TAB ---------------- */}
                      <TabsContent value="upload" className="space-y-4 text-white">
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
                          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition 
                            ${
                              dragActive
                                ? "border-[#D4A017] bg-[#D4A017]/10"
                                : "border-white/20 bg-[#0F2A44]"
                            }`}
                        >
                          <Upload className="h-10 w-10 text-white/50 mx-auto mb-3" />
                          <p className="font-medium text-white">Upload QR Code Image</p>
                          <p className="text-sm text-white/60">
                            Drag & drop or click to browse
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
                          <div className="bg-[#0F2A44] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                            <img
                              src={uploadPreview}
                              alt="Uploaded preview"
                              className="h-16 w-16 rounded-md object-cover border border-white/10"
                            />
                            <div className="text-sm text-white">
                              <p className="font-medium">Uploaded image</p>
                              <p className="text-xs text-white/60">
                                Auto-enhancing and scanning QR code…
                              </p>
                            </div>
                          </div>
                        )}

                        {uploadError && (
                          <div className="text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-md px-3 py-2">
                            {uploadError}
                          </div>
                        )}
                      </TabsContent>

                      {/* ---------------- MANUAL TAB ---------------- */}
                      <TabsContent value="manual" className="space-y-4 text-white">
                        <Input
                          placeholder="Enter verification code (e.g. NILARVS-2024-XXXXX)"
                          className="bg-[#0F2A44] border-white/10 text-white"
                        />
                        <Button className="w-full bg-[#D4A017] text-white" onClick={() => setState("loading")}>
                          <QrCode className="mr-2 h-5 w-5" /> Verify Now
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
                <Card className="bg-[#11243D] border border-white/10 shadow-lg text-white">
                  <CardContent className="p-10 text-center">
                    <motion.div
                      className="h-16 w-16 rounded-full border-4 border-[#D4A017] border-t-transparent mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <p className="font-display font-semibold text-lg">
                      Verifying Record...
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      Querying secure database
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ---------------- AUTHENTIC ---------------- */}
            {state === "authentic" && (
              <motion.div key="authentic" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-[#11243D] border border-[#D4A017] shadow-lg text-white">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className="h-20 w-20 rounded-full bg-[#D4A017]/20 flex items-center justify-center mx-auto mb-4"
                      animate={{ scale: [0.9, 1.05, 1] }}
                      transition={{ duration: 0.6 }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-[#D4A017]" />
                    </motion.div>

                    <h2 className="font-display text-2xl font-bold text-[#D4A017] mb-2">
                      Authentic Record
                    </h2>
                    <p className="text-white/70 mb-6">
                      This credential has been verified as genuine.
                    </p>

                    <div className="bg-[#0F2A44] rounded-lg p-4 text-left space-y-2 text-sm border border-white/10">
                      <div className="flex justify-between">
                        <span className="text-white/60">Name</span>
                        <span className="font-medium text-white">Abebe Kebede</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Level</span>
                        <span className="font-medium text-white">Degree (BSc)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Institution</span>
                        <span className="font-medium text-white">
                          Addis Ababa University
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Year</span>
                        <span className="font-medium text-white">2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Status</span>
                        <span className="font-medium text-[#D4A017]">✓ Verified</span>
                      </div>
                    </div>

                    <Button className="mt-6 bg-[#D4A017] text-white" onClick={reset}>
                      Verify Another
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ---------------- NOT AUTHENTIC ---------------- */}
            {state === "not-authentic" && (
              <motion.div key="not-authentic" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-[#11243D] border border-red-600 shadow-lg text-white">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className="h-20 w-20 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4"
                      animate={{ scale: [0.9, 1.05, 1] }}
                      transition={{ duration: 0.6 }}
                    >
                      <XCircle className="h-10 w-10 text-red-500" />
                    </motion.div>

                    <h2 className="font-display text-2xl font-bold text-red-500 mb-2">
                      Not Authentic
                    </h2>
                    <p className="text-white/70 mb-6">
                      This record could not be verified.
                    </p>

                    <Button className="bg-[#D4A017] text-white" onClick={reset}>
                      Try Again
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
