import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const REFRESH_COOKIE_MAX_AGE_MS = Number(process.env.REFRESH_COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

const STUDENT_ACCESS_TOKEN_EXPIRES_IN = process.env.STUDENT_ACCESS_TOKEN_EXPIRES_IN || "30m";
const STUDENT_REFRESH_TOKEN_EXPIRES_IN = process.env.STUDENT_REFRESH_TOKEN_EXPIRES_IN || "30d";
const STUDENT_REFRESH_COOKIE_MAX_AGE_MS = Number(process.env.STUDENT_REFRESH_COOKIE_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000;


const REFRESH_COOKIE_SAME_SITE =
  process.env.REFRESH_COOKIE_SAME_SITE || "Strict";
const REFRESH_COOKIE_PATH = process.env.REFRESH_COOKIE_PATH || "/";
export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME || "refreshToken";

export const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const signStudentAccessToken = (payload) => {
  return jwt.sign(payload, process.env.STUDENT_ACCESS_SECRET, {
    expiresIn: STUDENT_ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const signStudentRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.STUDENT_REFRESH_SECRET, {
    expiresIn: STUDENT_REFRESH_TOKEN_EXPIRES_IN,
  });
};


export const userRefreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  path: REFRESH_COOKIE_PATH,
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
};

export const studentRefreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  path: REFRESH_COOKIE_PATH,
  maxAge: STUDENT_REFRESH_COOKIE_MAX_AGE_MS,
};

export const clearUserAuthCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...userRefreshCookieOptions, maxAge: 0 });
};

export const clearStudentAuthCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...studentRefreshCookieOptions, maxAge: 0 });
};


export const createAndSendStudentToken = (student, res) => {
  const { id, nationalId, tokenVersion = 0 } = student;
  const accessToken = signStudentAccessToken({ id, nationalId, tokenVersion });
  const refreshToken = signStudentRefreshToken({ id, nationalId, tokenVersion });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, studentRefreshCookieOptions);


  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        ...student
      },
    },
  });
};

export const createAndSendUserToken = (
  user,
  res,
  message = "Login successful",
) => {
  const {
    id,
    email,
    firstName,
    lastName,
    roleName,
    institutionId,
    institutionName,
    institutionCode,
    institutionType,
    tokenVersion = 0,
  } = user;
  const payload = {
    id,
    roleName,
    email,
    tokenVersion,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, userRefreshCookieOptions);


  res.status(200).json({
    success: true,
    message,
    data: {
      accessToken,
      user: {
        id,
        firstName,
        lastName,
        email,
        roleName,
        institutionId,
        institutionName,
        institutionCode,
        institutionType,
      },
    },
  });
};
