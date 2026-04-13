import axios from "axios";

const FAYDA_BASE_URL = process.env.FAYDA_BASE_URL;

// 1. Get citizen
export const getCitizen = async (faydaId) => {
  const res = await axios.get(`${FAYDA_BASE_URL}/citizens/${faydaId}`);
  return res.data;
};

// 2. Send OTP
export const sendOtp = async (faydaId) => {
  const res = await axios.post(`${FAYDA_BASE_URL}/send-otp`, { faydaId });
  return res.data;
};

// 3. Verify OTP
export const verifyOtp = async (faydaId, otp) => {
  const res = await axios.post(`${FAYDA_BASE_URL}/verify-otp`, {
    faydaId,
    otp,
  });
  return res.data;
};