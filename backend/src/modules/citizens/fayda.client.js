import { authClient, citizenClient } from "../../common/config/faydaAxios.js";

export const getCitizen = async (faydaId) => {
  try {
    const res = await citizenClient.get(`/${faydaId}`);
    return res.data;
  } catch (error) {
    return { success: false, message: "Fayda service is unreachable" };
  }
};

export const sendOtp = async (faydaId) => {
  try {
    const res = await authClient.post(`/send-otp`, { faydaId });
    return res.data;
  } catch (error) {
    return { success: false, message: "Fayda authentication service is unreachable" };
  }
};

export const verifyOtp = async (faydaId, otp) => {
  try {
    const res = await authClient.post(`/verify-otp`, {
      faydaId,
      otp,
    });
    return res.data;
  } catch (error) {
    return { success: false, message: "Fayda verification service is unreachable" };
  }
};

