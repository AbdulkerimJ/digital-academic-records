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
