import api from "./axios";

export const getAuditLogs = async (params = {}) => {
  const response = await api.get("/api/audit-logs", { params });
  return response.data;
};
