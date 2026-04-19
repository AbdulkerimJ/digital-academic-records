import { authClient, citizenClient } from "../config/faydaAxios.js";

export const getCitizen = async (faydaId) => {
  const res = await citizenClient.get(`/${faydaId}`);
  return res.data;
};

export const sendOtp = async (faydaId) => {
  const res = await authClient.post(`/send-otp`, { faydaId });
  return res.data;
};

export const verifyOtp = async (faydaId, otp) => {
  const res = await authClient.post(`/verify-otp`, {
    faydaId,
    otp,
  });
  return res.data;
};
