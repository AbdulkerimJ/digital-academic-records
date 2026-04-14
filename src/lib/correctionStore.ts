import type { AcademicLevel } from "@/lib/recordStore";

export type CorrectionStatus = "Pending" | "Approved" | "Rejected";

export type CorrectionThread = {
  id: string;
  student: string;
  nationalId: string;

  
  level: AcademicLevel | "";
  subject: string;
  description: string;
  note?: string;
  attachmentName?: string;
  status: CorrectionStatus;
  createdAt: string;
  updatedAt: string;
};

export type CorrectionMessage = {
  id: string;
  threadId: string;
  sender: "student" | "registrar";
  text: string;
  timestamp: string;
};

const THREADS_KEY = "nilarvs-correction-threads";
const MESSAGES_KEY = "nilarvs-correction-messages";
const UPDATE_EVENT = "nilarvs-correction-store-update";

const initialCorrectionThreads: CorrectionThread[] = [
  {
    id: "c1",
    student: "Tigist Haile",
    nationalId: "123456789012",
    level: "Bachelor Degree",
    subject: "Correction request for Bachelor Degree",
    description: "Correct spelling to Tigist H.",
    note: "Name spelling is wrong on certificate",
    status: "Pending",
    createdAt: "2026-04-10T09:10:00.000Z",
    updatedAt: "2026-04-10T09:12:00.000Z",
  },
  {
    id: "c2",
    student: "Dawit Mengistu",
    nationalId: "210987654321",
    level: "Bachelor Degree",
    subject: "Correction request for Bachelor Degree",
    description: "Graduation year should be 2023",
    note: "Transcript year is incorrect",
    status: "Pending",
    createdAt: "2026-04-09T14:00:00.000Z",
    updatedAt: "2026-04-09T14:03:00.000Z",
  },
];

const initialCorrectionMessages: CorrectionMessage[] = [
  {
    id: "m-c1-1",
    threadId: "c1",
    sender: "student",
    text: "Please correct my name.",
    timestamp: "2026-04-10T09:12:00.000Z",
  },
  {
    id: "m-c2-1",
    threadId: "c2",
    sender: "student",
    text: "Year is wrong.",
    timestamp: "2026-04-09T14:03:00.000Z",
  },
];

function safeParse<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function dispatchUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function persistThreads(threads: CorrectionThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  dispatchUpdate();
}

function persistMessages(messages: CorrectionMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  dispatchUpdate();
}

export function loadCorrectionThreads(): CorrectionThread[] {
  if (typeof window === "undefined") return initialCorrectionThreads;
  const saved = safeParse<CorrectionThread>(window.localStorage.getItem(THREADS_KEY));
  return saved.length > 0 ? saved : initialCorrectionThreads;
}

export function loadCorrectionMessages(): CorrectionMessage[] {
  if (typeof window === "undefined") return initialCorrectionMessages;
  const saved = safeParse<CorrectionMessage>(window.localStorage.getItem(MESSAGES_KEY));
  return saved.length > 0 ? saved : initialCorrectionMessages;
}

export function addCorrectionThread(thread: CorrectionThread) {
  const current = loadCorrectionThreads();
  persistThreads([thread, ...current]);
}

export function addCorrectionMessage(message: CorrectionMessage) {
  const current = loadCorrectionMessages();
  persistMessages([...current, message]);
}

export function updateCorrectionThread(id: string, patch: Partial<Omit<CorrectionThread, "id" | "student" | "nationalId" | "createdAt">>) {
  const current = loadCorrectionThreads();
  persistThreads(
    current.map((thread) =>
      thread.id === id
        ? {
            ...thread,
            ...patch,
            updatedAt: patch.updatedAt ?? new Date().toISOString(),
          }
        : thread
    )
  );
}

export function onCorrectionUpdate(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(UPDATE_EVENT, listener);
  return () => window.removeEventListener(UPDATE_EVENT, listener);
}
