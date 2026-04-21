import jwt from "jsonwebtoken";

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

const getCookieOptions = () => {
  return {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };
};

export const clearUserAuthCookie = (res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
};

export const createAndSendStudentToken = (student, res) => {
  const { id, nationalId, firstName, lastName } = student;
  const token = signToken({ id, nationalId });

  res.cookie("token", token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id,
        firstName,
        lastName,
        nationalId,
      },
    },
  });
};

export const createAndSendUserToken = (
  user,
  res,
  message = "Login successful",
) => {
  const { id, email, firstName, lastName, roleName, institutionId } = user;
  const token = signToken({
    id,
    roleName,
    email,
  });

  res.cookie("token", token, getCookieOptions());

  res.status(200).json({
    success: true,
    message,
    data: {
      user: {
        id,
        firstName,
        lastName,
        email,
        roleName,
        institutionId,
      },
    },
  });
};
