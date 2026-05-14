import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AFROMESSAGE_API_URL =
  process.env.AFROMESSAGE_API_URL ||
  "https://api.afromessage.com/api/send";

const AFROMESSAGE_IDENTIFIER_ID =
  process.env.AFROMESSAGE_IDENTIFIER_ID;

export async function sendSMS({ to, message }) {
  if (!AFROMESSAGE_IDENTIFIER_ID) {
    throw new Error(
      "AfroMessage IDENTIFIER_ID not set in environment variables"
    );
  }

  if (!process.env.AFROMESSAGE_TOKEN) {
    throw new Error(
      "AfroMessage TOKEN not set in environment variables"
    );
  }

  try {
    const params = {
      from: AFROMESSAGE_IDENTIFIER_ID,
      to,
      message,
    };

    const res = await axios.get(AFROMESSAGE_API_URL, {
      params,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AFROMESSAGE_TOKEN}`,
      },
    });

    if (res.data.acknowledge === "error") {
      const errorMsg = res.data.response?.errors?.[0] || "Unknown AfroMessage error";
      throw new Error(errorMsg);
    }

    return res.data;
  } catch (err) {
    const errorDetail = err.response?.data?.response?.errors?.[0] || err.response?.data?.message || err.message;
    throw new Error(errorDetail);
  }
}
