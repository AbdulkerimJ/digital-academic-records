export type AcademicLevel =
  | "Grade 6"
  | "Grade 8"
  | "Grade 12"
  | "Exit Exam"
  | "Bachelor Degree"
  | "Masters"
  | "PhD";

export type RecordStatus = "Pass" | "Distinction" | "Pending" | "Error";

export type AcademicRecord = {
  id: string;
  nationalId: string;
  studentName: string;
  level: AcademicLevel;
  institution: string;
  year: string;
  result: string;
  status: RecordStatus;
  certificateId: string;
  uploadedBy: string;
  uploadedAt: string;
  approved: boolean;
};

const STORAGE_KEY = "nilarvs-academic-records";
const EVENT_NAME = "nilarvs-academic-record-store-update";

function safeParse(data: string | null): AcademicRecord[] {
  try {
    const parsed = JSON.parse(data ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadRecords(): AcademicRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function persistRecords(records: AcademicRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getStudentRecords(nationalId: string): AcademicRecord[] {
  const normalized = nationalId.trim().toUpperCase();
  return loadRecords().filter(
    (record) =>
      record.nationalId.toUpperCase() === normalized && record.approved === true
  );
}

export function getStudentProfile(nationalId: string) {
  const records = getStudentRecords(nationalId);
  return {
    studentName: records[0]?.studentName ?? "Student",
    nationalId: nationalId.trim(),
  };
}

export function saveAcademicRecord(record: AcademicRecord) {
  const all = loadRecords();
  persistRecords([...all, record]);
}

export function saveAcademicRecordsBulk(records: AcademicRecord[]) {
  const all = loadRecords();
  persistRecords([...all, ...records]);
}

export function onAcademicRecordUpdate(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
