// src/pages/RegistrarDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Search as SearchIcon,
  Users,
  FileEdit,
  Clock,
  FileUp,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  addCorrectionMessage,
  loadCorrectionMessages,
  loadCorrectionThreads,
  onCorrectionUpdate,
  type CorrectionMessage,
  type CorrectionThread,
  updateCorrectionThread,
} from "@/lib/correctionStore";

/* ---------------- Types ---------------- */
type ActivityType = "upload" | "correction" | "search" | "login" | "logout" | "export";

type Activity = {
  id: string;
  type: ActivityType;
  message: string;
  registrarId: string;
  timestamp: string;
};

type CorrectionStatus = "Pending" | "Approved" | "Rejected";

type Correction = CorrectionThread;

type StudentRecord = {
  nationalId: string;
  studentId: string;
  name: string;
  department: string;
  gpa: string; // form string; validated as number
  year: string;
  level: string;
  exitExam?: string;
  photoUrl?: string | null;
  certificateFileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
};

/* ---------------- Sample data ---------------- */
const initialActivities: Activity[] = [
  { id: "a1", type: "login", message: "Registrar logged in", registrarId: "REG-001", timestamp: new Date().toISOString() },
];

const initialRecords: StudentRecord[] = [
  {
    nationalId: "123456789012",
    studentId: "STU-001",
    name: "Amanuel Bekele",
    department: "Computer Science",
    gpa: "3.78",
    year: "2024",
    level: "Bachelor Degree",
    exitExam: "92%",
    photoUrl: null,
    certificateFileName: "Amanuel_Bekele_Bachelor.pdf",
    uploadedBy: "REG-001",
    uploadedAt: "2026-04-09T10:12:00.000Z",
  },
  {
    nationalId: "210987654321",
    studentId: "STU-002",
    name: "Lulit Alemu",
    department: "Business Administration",
    gpa: "3.45",
    year: "2023",
    level: "Bachelor Degree",
    exitExam: "88%",
    photoUrl: null,
    certificateFileName: "Lulit_Alemu_Bachelor.pdf",
    uploadedBy: "REG-001",
    uploadedAt: "2026-04-08T14:22:00.000Z",
  },
  {
    nationalId: "098765432109",
    studentId: "STU-003",
    name: "Hanna Tesfaye",
    department: "Electrical Engineering",
    gpa: "3.90",
    year: "2024",
    level: "Bachelor Degree",
    exitExam: "95%",
    photoUrl: null,
    certificateFileName: "Hanna_Tesfaye_Bachelor.pdf",
    uploadedBy: "REG-001",
    uploadedAt: "2026-04-06T09:40:00.000Z",
  },
];

/* ---------------- CSV parsing (simple) ---------------- */
const REQUIRED_COLUMNS = ["national_id", "student_id", "name", "department", "gpa", "year", "level"];

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [], errors: ["Empty file"] };
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((r) => r.split(",").map((c) => c.trim()));
  const errors: string[] = [];
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length) errors.push(`Missing required columns: ${missing.join(", ")}`);
  rows.forEach((row, i) => {
    if (row.length !== headers.length) errors.push(`Row ${i + 2} has ${row.length} columns; expected ${headers.length}.`);
    const idxNational = headers.indexOf("national_id");
    const idxGpa = headers.indexOf("gpa");
    if (idxNational >= 0 && (!/^\d{12}$/.test(row[idxNational] ?? ""))) errors.push(`Row ${i + 2}: National ID must be exactly 12 numeric digits.`);
    if (idxGpa >= 0) {
      const g = parseFloat(row[idxGpa] ?? "");
      if (Number.isNaN(g) || g < 1.0 || g > 4.0) errors.push(`Row ${i + 2}: GPA must be between 1.0 and 4.0.`);
    }
  });
  return { headers, rows, errors };
}

/* ---------------- Validation helpers (strict) ---------------- */
function validateNationalId(id: string): string | null {
  if (!/^\d{12}$/.test(id)) return "National ID must be exactly 12 numeric digits";
  return null;
}

function validateGpa(gpaStr: string): string | null {
  if (!/^\d+(\.\d+)?$/.test(gpaStr)) return "GPA must be between 1.0 and 4.0";
  const g = Number(gpaStr);
  if (Number.isNaN(g) || g < 1.0 || g > 4.0) return "GPA must be between 1.0 and 4.0";
  return null;
}

