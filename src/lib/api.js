import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://digital-academic-records.onrender.com/api";
const USE_MOCK_DATA = true;

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Mock Data & Helpers ---
const MOCK_DELAY = 800;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_USER = {
  id: "mock-123",
  first_name: "Samuel",
  last_name: "Kebede",
  national_id: "ETH-1234-5678",
  email: "student@test.com",
  date_of_birth: "1998-05-12",
  gender: "Male",
  role: "STUDENT"
};

const MOCK_DEGREES = [
  {
    id: "deg-1",
    institutionName: "Addis Ababa University",
    field_of_study: "Software Engineering",
    gpa: "3.85",
    year: "2022",
    type: "DEGREE"
  }
];

const MOCK_EXAMS = [
  {
    id: "ex-1",
    institution: "National Educational Assessment and Examinations Agency",
    titleName: "Grade 12 National Exam",
    score: "582/700",
    examYear: "2018",
    type: "EXAM"
  }
];

// Persistent Mock Corrections in Session Storage
const getMockCorrections = () => {
  const saved = sessionStorage.getItem("mock-corrections");
  return saved ? JSON.parse(saved) : [
    {
      id: "corr-1",
      description: "My graduation year is incorrectly listed as 2021 instead of 2022.",
      status: "APPROVED",
      createdAt: new Date().toISOString()
    }
  ];
};

const saveMockCorrection = (desc) => {
  const current = getMockCorrections();
  const newItem = {
    id: `corr-${Date.now()}`,
    description: desc,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };
  sessionStorage.setItem("mock-corrections", JSON.stringify([newItem, ...current]));
  return newItem;
};

// --- API Implementation ---

const realApi = {
  // Auth
  login: (data) => api.post("/users/login", data),
  studentLogin: (data) => api.post("/students/login", data),
  verifyStudent: (data) => api.post("/students/verify", data),
  getMe: () => api.get("/users/me"),
  getStudentMe: () => api.get("/students/me"),
  changePassword: (data) => api.patch("/users/change-password", data),

  // Institutions (Admin)
  getInstitutions: () => api.get("/institutions"),
  createInstitution: (data) => api.post("/institutions", data),
  updateInstitution: (id, data) => api.patch(`/institutions/${id}`, data),

  // Users/Registrars (Admin)
  getUsers: () => api.get("/users"),
  createUser: (data) => api.post("/users", data),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),

  // Degrees (University Registrar)
  getDegrees: () => api.get("/degrees"),
  uploadDegree: (data) => api.post("/degrees", data),
  updateDegree: (id, data) => api.patch(`/degrees/${id}`, data),

  // Exams (Exam Board Registrar)
  getExams: () => api.get("/exams"),
  uploadExam: (data) => api.post("/exams", data),
  updateExam: (id, data) => api.patch(`/exams/${id}`, data),

  // Correction Requests
  getCorrections: () => api.get("/correction-requests"),
  getStudentCorrections: () => api.get("/students/correction-requests"),
  submitCorrection: (data) => api.post("/students/correction-requests", data),
  updateCorrectionStatus: (id, status) => api.patch(`/correction-requests/${id}/${status}`),

  // Generic
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  patch: (url, data) => api.patch(url, data),
  delete: (url) => api.delete(url),
};

const mockApi = {
  ...realApi,
  studentLogin: async (data) => {
    await sleep(MOCK_DELAY);
    return { data: { success: true, message: "OTP Sent" } };
  },
  verifyStudent: async (data) => {
    await sleep(MOCK_DELAY);
    return { 
      data: { 
        success: true, 
        data: { accessToken: "mock-token", user: MOCK_USER } 
      } 
    };
  },
  getStudentMe: async () => {
    await sleep(MOCK_DELAY);
    return { data: { success: true, data: MOCK_USER } };
  },
  getDegrees: async () => {
    await sleep(MOCK_DELAY);
    return { data: { success: true, data: MOCK_DEGREES } };
  },
  getExams: async () => {
    await sleep(MOCK_DELAY);
    return { data: { success: true, data: MOCK_EXAMS } };
  },
  getStudentCorrections: async () => {
    await sleep(MOCK_DELAY);
    return { data: { success: true, data: getMockCorrections() } };
  },
  submitCorrection: async (data) => {
    await sleep(MOCK_DELAY);
    const newItem = saveMockCorrection(data.description);
    return { data: { success: true, data: newItem } };
  },
  post: (url, data) => {
    if (url === "/student/correction") return mockApi.submitCorrection(data);
    return realApi.post(url, data);
  }
};

console.log("[NAR-DEBUG] Mock Mode Active:", USE_MOCK_DATA);
export default USE_MOCK_DATA ? mockApi : realApi;

