
import bcrypt from "bcryptjs";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

// Hash password
export const hashPassword = async (password) => {
  if (!password) throw new Error("Password is required");

  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password
export const comparePassword = async (plainPassword, userPassword) => {
  return await bcrypt.compare(plainPassword, userPassword);
};
