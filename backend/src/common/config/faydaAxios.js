import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const FAYDA_BASE_URL = process.env.FAYDA_BASE_URL;

const baseConfig = {
  validateStatus: () => true, // Accept all status codes for custom error handling
  timeout: 5000, // Fail after 5 seconds if no response
};


export const citizenClient = axios.create({
  ...baseConfig,
  baseURL: `${FAYDA_BASE_URL}/citizens`,
});

export const authClient = axios.create({
  ...baseConfig,
  baseURL: `${FAYDA_BASE_URL}/auth`,
});
