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

/* ---------------- MOCK DATA PERSISTENCE HELPERS ---------------- */
const getStored = (key, initial) => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const saveStored = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/* ---------------- INITIAL MOCK DATA ---------------- */
const INITIAL_INSTITUTIONS = [
  { id: "1", name: "Arba Minch University", code: "AMU", type: "PUBLIC_UNIVERSITY", isActive: true, createdAt: new Date().toISOString() },
  { id: "2", name: "Addis Ababa University", code: "AAU", type: "PUBLIC_UNIVERSITY", isActive: true, createdAt: new Date().toISOString() },
  { id: "3", name: "Jimma University", code: "JU", type: "PUBLIC_UNIVERSITY", isActive: true, createdAt: new Date().toISOString() },
];

const INITIAL_REGISTRARS = [
  { id: "r1", name: "Dr. Bekele Mekonnen", institution: "Arba Minch University", username: "registrar@amu.edu.et" },
  { id: "r2", name: "Abebech Tadesse", institution: "Addis Ababa University", username: "registrar@aau.edu.et" },
];

const INITIAL_RECORDS = [
  { id: "rec1", name: "Samuel Kebede", nationalId: "ETH-1234-5678", gpa: "3.85", year: "2023", field_of_study: "Software Engineering", level: "Undergraduate", institution: "Arba Minch University" },
  { id: "rec2", name: "Helen Tesfaye", nationalId: "ETH-8765-4321", gpa: "3.92", year: "2024", field_of_study: "Computer Science", level: "Undergraduate", institution: "Addis Ababa University" },
];

const INITIAL_CORRECTIONS = [
  { id: "c1", student: "Samuel Kebede", nationalId: "ETH-1234-5678", description: "GPA should be 3.88 instead of 3.85", status: "PENDING" },
  { id: "c2", student: "Helen Tesfaye", nationalId: "ETH-8765-4321", description: "Graduation year is incorrect, should be 2024.", status: "PENDING" },
  { id: "c3", student: "Abebe Bikila", nationalId: "ETH-1111-2222", description: "Missing 'Introduction to Programming' course on transcript.", status: "APPROVED" },
];

/* ---------------- INTERCEPTORS (MOCK MODE) ---------------- */
if (USE_MOCK_DATA) {
  api.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    const url = config.url;

    console.log(`[NAR-MOCK-API] ${method.toUpperCase()} ${url}`, config.data);

    // 1. AUTHENTICATION (Institutional Login)
    if (method === "post" && url === "/users/login") {
      const { email, password, intendedRole } = config.data;
      
      // Assign roles based on intendedRole or email keywords
      let role = "REGISTRAR";
      let firstName = "Institutional";
      let lastName = "Registrar";

      if (intendedRole === "admin" || email === "admin@nilarvs.gov.et") {
        role = "SUPER_ADMIN";
        firstName = "System";
        lastName = "Admin";
      } else if (intendedRole === "registrar" || email.includes("registrar")) {
        role = "REGISTRAR";
      }

      throw { 
        isMock: true, 
        data: { 
          success: true, 
          data: { 
            token: "mock-token-" + Math.random().toString(36).substr(2), 
            user: { 
              id: Math.floor(Math.random() * 1000), 
              email, 
              first_name: firstName, 
              last_name: lastName, 
              role_name: role,
              institution: role === "REGISTRAR" ? "Arba Minch University" : null
            } 
          } 
        } 
      };
    }

    // 2. STUDENT AUTH (Fayda)
    if (method === "post" && url.includes("/auth/login")) {
      throw { isMock: true, data: { success: true, message: "OTP sent successfully", data: null } };
    }

    if (method === "post" && url.includes("/auth/verify")) {
      const { faydaId } = config.data;
      throw { isMock: true, data: { success: true, data: { token: "mock-student-token", user: { id: 501, national_id: faydaId, first_name: "Verified", last_name: "Student", role_name: "STUDENT" } } } };
    }

    if (method === "post" && url.includes("/auth/register")) {
      throw { isMock: true, data: { success: true, message: "Registration successful" } };
    }

    // 3. INSTITUTIONS
    if (url.includes("/institutions")) {
      if (method === "get") {
        throw { isMock: true, data: { success: true, data: getStored("nar-mock-institutions", INITIAL_INSTITUTIONS) } };
      }
      if (method === "post") {
        const current = getStored("nar-mock-institutions", INITIAL_INSTITUTIONS);
        const newItem = { id: Math.random().toString(36).substr(2, 9), ...config.data, createdAt: new Date().toISOString() };
        saveStored("nar-mock-institutions", [...current, newItem]);
        throw { isMock: true, data: { success: true, data: { institution: newItem } } };
      }
    }

    // 4. REGISTRARS
    if (url.includes("/registrars")) {
      throw { isMock: true, data: { success: true, data: getStored("nar-mock-registrars", INITIAL_REGISTRARS) } };
    }

    // 5. RECORDS
    if (url.includes("/records") || url.includes("/upload")) {
      const current = getStored("nar-mock-records", INITIAL_RECORDS);
      if (method === "get") {
        throw { isMock: true, data: { success: true, data: current } };
      }
      if (method === "post") {
        const newItem = { id: Math.random().toString(36).substr(2, 9), ...config.data, createdAt: new Date().toISOString() };
        saveStored("nar-mock-records", [...current, newItem]);
        throw { isMock: true, data: { success: true, data: newItem } };
      }
    }

    // 6. CORRECTIONS
    if (url.includes("/corrections") || url.includes("/correction")) {
      const current = getStored("nar-mock-corrections-v2", INITIAL_CORRECTIONS);
      if (method === "get") {
        throw { isMock: true, data: { success: true, data: current } };
      }
      if (method === "post") {
        const newItem = { id: Math.random().toString(36).substr(2, 9), ...config.data, status: "PENDING", createdAt: new Date().toISOString() };
        saveStored("nar-mock-corrections-v2", [...current, newItem]);
        throw { isMock: true, data: { success: true, data: newItem } };
      }
      if (method === "patch") {
        const id = url.split("/").pop();
        const updated = current.map(c => c.id === id ? { ...c, ...config.data } : c);
        saveStored("nar-mock-corrections-v2", updated);
        throw { isMock: true, data: { success: true, message: "Status updated" } };
      }
    }

    // 7. STUDENT PROFILE
    if (url.includes("/student/profile")) {
      throw { isMock: true, data: { success: true, data: { 
        id: 501, 
        national_id: localStorage.getItem("nar-current-student-id") || "ETH-1234-5678", 
        first_name: "Samuel", 
        last_name: "Kebede", 
        date_of_birth: "1998-05-12", 
        gender: "MALE",
        role_name: "STUDENT" 
      } } };
    }

    throw { isMock: true, data: { success: true, message: "Demo mode catch-all", data: {} } };
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.isMock) return Promise.resolve({ data: error.data });
      return Promise.reject(error);
    }
  );
}

// Global Headers Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nar-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  login: (data) => api.post("/users/login", data),
  getInstitutions: () => api.get("/institutions"),
  createInstitution: (data) => api.post("/institutions", data),
  getRegistrars: () => api.get("/registrars"),
  getProfile: () => api.get("/student/profile"),
  getStudentRecords: () => api.get("/student/records"),
  submitCorrection: (data) => api.post("/student/correction", data),
  getRecords: () => api.get("/registrar/records"),
  uploadRecord: (data) => api.post("/registrar/upload", data),
  getCorrections: () => api.get("/registrar/corrections"),
  updateCorrection: (id, data) => api.patch(`/registrar/corrections/${id}`, data),
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
};
