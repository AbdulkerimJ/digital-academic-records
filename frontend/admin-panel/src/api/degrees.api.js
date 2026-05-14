import api from "./axios"
import { fetchWithAuth } from "./fetchWithAuth"

// Degree Levels
export const listDegreeLevels = async () => {
  const response = await api.get("/api/degrees/levels")
  return response.data
}

export const createDegreeLevel = async (data) => {
  const response = await api.post("/api/degrees/levels", data)
  return response.data
}

export const updateDegreeLevel = async (id, data) => {
  const response = await api.patch(`/api/degrees/levels/${id}`, data)
  return response.data
}

export const deleteDegreeLevel = async (id) => {
  const response = await api.delete(`/api/degrees/levels/${id}`)
  return response.data
}

// Degree Titles
export const listDegreeTitles = async (params) => {
  const response = await api.get("/api/degrees/titles", { params })
  return response.data
}

export const createDegreeTitle = async (data) => {
  const response = await api.post("/api/degrees/titles", data)
  return response.data
}

export const updateDegreeTitle = async (id, data) => {
  const response = await api.patch(`/api/degrees/titles/${id}`, data)
  return response.data
}

export const deleteDegreeTitle = async (id) => {
  const response = await api.delete(`/api/degrees/titles/${id}`)
  return response.data
}

// Records
export const listDegrees = async (params) => {
  const response = await api.get("/api/degrees", { params })
  return response.data
}

export const uploadBulkDegrees = async (file, institutionCode) => {
  const formData = new FormData()
  formData.append("file", file)
  if (institutionCode) {
    formData.append("institutionCode", institutionCode)
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  
  const response = await fetchWithAuth(`${baseURL}/api/degrees/upload-bulk`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const errData = await response.json()
    throw new Error(errData.message || "Failed to start bulk upload")
  }

  return response
}

export const createDegree = async (data) => {
  const response = await api.post("/api/degrees", data)
  return response.data
}

export const updateDegree = async (id, data) => {
  const response = await api.patch(`/api/degrees/${id}`, data)
  return response.data
}

export const deleteDegree = async (id) => {
  const response = await api.delete(`/api/degrees/${id}`)
  return response.data
}

export const getDegreeById = async (id) => {
  const response = await api.get(`/api/degrees/${id}`)
  return response.data
}
