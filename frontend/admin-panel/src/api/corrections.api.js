import api from "./axios";

export const listCorrectionRequests = async (filters = {}) => {
  const response = await api.get("/api/correction-requests", { params: filters })
  return response.data
}

export const getCorrectionRequestDetail = async (id) => {
  const response = await api.get(`/api/correction-requests/${id}`)
  return response.data
}

export const approveCorrectionRequest = async (id) => {
  const response = await api.patch(`/api/correction-requests/${id}/approve`)
  return response.data
}

export const rejectCorrectionRequest = async (id, reason) => {
  const response = await api.patch(`/api/correction-requests/${id}/reject`, { reason })
  return response.data
}
