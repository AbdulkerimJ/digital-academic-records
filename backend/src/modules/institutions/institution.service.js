import AppError from "../../common/utils/appError.js";
import {
  createInstitutionRecord,
  findInstitutionById,
  findInstitutionByCode,
  findInstitutionByCodeAll,
  restoreInstitutionById,
  findInstitutions,
  updateInstitutionById,
  getInstitutionTypes,
  deleteInstitutionRecord,
} from "./institution.repository.js";
import { logActionService } from "../audit/audit.service.js";

export const getInstitutionTypesService = async () => {
  return getInstitutionTypes();
};

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

export const createInstitutionService = async ({
  name,
  code,
  type,
  isActive,
  user,
  req,
}) => {
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

  const allTypes = await getInstitutionTypesService();
  const allowedCodes = allTypes.map(t => t.code);
  const INSTITUTION_TYPES = new Set(allowedCodes);

  if (!INSTITUTION_TYPES.has(normalizedType)) {
    throw new AppError(
      `Type must be one of: ${allowedCodes.join(", ")}`,
      400,
    );
  }

  const parsedIsActive = isActive === undefined ? true : parseBoolean(isActive);

  if (parsedIsActive === null) {
    throw new AppError("isActive must be a boolean", 400);
  }

  // Check for existing code (including deleted)
  const allInstitution = await findInstitutionByCodeAll(normalizedCode);
  
  if (allInstitution) {
    if (!allInstitution.isDeleted) {
      throw new AppError("Institution already exists with this code", 400);
    }
    // RESTORE logic
    await restoreInstitutionById(allInstitution.id);
    const restored = await updateInstitutionById({
      id: allInstitution.id,
      name: normalizedName,
      type: normalizedType,
      isActive: parsedIsActive,
    });

    await logActionService({
      user,
      action: "RESTORE_INSTITUTION",
      entityType: "INSTITUTION",
      entityId: allInstitution.id,
      newValues: restored,
      req,
    });

    return restored;
  }

  const institution = await createInstitutionRecord({
    name: normalizedName,
    code: normalizedCode,
    type: normalizedType,
    isActive: parsedIsActive,
  });

  await logActionService({
    user,
    action: "CREATE_INSTITUTION",
    entityType: "INSTITUTION",
    entityId: institution.id,
    newValues: institution,
    req,
  });

  return institution;
};

export const getInstitutionByIdService = async ({ institutionId }) => {
  if (!institutionId) {
    throw new AppError("institutionId is required", 400);
  }

  const institution = await findInstitutionById(institutionId);

  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  return institution;
};

export const listInstitutionsService = async ({
  limit,
  offset,
  search,
  type,
  status,
  sortBy,
  sortDir
} = {}) => {
  return findInstitutions({
    limit,
    offset,
    search,
    type,
    status,
    sortBy,
    sortDir
  });
};

export const updateInstitutionService = async ({
  institutionId,
  name,
  code,
  type,
  isActive,
  user,
  req,
}) => {
  if (!institutionId) {
    throw new AppError("institutionId is required", 400);
  }

  const currentInstitution = await findInstitutionById(institutionId);
  if (!currentInstitution) {
    throw new AppError("Institution not found", 404);
  }

  const normalizedName =
    name === undefined || name === null ? null : String(name).trim();
  const normalizedCode =
    code === undefined || code === null
      ? null
      : String(code).trim().toUpperCase();
  const normalizedType =
    type === undefined || type === null
      ? null
      : String(type).trim().toUpperCase();
  const parsedIsActive = isActive === undefined ? null : parseBoolean(isActive);

  if (normalizedName !== null && !normalizedName) {
    throw new AppError("name cannot be empty", 400);
  }

  if (normalizedCode !== null && !normalizedCode) {
    throw new AppError("code cannot be empty", 400);
  }

  if (normalizedType !== null) {
    const allTypes = await getInstitutionTypesService();
    const allowedCodes = allTypes.map(t => t.code);
    const INSTITUTION_TYPES = new Set(allowedCodes);

    if (!INSTITUTION_TYPES.has(normalizedType)) {
      throw new AppError(
        `Type must be one of: ${allowedCodes.join(", ")}`,
        400,
      );
    }
  }

  if (isActive !== undefined && parsedIsActive === null) {
    throw new AppError("isActive must be a boolean", 400);
  }

  if (
    normalizedName === null &&
    normalizedCode === null &&
    normalizedType === null &&
    parsedIsActive === null
  ) {
    throw new AppError(
      "At least one field is required",
      400,
    );
  }

  // Name check removed as per user request (name uniqueness no longer enforced)

  if (normalizedCode !== null) {
    const existingInstitutionByCode =
      await findInstitutionByCode(normalizedCode);
    if (
      existingInstitutionByCode &&
      existingInstitutionByCode.id !== institutionId
    ) {
      throw new AppError("Institution already exists with this code", 400);
    }
  }

  const updatedInstitution = await updateInstitutionById({
    id: institutionId,
    name: normalizedName,
    code: normalizedCode,
    type: normalizedType,
    isActive: parsedIsActive,
  });

  if (!updatedInstitution) {
    throw new AppError("Failed to update institution", 500);
  }

  await logActionService({
    user,
    action: "UPDATE_INSTITUTION",
    entityType: "INSTITUTION",
    entityId: institutionId,
    oldValues: currentInstitution,
    newValues: updatedInstitution,
    req,
  });

  return updatedInstitution;
};

export const deleteInstitutionService = async ({ institutionId, user, req }) => {
  if (!institutionId) {
    throw new AppError("institutionId is required", 400);
  }

  const institution = await findInstitutionById(institutionId);
  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  const deleted = await deleteInstitutionRecord(institutionId);
  if (!deleted) {
    throw new AppError("Failed to delete institution.", 500);
  }

  await logActionService({
    user,
    action: "DELETE_INSTITUTION",
    entityType: "INSTITUTION",
    entityId: institutionId,
    oldValues: institution,
    req,
  });

  return deleted;
};
