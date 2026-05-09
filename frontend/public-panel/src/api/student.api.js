import api from './axios'

// Auth
export const requestOtp = async (faydaId) => {
  const res = await api.post('/api/students/login', { faydaId })
  return res.data
}

export const verifyOtp = async (faydaId, otp) => {
  const res = await api.post('/api/students/verify', { faydaId, otp })
  return res.data
}

export const logoutStudent = async () => {
  const res = await api.post('/api/students/logout')
  return res.data
}

// Profile & Records
export const getMyProfile = async () => {
  const res = await api.get('/api/students/me')
  return res.data
}

export const getMyExams = async () => {
  const res = await api.get('/api/students/me/exams')
  return res.data
}

export const getMyDegrees = async () => {
  const res = await api.get('/api/students/me/degrees')
  return res.data
}

// Correction Requests
export const submitCorrectionRequest = async (recordId, payload) => {
  const res = await api.post(`/api/students/records/${recordId}/correction`, payload)
  return res.data
}

export const getMyRequests = async () => {
  const res = await api.get('/api/students/correction-requests')
  return res.data
}

// QR Codes
export const generateQrCode = async () => {
  const res = await api.post('/api/qr/generate')
  return res.data
}

export const getMyQrTokens = async () => {
  const res = await api.get('/api/qr/my-tokens')
  return res.data
}

export const deleteQrToken = async (id) => {
  const res = await api.delete(`/api/qr/${id}`)
  return res.data
}

// Public — Employer Verification (no auth needed)
export const verifyQrToken = async (token) => {
  const res = await api.get(`/api/qr/verify/${token}`)
  return res.data
}
