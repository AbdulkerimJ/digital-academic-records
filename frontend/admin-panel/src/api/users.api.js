import api from "./axios"

export const listUsers = async (params) => {
  const response = await api.get("/api/users", { params })
  return response.data
}

export const listRoles = async () => {
  const response = await api.get("/api/users/roles")
  return response.data
}

export const createUser = async (userData) => {
  const response = await api.post("/api/users", userData)
  return response.data
}

export const resendInvite = async (userId) => {
  const response = await api.post(`/api/users/${userId}/resend-invite`)
  return response.data
}

export const revokeInvite = async (userId) => {
  const response = await api.patch(`/api/users/${userId}/revoke-invite`)
  return response.data
}

export const suspendUser = async (userId) => {
  const response = await api.patch(`/api/users/${userId}/suspend`)
  return response.data
}

export const unsuspendUser = async (userId) => {
  const response = await api.patch(`/api/users/${userId}/unsuspend`)
  return response.data
}

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/users/${userId}`)
  return response.data
}

export const updateUser = async ({ userId, data }) => {
  const response = await api.patch(`/api/users/${userId}`, data)
  return response.data
}

export const updateMe = async (data) => {
  const response = await api.patch("/api/users/me", data)
  return response.data
}

export const changePassword = async (data) => {
  const response = await api.patch("/api/users/change-password", data)
  return response.data
}

export const activateAccount = async (data) => {
  const response = await api.post("/api/users/activate-invite", data)
  return response.data
}