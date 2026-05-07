import api from "./axios"

export const listInstitutions = async (params) => {
  const response = await api.get("/api/institutions", { params })
  return response.data
}

export const createInstitution = async (data) => {
  const response = await api.post("/api/institutions", data)
  return response.data
}

export const updateInstitution = async (id, data) => {
  const response = await api.patch(`/api/institutions/${id}`, data)
  return response.data
}

export const listInstitutionTypes = async () => {
  const response = await api.get("/api/institutions/types")
  return response.data
}

export const listColleges = async (institutionId) => {
  const response = await api.get(`/api/institutions/${institutionId}/colleges`)
  return response.data
}

export const createCollege = async (institutionId, data) => {
  const response = await api.post(`/api/institutions/${institutionId}/colleges`, data)
  return response.data
}

export const updateCollege = async (institutionId, collegeId, data) => {
  const response = await api.patch(`/api/institutions/${institutionId}/colleges/${collegeId}`, data)
  return response.data
}

export const deleteCollege = async (institutionId, collegeId) => {
  const response = await api.delete(`/api/institutions/${institutionId}/colleges/${collegeId}`)
  return response.data
}

export const listDepartments = async (institutionId, collegeId) => {
  const response = await api.get(`/api/institutions/${institutionId}/colleges/${collegeId}/departments`)
  return response.data
}

export const createDepartment = async (institutionId, collegeId, data) => {
  const response = await api.post(`/api/institutions/${institutionId}/colleges/${collegeId}/departments`, data)
  return response.data
}

export const updateDepartment = async (institutionId, collegeId, departmentId, data) => {
  const response = await api.patch(`/api/institutions/${institutionId}/colleges/${collegeId}/departments/${departmentId}`, data)
  return response.data
}

export const deleteDepartment = async (institutionId, collegeId, departmentId) => {
  const response = await api.delete(`/api/institutions/${institutionId}/colleges/${collegeId}/departments/${departmentId}`)
  return response.data
}
