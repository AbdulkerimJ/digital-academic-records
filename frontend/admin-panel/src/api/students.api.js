import api from "./axios"
import { fetchWithAuth } from "./fetchWithAuth"

export const listStudents = async (params) => {
  const response = await api.get("/api/students", { params })
  return response.data
}

export const getStudentById = async (id) => {
  const response = await api.get(`/api/students/${id}`)
  return response.data
}

export const getStudentRecords = async (id) => {
  const response = await api.get(`/api/students/${id}/records`)
  return response.data
}

export const registerStudent = async (data) => {
  const response = await api.post("/api/students/register", data)
  return response.data
}

export const registerBulkStudentsStream = async (file, institutionCode) => {
  const formData = new FormData()
  formData.append("file", file)

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  
  const response = await fetchWithAuth(`${baseURL}/api/students/register-bulk`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const errData = await response.json()
    throw new Error(errData.message || "Failed to start bulk registration")
  }

  return response
}

export const deleteStudent = async (id) => {
  const response = await api.delete(`/api/students/${id}`)
  return response.data
}
