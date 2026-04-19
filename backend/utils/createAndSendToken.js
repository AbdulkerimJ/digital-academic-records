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

export const createAndSendStudentToken = (student, res) => {
  const token = signToken({ id: student.id, nationalId: student.nationalId });

  res.cookie("token", token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        nationalId: student.nationalId,
      },
    },
  });
};

export const createAndSendUserToken = (user, res) => {
  const token = signToken({
    id: user.id,
    roleName: user.roleName,
    email: user.email,
  });

  res.cookie("token", token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleName: user.roleName,
        institutionId: user.institutionId,
      },
    },
  });
};
