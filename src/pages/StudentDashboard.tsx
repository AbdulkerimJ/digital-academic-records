import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  FileText,
  Edit,
  QrCode,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Loader2,
  MessageCircle,
} from "lucide-react";
import {
  AcademicLevel,
  AcademicRecord,
  RecordStatus,
  getStudentProfile,
  getStudentRecords,
  onAcademicRecordUpdate,
} from "@/lib/recordStore";
import {
  addCorrectionMessage,
  addCorrectionThread,
  loadCorrectionMessages,
  loadCorrectionThreads,
  onCorrectionUpdate,
  updateCorrectionThread,
  type CorrectionMessage,
  type CorrectionThread,
} from "@/lib/correctionStore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------
   TYPES
------------------------------------------------------------ */


type ActivityItem = {
  action: string;
  detail: string;
  time: string;
  status: "success" | "info" | "warning";
};

type SupportThread = CorrectionThread;
type SupportMessage = CorrectionMessage;

type SectionKey = "records" | "correction" | "qr" | "inbox" | "activities";


/* ------------------------------------------------------------
   STATUS COLORS
------------------------------------------------------------ */

const statusColor = {
  Pass: "text-emerald-500 bg-emerald-500/10",
  Distinction: "text-primary bg-primary/10",
  Pending: "text-amber-500 bg-amber-500/10",
  Error: "text-destructive bg-destructive/10",
};

/* ------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------ */