/* ---------------- Component start ---------------- */
export default function RegistrarDashboard(): JSX.Element {
  const { toast } = useToast();
  const navigate = useNavigate();

  // UI state
  const [activeView, setActiveView] = useState<"dashboard" | "upload" | "corrections" | "activities">("dashboard");
  const [loading, setLoading] = useState(false);

  // form state for upload
  const [uploadForm, setUploadForm] = useState<StudentRecord>({
    nationalId: "",
    studentId: "",
    name: "",
    department: "",
    gpa: "",
    year: "",
    level: "",
    exitExam: "",
    photoUrl: null,
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // CSV bulk
  const [csvText, setCsvText] = useState<string | null>(null);
  const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);
  const [csvParseResult, setCsvParseResult] = useState<{ headers: string[]; rows: string[][]; errors: string[] } | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  // data stores (in-memory simulation)
  const [records, setRecords] = useState<StudentRecord[]>(initialRecords);
  const [corrections, setCorrections] = useState<Correction[]>(loadCorrectionThreads);
  const [correctionMessages, setCorrectionMessages] = useState<CorrectionMessage[]>(loadCorrectionMessages);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  // search & suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"all" | "name" | "nationalId" | "studentId">("all");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<StudentRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<StudentRecord | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // selection / dialogs
  const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null);
  const [activeCorrectionThread, setActiveCorrectionThread] = useState<Correction | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // registrar identity (simulated)
  const registrarId = "REG-001";

  /* ---------------- derived values ---------------- */
  const pendingCorrectionsCount = useMemo(() => corrections.filter((c) => c.status === "Pending").length, [corrections]);
  const totalStudents = records.length;
  const totalUploads = activities.filter((a) => a.type === "upload").length;
  const recentVerifications = activities.filter((a) => a.type === "correction").length;

  useEffect(() => {
    const sync = () => {
      setCorrections(loadCorrectionThreads());
      setCorrectionMessages(loadCorrectionMessages());
      if (activeCorrectionThread) {
        const updated = loadCorrectionThreads().find((thread) => thread.id === activeCorrectionThread.id);
        if (updated) setActiveCorrectionThread(updated);
      }
    };

    sync();
    return onCorrectionUpdate(sync);
  }, [activeCorrectionThread]);

  /* ---------------- helpers ---------------- */
  function logActivity(type: ActivityType, message: string) {
    const a: Activity = { id: `a-${Date.now()}`, type, message, registrarId, timestamp: new Date().toISOString() };
    setActivities((p) => [a, ...p]);
  }

  /* ---------------- handlers (start) ---------------- */
  const handleUploadSubmit = () => {
    const errors: Record<string, string> = {};
    const nidError = validateNationalId(uploadForm.nationalId);
    if (nidError) errors.nationalId = nidError;
    const gpaError = validateGpa(uploadForm.gpa);
    if (gpaError) errors.gpa = gpaError;
    if (!uploadForm.studentId) errors.studentId = "Student ID is required";
    if (!uploadForm.department) errors.department = "Department is required";
    if (!uploadForm.year) errors.year = "Graduation year is required";
    if (!uploadForm.level) errors.level = "Academic level is required";
    if (!certificateFile) errors.certificateFile = "Certificate file is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({ title: "Validation Error", description: "Please fix form errors.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const saved: StudentRecord = {
      ...uploadForm,
      certificateFileName: certificateFile?.name,
      uploadedBy: registrarId,
      uploadedAt: new Date().toISOString(),
    };
    setTimeout(() => {
      setRecords((p) => [saved, ...p]);
      logActivity("upload", `Uploaded record for ${saved.name || saved.studentId} (${saved.nationalId})`);
      toast({ title: "Saved", description: "Record saved and logged." });
      setUploadForm({ nationalId: "", studentId: "", name: "", department: "", gpa: "", year: "", level: "", exitExam: "", photoUrl: null });
      setCertificateFile(null);
      setFormErrors({});
      setActiveView("dashboard");
      setLoading(false);
    }, 600);
  };

  const handleCsvFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({ title: "Invalid file", description: "Please upload a CSV file.", variant: "destructive" });
      return;
    }
    try {
      const text = await file.text();
      setCsvText(text);
      setCsvFileName(file.name);
      const parsed = parseCsv(text);
      setCsvParseResult(parsed);
      setCsvPreviewOpen(true);
    } catch {
      toast({ title: "Read error", description: "Could not read the CSV file.", variant: "destructive" });
    }
  };

  const confirmCsvUpload = (rows: Record<string, string>[]) => {
    const added: StudentRecord[] = [];
    rows.forEach((r) => {
      const rec: StudentRecord = {
        nationalId: r["national_id"] ?? "",
        studentId: r["student_id"] ?? "",
        name: r["name"] ?? "",
        department: r["department"] ?? "",
        gpa: r["gpa"] ?? "",
        year: r["year"] ?? "",
        level: r["level"] ?? "",
        exitExam: r["exit_exam"] ?? undefined,
        photoUrl: null,
        certificateFileName: undefined,
        uploadedBy: registrarId,
        uploadedAt: new Date().toISOString(),
      };
      added.push(rec);
    });
    setRecords((p) => [...added, ...p]);
    logActivity("upload", `Bulk CSV uploaded (${rows.length} records) by ${registrarId}`);
    toast({ title: "CSV Uploaded", description: `${rows.length} records uploaded (simulated).` });
    setCsvPreviewOpen(false);
    setCsvText(null);
    setCsvParseResult(null);
    setCsvFileName(null);
    setActiveView("dashboard");
  };

  const runSearch = (q?: string) => {
    const term = (q ?? searchQuery).trim().toLowerCase();
    if (!term) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const matches = records
      .filter((r) => {
        if (searchScope === "name") return r.name.toLowerCase().includes(term);
        if (searchScope === "nationalId") return r.nationalId.includes(term);
        if (searchScope === "studentId") return r.studentId.toLowerCase().includes(term);
        return r.name.toLowerCase().includes(term) || r.nationalId.includes(term) || r.studentId.toLowerCase().includes(term);
      })
      .slice(0, 10);

    setSuggestions(matches);
    setSuggestionsOpen(true);
    logActivity("search", `Searched for "${term}" in ${searchScope === "all" ? "all fields" : searchScope}`);
  };

  const openEditRecord = (rec: StudentRecord) => {
    setSelectedRecord({ ...rec });
    setEditErrors({});
  };

  const saveEditedRecord = (rec: StudentRecord) => {
    const errs: Record<string, string> = {};
    const nidErr = validateNationalId(rec.nationalId);
    if (nidErr) errs.nationalId = nidErr;
    const gpaErr = validateGpa(rec.gpa);
    if (gpaErr) errs.gpa = gpaErr;
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      toast({ title: "Validation Error", description: "Fix errors before saving.", variant: "destructive" });
      return;
    }
    setRecords((p) => p.map((r) => (r.nationalId === rec.nationalId ? rec : r)));
    logActivity("correction", `Record edited for ${rec.name || rec.studentId} (${rec.nationalId})`);
    toast({ title: "Saved", description: "Record updated and logged." });
    setSelectedRecord(null);
  };

  const takeCorrectionAction = (id: string, action: "Approve" | "Reject") => {
    updateCorrectionThread(id, {
      status: action === "Approve" ? "Approved" : "Rejected",
      updatedAt: new Date().toISOString(),
    });
    addCorrectionMessage({
      id: `msg-${Date.now()}`,
      threadId: id,
      sender: "registrar",
      text: `Your correction request has been ${action === "Approve" ? "approved" : "rejected"}.`,
      timestamp: new Date().toISOString(),
    });
    setCorrections((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: action === "Approve" ? "Approved" : "Rejected",
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    if (activeCorrectionThread?.id === id) {
      setActiveCorrectionThread((prev) =>
        prev
          ? {
              ...prev,
              status: action === "Approve" ? "Approved" : "Rejected",
              updatedAt: new Date().toISOString(),
            }
          : prev
      );
    }
    logActivity("correction", `${action} correction ${id}`);
    toast({ title: `${action}`, description: `Correction ${action.toLowerCase()} recorded.` });
  };

  const handleCorrectionReply = () => {
    if (!activeCorrectionThread || !replyText.trim()) return;
    const message: CorrectionMessage = {
      id: `msg-${Date.now()}`,
      threadId: activeCorrectionThread.id,
      sender: "registrar",
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
    };
    addCorrectionMessage(message);
    updateCorrectionThread(activeCorrectionThread.id, {
      updatedAt: new Date().toISOString(),
    });
    setCorrectionMessages((prev) => [...prev, message]);
    setReplyText("");
    toast({ title: "Message sent", description: "Your reply was added to the correction thread." });
    logActivity("correction", `Replied to correction ${activeCorrectionThread.id}`);
  };

  const exportLogsAsPdf = () => {
    const html = `
      <html>
        <head><title>System Logs</title><style>body{font-family:Arial;color:#000}</style></head>
        <body><h1>System Logs</h1><ul>
        ${activities.map((a) => `<li>[${a.type.toUpperCase()}] ${a.message} — ${a.registrarId} — ${new Date(a.timestamp).toLocaleString()}</li>`).join("")}
        </ul></body></html>
    `;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
      toast({ title: "Export blocked", description: "Popup blocked. Allow popups to export logs.", variant: "destructive" });
      return;
    }
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
    logActivity("export", `Exported logs by ${registrarId}`);
  };

  /* ---------------- End of Part 1 ---------------- */
  /* ---------------- UI / JSX (Dashboard, Search, Upload view) ---------------- */
  useEffect(() => {
    // update suggestions as user types (client-side)
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const matches = records
      .filter((r) => r.name.toLowerCase().includes(q) || r.nationalId.includes(q))
      .slice(0, 6);
    setSuggestions(matches);
    setSuggestionsOpen(matches.length > 0);
  }, [searchQuery, records]);

  const selectSuggestion = (r: StudentRecord) => {
    setSelectedRecord(r);
    setSuggestionsOpen(false);
    setSearchQuery(r.name);
    logActivity("search", `Searched and opened ${r.name} (${r.nationalId})`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071226] to-[#0A1A2F] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#071A2B] border-r border-white/6 p-5 text-white flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#D4A017]/20 to-[#D4A017]/5 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-[#D4A017]" />
          </div>
          <div>
            <div className="font-display font-bold text-white">Registrar Console</div>
            <div className="text-xs text-white/70"></div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeView === "dashboard" ? "bg-[#0F2A44]" : "hover:bg-[#0F2A44]/40"}`}
                onClick={() => setActiveView("dashboard")}
              >
                <span className="font-medium text-white">Dashboard</span>
              </button>
            </li>

            <li>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeView === "upload" ? "bg-[#0F2A44]" : "hover:bg-[#0F2A44]/40"}`}
                onClick={() => setActiveView("upload")}
              >
                <FileUp className="h-4 w-4 text-white/90" />
                <span className="font-medium text-white">Upload Records</span>
              </button>
            </li>

            <li>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 justify-between ${activeView === "corrections" ? "bg-[#0F2A44]" : "hover:bg-[#0F2A44]/40"}`}
                onClick={() => setActiveView("corrections")}
              >
                <div className="flex items-center gap-3">
                  <FileEdit className="h-4 w-4 text-white/90" />
                  <span className="font-medium text-white">Correction Requests</span>
                </div>
                <Badge className="bg-red-600 text-white text-xs">{pendingCorrectionsCount}</Badge>
              </button>
            </li>

            <li>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeView === "activities" ? "bg-[#0F2A44]" : "hover:bg-[#0F2A44]/40"}`}
                onClick={() => setActiveView("activities")}
              >
                <Clock className="h-4 w-4 text-white/90" />
                <span className="font-medium text-white">Recent Activities</span>
              </button>
            </li>

            <li>
              <button
                className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-[#0F2A44]/40"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <ChevronRight className="h-4 w-4 text-white/90" />
                <span className="font-medium text-white">Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="mt-6 text-xs text-white/70">
          <div>Registrar ID: <span className="text-white font-medium">{registrarId}</span></div>
          <div className="mt-2">All actions are logged for audit.</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Top search + header */}
        <header className="mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">National Registrar Dashboard</h1>
            <div className="text-sm text-white/70">Central academic records authority — secure and auditable</div>
          </div>
        </header>

        {/* Dashboard view */}
        {activeView === "dashboard" && (
          <section className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#0F2A44] to-[#071226] border border-white/6 hover:scale-[1.01] transition-transform">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70">Total Students</div>
                      <div className="text-2xl font-bold text-white">{totalStudents}</div>
                    
                    </div>
                    <div className="p-3 rounded-md bg-white/6">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#0F2A44] to-[#071226] border border-white/6 hover:scale-[1.01] transition-transform">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70">Records Uploaded</div>
                      <div className="text-2xl font-bold text-white">{totalUploads}</div>
                     
                    </div>
                    <div className="p-3 rounded-md bg-white/6">
                      <FileUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#0F2A44] to-[#071226] border border-white/6 hover:scale-[1.01] transition-transform">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70">Pending Corrections</div>
                      <div className="text-2xl font-bold text-white">{pendingCorrectionsCount}</div>
                   
                    </div>
                    <div className="p-3 rounded-md bg-white/6">
                      <FileEdit className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#0F2A44] to-[#071226] border border-white/6 hover:scale-[1.01] transition-transform">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70">Recent Verifications</div>
                      <div className="text-2xl font-bold text-white">{recentVerifications}</div>
                     
                    </div>
                    <div className="p-3 rounded-md bg-white/6">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <Card className="bg-[#0F2A44] border border-white/6 mb-6">
                  <CardContent>
                    <div className="relative">
                      <div className="grid gap-3 bg-[#071A2B] rounded-3xl p-4 shadow-sm transition-all focus-within:shadow-md">
                        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-3">
                          <div className="flex items-center gap-2 bg-[#0F2A44] rounded-full px-4 py-3">
                            <SearchIcon className="h-5 w-5 text-white/80" />
                            <input
                              className="bg-transparent outline-none w-full text-white placeholder:text-white/60"
                              placeholder="Search by Name, National ID, or Student ID..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && runSearch()}
                              onFocus={() => setSuggestionsOpen(suggestions.length > 0)}
                              onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                className="text-white/70 hover:text-white"
                                onClick={() => {
                                  setSearchQuery("");
                                  setSuggestions([]);
                                  setSuggestionsOpen(false);
                                }}
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Select value={searchScope} onValueChange={(v) => setSearchScope(v as "all" | "name" | "nationalId" | "studentId")}> 
                              <SelectTrigger className="bg-[#0F2A44] text-white border border-white/10 h-12 min-w-[160px]">
                                <SelectValue placeholder="Scope" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All fields</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="nationalId">National ID</SelectItem>
                                <SelectItem value="studentId">Student ID</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Button className="bg-[#D4A017] text-black px-8 py-3 w-full xl:w-auto" onClick={() => runSearch()}>
                            Search
                          </Button>
                        </div>
                      </div>

                      {suggestionsOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-[#0B2436] border border-white/6 rounded-lg shadow-lg z-40 overflow-hidden">
                          {suggestions.length > 0 ? (
                            suggestions.map((s) => (
                              <button
                                key={s.nationalId}
                                className="w-full text-left px-4 py-3 hover:bg-[#0F2A44] flex items-center gap-4"
                                onMouseDown={() => selectSuggestion(s)}
                              >
                                <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                  {s.photoUrl ? <img src={s.photoUrl} alt={s.name} className="h-full w-full object-cover" /> : <Users className="h-5 w-5 text-white/70" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-white font-medium truncate">{s.name}</div>
                                  <div className="text-xs text-white/60 truncate">{s.nationalId} • {s.studentId}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-white/60" />
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-white/70">
                              No results found for "{searchQuery}" in {searchScope === "all" ? "all fields" : searchScope === "nationalId" ? "National ID" : searchScope === "name" ? "Name" : "Student ID"}.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Search result / student card */}
            {selectedRecord ? (
              <Card className="bg-[#0F2A44] border border-white/6">
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                      {selectedRecord.photoUrl ? <img src={selectedRecord.photoUrl} alt={selectedRecord.name} className="h-full w-full object-cover" /> : <Users className="h-8 w-8 text-white/70" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">{selectedRecord.name}</div>
                      <div className="text-sm text-white/70">{selectedRecord.nationalId} • {selectedRecord.studentId}</div>
                      <div className="text-sm text-white/70 mt-2">Levels: {selectedRecord.level}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="bg-[#D4A017] text-white" onClick={() => openEditRecord(selectedRecord)}>View Records</Button>
                      <Button className="bg-white/6 text-white" onClick={() => openEditRecord(selectedRecord)}>Edit / Correct</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-white/70">Search for a student to view profile and records.</div>
            )}
          </section>
        )}

        {/* Upload view (UI) */}
        {activeView === "upload" && (
          <section>
            <Card className="bg-[#0F2A44] border border-white/6 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Upload Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">National ID </Label>
                    <Input
                      value={uploadForm.nationalId}
                      onChange={(e) => setUploadForm(s => ({ ...s, nationalId: e.target.value.replace(/\D/g, "") }))}
                      className="bg-[#071A2B] text-white"
                    
                    />
                    {formErrors.nationalId && <div className="text-xs text-red-400 mt-1">{formErrors.nationalId}</div>}
                  </div>

                  <div>
                    <Label className="text-white">Student ID</Label>
                    <Input
                      value={uploadForm.studentId}
                      onChange={(e) => setUploadForm(s => ({ ...s, studentId: e.target.value }))}
                      className="bg-[#071A2B] text-white"
                    />
                    {formErrors.studentId && <div className="text-xs text-red-400 mt-1">{formErrors.studentId}</div>}
                  </div>

                  <div>
                    <Label className="text-white">Full Name</Label>
                    <Input
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(s => ({ ...s, name: e.target.value }))}
                      className="bg-[#071A2B] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Department</Label>
                    <Input
                      value={uploadForm.department}
                      onChange={(e) => setUploadForm(s => ({ ...s, department: e.target.value }))}
                      className="bg-[#071A2B] text-white"
                    />
                    {formErrors.department && <div className="text-xs text-red-400 mt-1">{formErrors.department}</div>}
                  </div>

                  <div>
                    <Label className="text-white">GPA </Label>
                    <Input
                      value={uploadForm.gpa}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^[0-9]*\.?[0-9]*$/.test(v) || v === "") setUploadForm(s => ({ ...s, gpa: v }));
                      }}
                      className="bg-[#071A2B] text-white"
                    
                    />
                    {formErrors.gpa && <div className="text-xs text-red-400 mt-1">{formErrors.gpa}</div>}
                  </div>

                  <div>
                    <Label className="text-white">Graduation Year</Label>
                    <Input
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm(s => ({ ...s, year: e.target.value.replace(/\D/g, "") }))}
                      className="bg-[#071A2B] text-white"
                     
                    />
                    {formErrors.year && <div className="text-xs text-red-400 mt-1">{formErrors.year}</div>}
                  </div>

                  <div>
                    <Label className="text-white">Academic Level</Label>
                    <Select value={uploadForm.level} onValueChange={(v) => setUploadForm(s => ({ ...s, level: v }))}>
                      <SelectTrigger className="bg-[#071A2B] text-white"><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {["Grade 6", "Grade 8", "Grade 12", "Bachelor Degree", "Masters", "PhD"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {formErrors.level && <div className="text-xs text-red-400 mt-1">{formErrors.level}</div>}
                  </div>

                  {uploadForm.level === "Bachelor Degree" && (
                    <div>
                      <Label className="text-white">Exit Exam Result</Label>
                      <Input
                        value={uploadForm.exitExam ?? ""}
                        onChange={(e) => setUploadForm(s => ({ ...s, exitExam: e.target.value }))}
                        className="bg-[#071A2B] text-white"
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <Label className="text-white">Certificate File (PDF / JPG / PNG)</Label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
                      className="text-white"
                    />
                    {formErrors.certificateFile && <div className="text-xs text-red-400 mt-1">{formErrors.certificateFile}</div>}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button className="bg-[#D4A017] text-white" onClick={handleUploadSubmit} disabled={loading}>{loading ? "uploading..." : "Upload Record"}</Button>
                  <Button className="bg-white/6 text-white" onClick={() => { setUploadForm({ nationalId: "", studentId: "", name: "", department: "", gpa: "", year: "", level: "", exitExam: "", photoUrl: null }); setCertificateFile(null); }}>Reset</Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk CSV */}
            <Card className="bg-[#0F2A44] border border-white/6">
              <CardHeader>
                <CardTitle className="text-white">Bulk CSV Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/70 mb-3">Upload a CSV with columns: national_id, student_id, name, department, gpa, year, level</div>
                <div className="flex gap-3 items-center">
                  <input id="bulkCsv" type="file" accept=".csv" onChange={(e) => handleCsvFile(e.target.files?.[0])} />
                  <Button
                    className="bg-[#D4A017] text-white"
                    onClick={() => {
                      if (csvFileName) toast({ title: "Selected", description: csvFileName });
                      else toast({ title: "No file", description: "Choose a CSV first.", variant: "destructive" });
                    }}
                  >
                    Selected: {csvFileName ?? "None"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
        {/* Corrections view */}
        {activeView === "corrections" && (
          <section className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[0.85fr,1.15fr]">
              <Card className="bg-[#0F2A44] border border-white/6">
                <CardHeader>
                  <CardTitle className="text-white">Correction Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-white/70 mb-4">
                    Review correction threads and open a conversation to reply directly to the student.
                  </div>
                  <div className="space-y-3">
                    {corrections.length === 0 && <div className="text-white/70">No correction requests.</div>}
                    {corrections.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setActiveCorrectionThread(thread)}
                        className={`w-full text-left p-4 rounded-lg border transition ${
                          activeCorrectionThread?.id === thread.id ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-[#071A2B]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-white">{thread.student}</div>
                            <div className="text-xs text-white/60">{thread.nationalId}</div>
                          </div>
                          <Badge className="bg-white/10 text-white text-[11px]">
                            {thread.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-white/70">{thread.subject}</div>
                        <div className="mt-2 text-xs text-white/50">Updated {new Date(thread.updatedAt).toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0F2A44] border border-white/6">
                <CardHeader>
                  <CardTitle className="text-white">Thread Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {!activeCorrectionThread ? (
                    <div className="text-white/70">Select a correction request to review details and reply.</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-[#071A2B] p-4 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm text-white font-semibold">{activeCorrectionThread.subject}</div>
                            <div className="text-xs text-white/50">{activeCorrectionThread.student} • {activeCorrectionThread.nationalId}</div>
                          </div>
                          <Badge className="bg-white/10 text-white text-[11px]">{activeCorrectionThread.status}</Badge>
                        </div>
                        <div className="text-sm text-white/70">{activeCorrectionThread.description}</div>
                        {activeCorrectionThread.note && (
                          <div className="text-xs text-white/50">Note: {activeCorrectionThread.note}</div>
                        )}
                      </div>

                      <div className="space-y-3 max-h-[340px] overflow-y-auto rounded-2xl bg-[#071A2B] p-4">
                        {(correctionMessages.filter((msg) => msg.threadId === activeCorrectionThread.id)).length === 0 ? (
                          <div className="text-white/70">No messages yet.</div>
                        ) : (
                          correctionMessages
                            .filter((msg) => msg.threadId === activeCorrectionThread.id)
                            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                            .map((message) => (
                              <div key={message.id} className={`rounded-2xl p-3 ${message.sender === "registrar" ? "bg-indigo-500/10 text-white self-end" : "bg-white/5 text-white/80"}`}>
                                <div className="text-[11px] text-white/50 mb-1">
                                  {message.sender === "registrar" ? "Registrar" : "Student"} • {new Date(message.timestamp).toLocaleString()}
                                </div>
                                <div className="text-sm">{message.text}</div>
                              </div>
                            ))
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="correction-reply" className="text-white">Send reply</Label>
                        <textarea
                          id="correction-reply"
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-[#071A2B] p-3 text-white outline-none"
                          placeholder="Add a response for the student..."
                        />
                        <div className="flex flex-wrap gap-3 justify-between">
                          <div className="flex gap-2">
                            <Button className="bg-[#D4A017] text-black" onClick={() => takeCorrectionAction(activeCorrectionThread.id, "Approve")}>Approve</Button>
                            <Button className="bg-white/6 text-white" onClick={() => takeCorrectionAction(activeCorrectionThread.id, "Reject")}>Reject</Button>
                          </div>
                          <Button className="bg-primary text-white" onClick={handleCorrectionReply}>Send Reply</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Activities view */}
        {activeView === "activities" && (
          <section>
            <Card className="bg-[#0F2A44] border border-white/6 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activities.length === 0 && <div className="text-white/70">No activities yet.</div>}
                  {activities.map((a) => (
                    <div key={a.id} className="p-2 bg-[#071A2B] rounded text-sm">
                      <div className="text-xs text-white/70">{new Date(a.timestamp).toLocaleString()} • {a.registrarId}</div>
                      <div className="text-white mt-1">{a.message}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <Button className="bg-[#D4A017] text-white" onClick={exportLogsAsPdf}>Export Logs as PDF</Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Edit record modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl bg-[#0F2A44] border border-white/10 rounded-lg overflow-hidden text-white">
              <div className="p-4 border-b border-white/6 flex items-center justify-between">
                <div className="font-display font-semibold text-white">Edit / Correct Record</div>
                <Button className="bg-white/6 text-white" onClick={() => setSelectedRecord(null)}>Close</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">National ID</Label>
                    <Input
                      value={selectedRecord.nationalId}
                      onChange={(e) => setSelectedRecord(s => s ? ({ ...s, nationalId: e.target.value.replace(/\D/g, "") }) : s)}
                      className="bg-[#071A2B] text-white"
                    />
                    {editErrors.nationalId && <div className="text-xs text-red-400 mt-1">{editErrors.nationalId}</div>}
                  </div>

                  <div>
                    <Label className="text-white">Student ID</Label>
                    <Input
                      value={selectedRecord.studentId}
                      onChange={(e) => setSelectedRecord(s => s ? ({ ...s, studentId: e.target.value }) : s)}
                      className="bg-[#071A2B] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Full Name</Label>
                    <Input
                      value={selectedRecord.name}
                      onChange={(e) => setSelectedRecord(s => s ? ({ ...s, name: e.target.value }) : s)}
                      className="bg-[#071A2B] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Department</Label>
                    <Input
                      value={selectedRecord.department}
                      onChange={(e) => setSelectedRecord(s => s ? ({ ...s, department: e.target.value }) : s)}
                      className="bg-[#071A2B] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">GPA (1.0 - 4.0)</Label>
                    <Input
                      value={selectedRecord.gpa}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^[0-9]*\.?[0-9]*$/.test(v) || v === "") setSelectedRecord(s => s ? ({ ...s, gpa: v }) : s);
                      }}
                      className="bg-[#071A2B] text-white"
                    />
                    {editErrors.gpa && <div className="text-xs text-red-400 mt-1">{editErrors.gpa}</div>}
                  </div>

                  <div>
                    <Label className="text-white">Graduation Year</Label>
                    <Input
                      value={selectedRecord.year}
                      onChange={(e) => setSelectedRecord(s => s ? ({ ...s, year: e.target.value.replace(/\D/g, "") }) : s)}
                      className="bg-[#071A2B] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Academic Level</Label>
                    <Select value={selectedRecord.level} onValueChange={(v) => setSelectedRecord(s => s ? ({ ...s, level: v }) : s)}>
                      <SelectTrigger className="bg-[#071A2B] text-white"><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {["Grade 6", "Grade 8", "Grade 12", "Bachelor Degree", "Masters", "PhD"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="bg-[#D4A017] text-white"
                    onClick={() => {
                      // validate before saving
                      if (!selectedRecord) return;
                      const errs: Record<string, string> = {};
                      const nidErr = validateNationalId(selectedRecord.nationalId);
                      if (nidErr) errs.nationalId = nidErr;
                      const gpaErr = validateGpa(selectedRecord.gpa);
                      if (gpaErr) errs.gpa = gpaErr;
                      if (Object.keys(errs).length > 0) {
                        setEditErrors(errs);
                        toast({ title: "Validation Error", description: "Fix errors before saving.", variant: "destructive" });
                        return;
                      }
                      // save
                      saveEditedRecord(selectedRecord);
                    }}
                  >
                    Save
                  </Button>
                  <Button className="bg-white/6 text-white" onClick={() => setSelectedRecord(null)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CSV Preview Modal */}
        {csvPreviewOpen && csvParseResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl bg-[#0F2A44] border border-white/10 rounded-lg overflow-hidden text-white">
              <div className="p-4 border-b border-white/6 flex items-center justify-between">
                <div>
                  <div className="font-display font-semibold text-lg">CSV Preview</div>
                  <div className="text-sm text-white/70">Validate columns and preview rows before upload</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="bg-white/6 text-white" onClick={() => { setCsvPreviewOpen(false); setCsvText(null); setCsvParseResult(null); }}>Close</Button>
                  <Button
                    className={`bg-[#D4A017] text-white ${csvParseResult.errors.length ? "opacity-60 pointer-events-none" : ""}`}
                    onClick={() => {
                      const objs = csvParseResult.rows.map(r => {
                        const obj: Record<string, string> = {};
                        csvParseResult.headers.forEach((h, i) => obj[h] = r[i] ?? "");
                        return obj;
                      });
                      confirmCsvUpload(objs);
                    }}
                  >
                    Confirm Upload
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
                {csvParseResult.errors.length > 0 && (
                  <div className="bg-red-900/30 border border-red-700 p-3 rounded text-sm text-red-300">
                    <div className="font-medium mb-1">Validation issues</div>
                    <ul className="list-disc list-inside">
                      {csvParseResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}

                <div>
                  <div className="text-sm text-white/70 mb-2">Detected columns</div>
                  <div className="flex flex-wrap gap-2">
                    {csvParseResult.headers.map(h => (
                      <div key={h} className={`px-2 py-1 rounded text-xs ${REQUIRED_COLUMNS.includes(h) ? "bg-[#D4A017] text-white" : "bg-white/6 text-white"}`}>{h}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-white/70 mb-2">Preview rows (first 10)</div>
                  <div className="overflow-auto border border-white/6 rounded">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-[#071A2B]">
                          {csvParseResult.headers.map(h => <th key={h} className="px-3 py-2 text-left text-white/70">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {csvParseResult.rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-[#0F2A44]" : "bg-[#071A2B]"}>
                            {csvParseResult.headers.map((h, j) => <td key={j} className="px-3 py-2 text-white">{row[j] ?? ""}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-xs text-white/60">
                  Tip: required columns are <span className="font-medium text-white">national_id, student_id, name, department, gpa, year, level</span>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-[#0F2A44] border border-white/10 rounded-lg overflow-hidden text-white p-4">
              <div className="font-display font-semibold text-lg mb-2">Confirm Logout</div>
              <div className="text-white/70 mb-4">Are you sure you want to log out?</div>
              <div className="flex gap-3">
                <Button
                  className="bg-red-600 text-white"
                  onClick={() => {
                    logActivity("logout", `Registrar ${registrarId} logged out`);
                    toast({ title: "Logged out", description: "You have been logged out." });
                    setShowLogoutConfirm(false);
                    navigate("/");
                  }}
                >
                  Yes, log out
                </Button>
                <Button className="bg-white/6 text-white" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
