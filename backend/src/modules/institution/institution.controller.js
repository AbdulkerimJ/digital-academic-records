import catchAsync from "../../common/utils/catchAsync.js";
import AppError from "../../common/utils/appError.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createInstitutionRecord,
  findInstitutionByCode,
  findInstitutionByName,
} from "./institution.repository.js";

const INSTITUTION_TYPES = new Set([
  "GOVERNMENT_BODY",
  "EXAM_BOARD",
  "UNIVERSITY",
  "COLLEGE",
  "REGIONAL_OFFICE",
  "OTHER",
]);

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return null;
};

export const createInstitution = catchAsync(async (req, res) => {
  const { name, code, type, isActive } = req.body || {};

  if (!name || !code || !type) {
    throw new AppError("name, code and type are required", 400);
  }

  const normalizedName = String(name).trim();
  const normalizedCode = String(code).trim().toUpperCase();
  const normalizedType = String(type).trim().toUpperCase();

  if (!normalizedName) {
    throw new AppError("name is required", 400);
  }

  if (!normalizedCode) {
    throw new AppError("code is required", 400);
  }

  if (!INSTITUTION_TYPES.has(normalizedType)) {
    throw new AppError(
      "type must be one of GOVERNMENT_BODY, EXAM_BOARD, UNIVERSITY, COLLEGE, REGIONAL_OFFICE, OTHER",
      400,
    );
  }

  const parsedIsActive = isActive === undefined ? true : parseBoolean(isActive);

  if (parsedIsActive === null) {
    throw new AppError("isActive must be a boolean", 400);
  }

  const existingInstitution = await findInstitutionByName(normalizedName);

  if (existingInstitution) {
    throw new AppError("Institution already exists with this name", 400);
  }

  const existingInstitutionByCode = await findInstitutionByCode(normalizedCode);

  if (existingInstitutionByCode) {
    throw new AppError("Institution already exists with this code", 400);
  }

  const institution = await createInstitutionRecord({
    name: normalizedName,
    code: normalizedCode,
    type: normalizedType,
    isActive: parsedIsActive,
  });

  return sendSuccess(
    res,
    "Institution created successfully",
    { institution },
    201,
  );
});