export default function StudentDashboard() {
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>("records");
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [studentName, setStudentName] = useState("Student");
  const [nationalId, setNationalId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [recordError, setRecordError] = useState<string | null>(null);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      action: "Logged in",
      detail: "Student dashboard accessed",
      time: "Just now",
      status: "info",
    },
  ]);

  const [correctionLevel, setCorrectionLevel] = useState<AcademicLevel | "">("");
  const [correctionDescription, setCorrectionDescription] = useState("");
  const [correctionAttachment, setCorrectionAttachment] = useState<File | null>(null);
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
  const [correctionErrors, setCorrectionErrors] = useState<{ level?: string; description?: string }>({});

  const [qrData, setQrData] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(
    null
  );

  const [supportThreads, setSupportThreads] = useState<SupportThread[]>(
    loadCorrectionThreads
  );
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(
    loadCorrectionMessages
  );
  const [activeSupportThread, setActiveSupportThread] = useState<SupportThread | null>(null);
  const [newSupportReply, setNewSupportReply] = useState("");

  const allAcademicLevels: AcademicLevel[] = [
    "Grade 6",
    "Grade 8",
    "Grade 12",
    "Exit Exam",
    "Bachelor Degree",
    "Masters",
    "PhD",
  ];

  const levelOptions: AcademicLevel[] = academicRecords.length > 0
    ? Array.from(new Set(academicRecords.map((record) => record.level))) as AcademicLevel[]
    : allAcademicLevels;

  const studentSupportThreads = supportThreads.filter(
    (thread) => thread.nationalId === nationalId
  );
  const openSupportCount = studentSupportThreads.filter(
    (thread) => thread.status === "Pending"
  ).length;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ------------------------------------------------------------
     HELPERS
  ------------------------------------------------------------ */

  const addActivity = (item: ActivityItem) => {
    setActivities((prev) => [item, ...prev].slice(0, 8));
  };

  const handleSectionChange = (section: SectionKey) => {
    setActiveSection(section);
    addActivity({
      action:
        section === "records"
          ? "Viewed academic records"
          : section === "correction"
          ? "Opened correction request"
          : section === "qr"
          ? "Opened QR generator"
          : section === "activities"
          ? "Viewed activity logs"
          : "Opened support inbox",
      detail:
        section === "records"
          ? "All academic levels"
          : section === "correction"
          ? "Correction form"
          : section === "qr"
          ? "QR code panel"
          : section === "activities"
          ? "Activity history"
          : "Support and message threads",
      time: "Just now",
      status: "info",
    });
  };

  /* ------------------------------------------------------------
     QR GENERATION (NO DOWNLOAD)
  ------------------------------------------------------------ */

  const handleGenerateQr = () => {
    const verified = academicRecords.filter(
      (r) => r.status === "Pass" || r.status === "Distinction"
    );

    if (verified.length === 0) {
      toast({
        title: "No verified records",
        description: "There are no approved registrar records available for QR generation.",
        variant: "destructive",
      });
      addActivity({
        action: "QR generation blocked",
        detail: "No verified registrar records available",
        time: "Just now",
        status: "warning",
      });
      return;
    }

    const payload = {
      studentName,
      nationalId,
      records: verified,
      issuedAt: new Date().toISOString(),
    };

    setQrData(btoa(JSON.stringify(payload)));
    setShowQr(true);

    toast({
      title: "QR code generated",
      description: "Your secure academic QR code is ready.",
    });

    addActivity({
      action: "QR generated",
      detail: "Verified academic records",
      time: "Just now",
      status: "success",
    });
  };

  /* ------------------------------------------------------------
     CORRECTION SUBMIT
  ------------------------------------------------------------ */

  const handleCorrectionSubmit = () => {
    if (!nationalId) {
      toast({
        title: "Student not authenticated",
        description: "Please login through the portal before submitting a correction.",
        variant: "destructive",
      });
      return;
    }

    setCorrectionErrors({});
    const errors: { level?: string; description?: string } = {};

    if (!correctionLevel) {
      errors.level = "Academic level is required.";
    }
    if (!correctionDescription.trim()) {
      errors.description = "Please describe the correction issue.";
    }

    if (Object.keys(errors).length > 0) {
      setCorrectionErrors(errors);
      toast({
        title: "Incomplete form",
        description: "Please fill in the required fields before submitting.",
        variant: "destructive",
      });
      addActivity({
        action: "Correction failed",
        detail: "Missing required fields",
        time: "Just now",
        status: "warning",
      });
      return;
    }

    setCorrectionSubmitting(true);
    const threadId = `thread-${Date.now()}`;
    const subject = `Correction request for ${correctionLevel}`;
    const createdAt = new Date().toISOString();

    const newThread: SupportThread = {
      id: threadId,
      student: studentName,
      nationalId,
      level: correctionLevel,
      subject,
      description: correctionDescription.trim(),
      status: "Pending",
      createdAt,
      updatedAt: createdAt,
      attachmentName: correctionAttachment?.name ?? undefined,
    };

    const newMessage: SupportMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      sender: "student",
      text: `Correction request submitted: ${correctionDescription.trim()}`,
      timestamp: createdAt,
    };

    setTimeout(() => {
      addCorrectionThread(newThread);
      addCorrectionMessage(newMessage);
      setSupportThreads((prev) => [newThread, ...prev]);
      setSupportMessages((prev) => [...prev, newMessage]);
      setActiveSupportThread(newThread);
      setActiveSection("inbox");
      setCorrectionSubmitting(false);
      setCorrectionLevel("");
      setCorrectionDescription("");
      setCorrectionAttachment(null);

      toast({
        title: "Correction request submitted successfully",
        description: "Your request has been forwarded to the registrar.",
      });
      addActivity({
        action: "Correction submitted",
        detail: `Level: ${correctionLevel}`,
        time: "Just now",
        status: "success",
      });
    }, 450);
  };

  /* ------------------------------------------------------------
     LOGOUT
  ------------------------------------------------------------ */

  const handleLogout = () => setShowLogoutConfirm(true);

  useEffect(() => {
    const requestedId = searchParams.get("nationalId")?.trim();
    const storedId = window.localStorage.getItem("nilarvs-current-student-id")?.trim();
    const effectiveId = requestedId || storedId || "";

    if (!effectiveId) {
      setRecordError("Unable to load records. Please login through the portal with your National ID.");
      setAcademicRecords([]);
      setStudentName("Student");
      setNationalId("");
      setIsLoading(false);
      return;
    }

    window.localStorage.setItem("nilarvs-current-student-id", effectiveId);
    setNationalId(effectiveId);

    const loadRecords = () => {
      setIsLoading(true);
      const records = getStudentRecords(effectiveId);
      setAcademicRecords(records);
      const profile = getStudentProfile(effectiveId);
      setStudentName(profile.studentName ?? "Student");
      setIsLoading(false);
      setRecordError(records.length === 0 ? "No academic records available." : null);
    };

    loadRecords();
    const unsubscribe = onAcademicRecordUpdate(loadRecords);
    return unsubscribe;
  }, [searchParams]);

  useEffect(() => {
    const sync = () => {
      setSupportThreads(loadCorrectionThreads());
      setSupportMessages(loadCorrectionMessages());
      if (activeSupportThread) {
        const refreshed = loadCorrectionThreads().find((thread) => thread.id === activeSupportThread.id);
        if (refreshed) setActiveSupportThread(refreshed);
      }
    };

    sync();
    return onCorrectionUpdate(sync);
  }, [activeSupportThread]);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    addActivity({
      action: "Logged out",
      detail: "Session ended",
      time: "Just now",
      status: "info",
    });
  };

  /* ------------------------------------------------------------
     RENDER: RECORD LIST (IMPROVED)
  ------------------------------------------------------------ */

  const renderRecordList = () => (
    <motion.div
      key="records-list"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      <h2 className="font-display text-xl font-bold">
        Access Your Academic Records
      </h2>

      {isLoading ? (
        <Card className="bg-[#0F2A44] border border-white/10 px-6 py-8 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading records uploaded by the registrar...</span>
        </Card>
      ) : academicRecords.length === 0 ? (
        <Card className="bg-[#0F2A44] border border-white/10 p-6 text-center">
          <CardTitle className="font-display text-lg">No academic records available.</CardTitle>
          <p className="text-sm text-white mt-2">
            Your student dashboard only displays data that has been uploaded and approved by the registrar. If no records exist, nothing is shown.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {academicRecords.map((record) => (
            <Card
              key={record.id}
              className="bg-[#0F2A44] border border-white/10 hover:border-primary/50 transition cursor-pointer"
              onClick={() => setSelectedRecord(record)}
            >
              <CardHeader className="pb-3 flex justify-between">
                <div>
                  <CardTitle className="font-display text-base">
                    {record.level}
                  </CardTitle>
                  <p className="text-xs text-white">
                    {record.institution}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[record.status]}`}
                >
                  {record.status}
                </span>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>
                  <strong>Year:</strong> {record.year}
                </p>
                <p>
                  <strong>Result:</strong> {record.result}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderActivityLog = () => (
    <motion.div
      key="activity-log"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Activity Logs</h2>
          <p className="text-sm text-white">A history of your recent dashboard actions.</p>
        </div>
      </div>

      <Card className="bg-[#0F2A44] border border-white/10 overflow-x-auto">
        <CardContent className="p-0">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 text-white">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-white">No activity recorded.</td>
                </tr>
              ) : (
                activities.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="px-4 py-3 text-white/80">{item.time}</td>
                    <td className="px-4 py-3 text-white">{item.action}</td>
                    <td className="px-4 py-3 text-white/80">{item.status}</td>
                    <td className="px-4 py-3 text-white">{item.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCorrectionForm = () => (
    <motion.div
      key="correction-form"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm sm:text-base font-semibold">
          Submit Correction Request
        </h2>
        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[11px]">
          Sent securely to registrar
        </Badge>
      </div>
      <Card className="bg-[#0F2A44] border border-white/10">
        <CardContent className="pt-5 space-y-4 text-xs sm:text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Academic Level *</Label>
              <Select
                value={correctionLevel}
                onValueChange={(v) => setCorrectionLevel(v as AcademicLevel)}
              >
                <SelectTrigger className="bg-[#0F172A] border border-white/10">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.length === 0 ? (
                    <SelectItem value="" disabled>
                      No levels available
                    </SelectItem>
                  ) : (
                    levelOptions.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {correctionErrors.level ? (
                <p className="text-xs text-destructive">{correctionErrors.level}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description of Correction *</Label>
            <Textarea
              value={correctionDescription}
              onChange={(e) => setCorrectionDescription(e.target.value)}
              rows={5}
              placeholder="Explain what is incorrect and what should be corrected..."
              className="bg-[#0F172A] border border-white/10"
            />
            {correctionErrors.description ? (
              <p className="text-xs text-destructive">{correctionErrors.description}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Optional attachment</Label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setCorrectionAttachment(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-white"
            />
            {correctionAttachment ? (
              <p className="text-xs text-white">Selected: {correctionAttachment.name}</p>
            ) : (
              <p className="text-xs text-white">PDF or image only.</p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-white">
              Your request will be reviewed by the registrar. You may be contacted for verification.
            </p>
            <Button className="gap-2" onClick={handleCorrectionSubmit} disabled={correctionSubmitting}>
              {correctionSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {correctionSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderQrSection = () => (
    <motion.div
      key="qr-section"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm sm:text-base font-semibold">
          Generate Academic QR Code
        </h2>
        <Badge className="bg-primary/10 text-primary border border-primary/30 text-[11px]">
          Verified records only
        </Badge>
      </div>
      <Card className="bg-[#0F2A44] border border-white/10">
        <CardContent className="pt-5 grid md:grid-cols-[1.4fr,1fr] gap-6 text-xs sm:text-sm">
          <div className="space-y-3">
            <p className="text-white">
              Generate a secure QR code that encodes your verified academic records. Institutions can scan this to validate your credentials directly from NILARVS.
            </p>
            <ul className="list-disc list-inside text-white space-y-1">
              <li>Includes only verified levels (Pass / Distinction)</li>
              <li>Digitally signed and tamper-resistant (conceptual)</li>
              <li>Can be shared with institutions</li>
            </ul>
            <Button className="mt-2 gap-2 w-full" onClick={handleGenerateQr} disabled={academicRecords.filter((r) => r.status === "Pass" || r.status === "Distinction").length === 0}>
              <QrCode className="h-4 w-4" />
              Generate QR Code
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-40 w-40 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-center text-center px-4">
              {qrData ? (
                <div className="text-[9px] text-white">
                  <p className="mb-1 font-semibold">QR Payload (encoded)</p>
                  <p className="opacity-80 break-all">{qrData.slice(0, 80)}...</p>
                </div>
              ) : (
                <div className="text-[11px] text-white">
                  QR preview will appear here after generation.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSupportInbox = () => {
    const threadMessages = activeSupportThread
      ? supportMessages.filter((msg) => msg.threadId === activeSupportThread.id)
      : [];
    const registrarMessages = threadMessages.filter((msg) => msg.sender === "registrar");
    const chatActive = activeSupportThread?.status === "Approved" && registrarMessages.length > 0;

    return (
      <motion.div
        key="support-inbox"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Correction Updates</h2>
            <p className="text-sm text-white">
              Track the status of your correction requests and see approved responses from the registrar.
            </p>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[11px]">
            {studentSupportThreads.length} requests
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
          <Card className="bg-[#0F2A44] border border-white/10">
            <CardHeader>
              <CardTitle className="font-display text-sm">Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentSupportThreads.length === 0 ? (
                <div className="text-sm text-white p-4">
                  No correction requests yet. Submit a request and it will appear here.
                </div>
              ) : (
                studentSupportThreads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveSupportThread(thread)}
                    className={`w-full text-left rounded-xl border p-3 transition ${
                      activeSupportThread?.id === thread.id
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-white/10 bg-[#0F172A]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-white">{thread.subject}</span>
                      <Badge className="bg-white/10 text-white text-[11px]">{thread.status}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-white">
                      {thread.description}
                    </div>
                    {thread.attachmentName ? (
                      <div className="mt-2 text-xs text-white">
                        Attachment: {thread.attachmentName}
                      </div>
                    ) : null}
                    <div className="mt-2 text-[11px] text-white">
                      Updated: {new Date(thread.updatedAt).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#0F2A44] border border-white/10">
            <CardHeader>
              <CardTitle className="font-display text-sm">Request details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeSupportThread ? (
                <div className="text-sm text-white">
                  Select a request to view the latest status and registrar response.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#0F172A] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-white font-semibold">{activeSupportThread.subject}</div>
                        <div className="text-xs text-white/60">Status: {activeSupportThread.status}</div>
                      </div>
                      <Badge className="bg-white/10 text-white text-[11px]">{activeSupportThread.status}</Badge>
                    </div>
                    <div className="mt-3 text-sm text-white">{activeSupportThread.description}</div>
                    {activeSupportThread.attachmentName && (
                      <div className="mt-3 text-xs text-white">Attachment: {activeSupportThread.attachmentName}</div>
                    )}
                  </div>

                  {activeSupportThread.status === "Pending" && (
                    <Card className="bg-[#0F172A] border border-white/10 p-4">
                      <p className="text-sm text-white">
                        Your correction request is pending review by the registrar. You will see an update once the request is approved or rejected.
                      </p>
                    </Card>
                  )}

                  {activeSupportThread.status === "Rejected" && (
                    <Card className="bg-[#0F172A] border border-destructive/20 p-4">
                      <p className="text-sm text-destructive font-semibold">This request was rejected.</p>
                      {threadMessages.length > 0 ? (
                        <p className="text-sm text-white mt-2">Reason: {threadMessages.filter((msg) => msg.sender === "registrar").slice(-1)[0]?.text}</p>
                      ) : (
                        <p className="text-sm text-white mt-2">No reason was provided.</p>
                      )}
                    </Card>
                  )}

                  {activeSupportThread.status === "Approved" && !chatActive && (
                    <Card className="bg-[#0F172A] border border-white/10 p-4">
                      <p className="text-sm text-white">
                        Your request has been approved. Waiting for the registrar to send an initial response.
                      </p>
                    </Card>
                  )}

                  {chatActive && (
                    <div className="space-y-3">
                      <div className="space-y-3 max-h-80 overflow-y-auto rounded-2xl bg-[#0F172A] p-4">
                        {threadMessages
                          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                          .map((message) => (
                            <div key={message.id} className={`rounded-2xl p-3 ${message.sender === "student" ? "bg-indigo-500/10 text-white self-end" : "bg-white/5 text-white/80"}`}>
                              <div className="text-[11px] text-white/50 mb-1">
                                {message.sender === "student" ? "You" : "Registrar"} • {new Date(message.timestamp).toLocaleString()}
                              </div>
                              <div>{message.text}</div>
                            </div>
                          ))}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="student-reply" className="text-white">Send a follow-up message</Label>
                        <Textarea
                          id="student-reply"
                          value={newSupportReply}
                          onChange={(e) => setNewSupportReply(e.target.value)}
                          rows={4}
                          placeholder="Write your follow-up..."
                          className="bg-[#0F172A] border border-white/10"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" className="border-white/10" onClick={() => setNewSupportReply("")}>Clear</Button>
                          <Button
                            onClick={() => {
                              if (!activeSupportThread || !newSupportReply.trim()) return;
                              const message: SupportMessage = {
                                id: `msg-${Date.now()}`,
                                threadId: activeSupportThread.id,
                                sender: "student",
                                text: newSupportReply.trim(),
                                timestamp: new Date().toISOString(),
                              };
                              addCorrectionMessage(message);
                              setSupportMessages((prev) => [...prev, message]);
                              setNewSupportReply("");
                              toast({ title: "Message sent", description: "Your follow-up has been sent." });
                            }}
                            className="gap-2"
                          >
                            Send follow-up
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  };

  const renderRecordDetail = () => {
    if (!selectedRecord) return null;

    return (
      <motion.div
        key="record-detail"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="rounded-3xl border border-white/10 bg-[#0F2A44] p-6 shadow-lg"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-white">Selected Record</p>
            <h3 className="font-display text-lg font-semibold">{selectedRecord.level}</h3>
          </div>
          <Button variant="ghost" className="text-white" onClick={() => setSelectedRecord(null)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Student Name" value={selectedRecord.studentName} />
          <Info label="Institution" value={selectedRecord.institution} />
          <Info label="Year of Completion" value={selectedRecord.year} />
          <Info label="Result / Score" value={selectedRecord.result} />
          <div className="sm:col-span-2">
            <p className="text-white text-sm">Status</p>
            <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor[selectedRecord.status]}`}>
              {selectedRecord.status}
            </span>
          </div>
          <Info label="Certificate ID" value={selectedRecord.certificateId ?? "—"} />
        </div>
      </motion.div>
    );
  };

  /* ------------------------------------------------------------
     MAIN RENDER
  ------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071226] to-[#0A1A2F] text-white flex relative">
      {/* SIDEBAR */}
      <aside className="w-64 hidden md:flex flex-col border-r border-white/10 bg-[#071A2B] text-white">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
            <LayoutGrid className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold">Student Dashboared</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <SidebarItem
            icon={FileText}
            label="View Academic Record"
            active={activeSection === "records"}
            onClick={() => {
              setSelectedRecord(null);
              handleSectionChange("records");
            }}
          />
          <SidebarItem
            icon={Edit}
            label="Submit Correction Request"
            active={activeSection === "correction"}
            onClick={() => {
              setSelectedRecord(null);
              handleSectionChange("correction");
            }}
          />
          <SidebarItem
            icon={QrCode}
            label="Generate QR Code"
            active={activeSection === "qr"}
            onClick={() => {
              setSelectedRecord(null);
              handleSectionChange("qr");
            }}
          />
          <SidebarItem
            icon={Clock}
            label="Activity Logs"
            active={activeSection === "activities"}
            onClick={() => {
              setSelectedRecord(null);
              handleSectionChange("activities");
            }}
          />
          <SidebarItem
            icon={MessageCircle}
            label="Correction Updates"
            active={activeSection === "inbox"}
            badge={openSupportCount > 0 ? openSupportCount : undefined}
            onClick={() => {
              setSelectedRecord(null);
              handleSectionChange("inbox");
            }}
          />
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-[#071A2B] text-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">NILARVS Student</p>
              <p className="text-[11px] text-white">National ID–Linked Records</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3 pb-2 flex gap-2 text-xs overflow-x-auto">
          <MobileTab label="Records" active={activeSection === "records"} onClick={() => handleSectionChange("records")} />
          <MobileTab label="Correction" active={activeSection === "correction"} onClick={() => handleSectionChange("correction")} />
          <MobileTab label="QR Code" active={activeSection === "qr"} onClick={() => handleSectionChange("qr")} />
          <MobileTab label="Activity" active={activeSection === "activities"} onClick={() => handleSectionChange("activities")} />
          <MobileTab
            label={`Updates${openSupportCount > 0 ? ` (${openSupportCount})` : ""}`}
            active={activeSection === "inbox"}
            onClick={() => handleSectionChange("inbox")}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen md:pt-0 pt-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-6 md:py-8 space-y-6">

          {/* HEADER */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-[2.2fr,1.3fr]"
          >
            <Card className="bg-[#0F2A44] border border-white/10">
              <CardContent className="p-5 sm:p-6 flex gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {studentName.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white mb-1">Welcome,</p>
                  <h1 className="font-display text-xl sm:text-2xl font-bold">{studentName}</h1>
                  <p className="text-xs sm:text-sm text-white mt-1">
                    FIN (National ID): <span className="font-mono tracking-wide">{nationalId}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] sm:text-xs">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      <ShieldCheck className="h-3 w-3" />
                      Identity Verified
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/5 text-white border border-white/10">
                      <Clock className="h-3 w-3" />
                      Last sync: {isLoading ? "Refreshing…" : "Live"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </motion.section>

          {/* SECTION SWITCHER */}
          <AnimatePresence mode="wait">
            {!selectedRecord && activeSection === "records" && renderRecordList()}
            {!selectedRecord && activeSection === "correction" && renderCorrectionForm()}
            {!selectedRecord && activeSection === "qr" && renderQrSection()}
            {!selectedRecord && activeSection === "activities" && renderActivityLog()}
            {!selectedRecord && activeSection === "inbox" && renderSupportInbox()}
          </AnimatePresence>

          {/* SLIDE-IN DETAIL VIEW */}
          {renderRecordDetail()}

        </div>
      </main>

      {/* LOGOUT CONFIRMATION */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm bg-[#0F2A44] border border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Confirm Logout
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs sm:text-sm text-white space-y-4">
            <p>Are you sure you want to logout from the student dashboard?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setShowLogoutConfirm(false)}>
                No, stay
              </Button>
              <Link to="/">
                <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmLogout}>
                  Yes, logout
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR FULL DIALOG */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="max-w-md bg-[#0F2A44] border border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display text-sm flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              Academic QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs sm:text-sm text-white">
            <div className="flex justify-center">
              <div className="h-44 w-44 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-center">
                {qrData ? (
                  <div className="text-[9px] text-center px-2 break-all">
                    <p className="mb-1 font-semibold">QR Payload (encoded)</p>
                    <p className="opacity-80">{qrData.slice(0, 120)}...</p>
                  </div>
                ) : (
                  <span>No QR data.</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-white">
              This QR represents your verified academic records. Institutions can scan and validate directly against NILARVS.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" className="border-white/10" onClick={() => setShowQr(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------
   SMALL COMPONENTS
------------------------------------------------------------ */

function SidebarItem({
  icon: Icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3 py-3 rounded-xl transition ${
        active
          ? "bg-[#0F2A44] text-white border border-white/10"
          : "text-white hover:bg-[#0F172A]"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </span>
      {badge ? (
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function MobileTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-[11px] ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-white/10 text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <p className="text-white">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function StatusDot({ status }: { status: ActivityItem["status"] }) {
  const color =
    status === "success"
      ? "bg-emerald-500"
      : status === "warning"
      ? "bg-amber-500"
      : "bg-primary";
  return <span className={`h-2 w-2 rounded-full mt-1 ${color}`} />;
}
