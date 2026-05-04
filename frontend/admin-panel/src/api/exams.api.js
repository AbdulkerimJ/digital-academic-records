import api from "./axios"

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

export const uploadBulkExams = async (formData) => {
  const response = await api.post("/api/exams/upload-bulk", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}
