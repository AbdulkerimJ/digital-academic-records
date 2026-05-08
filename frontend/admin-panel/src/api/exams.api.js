import api from "./axios"
import { fetchWithAuth } from "./fetchWithAuth"

// Exam Levels
export const listExamLevels = async () => {
  const response = await api.get("/api/exams/levels")
  return response.data
}

export const createExamLevel = async (data) => {
  const response = await api.post("/api/exams/levels", data)
  return response.data
}

export const updateExamLevel = async (id, data) => {
  const response = await api.patch(`/api/exams/levels/${id}`, data)
  return response.data
}

// Records
export const listExams = async (params) => {
  const response = await api.get("/api/exams", { params })
  return response.data
}

export const uploadBulkExams = async (file, institutionCode) => {
  const formData = new FormData()
  formData.append("file", file)
  if (institutionCode) {
    formData.append("institutionCode", institutionCode)
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  
  const response = await fetchWithAuth(`${baseURL}/api/exams/upload-bulk`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const errData = await response.json()
    throw new Error(errData.message || "Failed to start bulk upload")
  }

  return response
}

export const createExam = async (data) => {
  const response = await api.post("/api/exams", data)
  return response.data
}

export const updateExam = async (id, data) => {
  const response = await api.patch(`/api/exams/${id}`, data)
  return response.data
}

export const deleteExam = async (id) => {
  const response = await api.delete(`/api/exams/${id}`)
  return response.data
}

export const getExamById = async (id) => {
  const response = await api.get(`/api/exams/${id}`)
  return response.data
}
