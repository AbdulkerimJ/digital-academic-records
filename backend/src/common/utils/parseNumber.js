import AppError from "./appError.js";

const parseNumber = (value, fieldName) => {
  if (value === undefined) return null;

  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new AppError(`${fieldName} must be a valid number.`, 400);
  }

  return parsed;
};

export default parseNumber;
