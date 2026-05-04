import api from "./axios"

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

// Records
export const listDegrees = async (params) => {
  const response = await api.get("/api/degrees", { params })
  return response.data
}

export const uploadBulkDegrees = async (formData) => {
  const response = await api.post("/api/degrees/upload-bulk", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}
