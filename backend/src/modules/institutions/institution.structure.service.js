import AppError from "../../common/utils/appError.js";
import {
  findCollegeById,
  findColleges,
  findCollegeByCode,
  findCollegeByName,
  createCollegeRecord,
  updateCollegeById,
  deleteCollegeById,
} from "./college.repository.js";
import {
  findDepartmentById,
  findDepartments,
  findDepartmentByCode,
  findDepartmentByName,
  createDepartmentRecord,
  updateDepartmentById,
  deleteDepartmentById,
} from "./department.repository.js";
import { findInstitutionById } from "./institution.repository.js";

// ===================== COLLEGE CRUD =====================

export const listCollegesService = async ({ user, institutionId }) => {
  // Enforce institution scope for non-super-admins
  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to access colleges for this institution.", 403);
    }
  }

  const institution = await findInstitutionById(institutionId);
  if (!institution) {
    throw new AppError("Institution not found.", 404);
  }

  return findColleges(institutionId);
};

export const createCollegeService = async ({ user, institutionId, data }) => {
  const { name, code, isActive } = data;

  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to create colleges for this institution.", 403);
    }
  }

  if (!name || !code) {
    throw new AppError("Name and code are required.", 400);
  }

  const institution = await findInstitutionById(institutionId);
  if (!institution) {
    throw new AppError("Institution not found.", 404);
  }

  // Check uniqueness per institution
  const existingName = await findCollegeByName(name, institutionId);
  if (existingName) {
    throw new AppError("A college with this name already exists in this institution.", 400);
  }

  const existingCode = await findCollegeByCode(code, institutionId);
  if (existingCode) {
    throw new AppError("A college with this code already exists in this institution.", 400);
  }

  return createCollegeRecord({
    institutionId,
    name: String(name).trim(),
    code: String(code).trim().toUpperCase(),
    isActive: isActive === undefined ? true : Boolean(isActive),
  });
};

export const getCollegeByIdService = async ({ user, institutionId, collegeId }) => {
  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to access this institution's colleges.", 403);
    }
  }

  const college = await findCollegeById(collegeId);
  if (!college || college.institutionId !== institutionId) {
    throw new AppError("College not found in this institution.", 404);
  }

  return college;
};

export const updateCollegeService = async ({ user, institutionId, collegeId, data }) => {
  const { name, code, isActive } = data;

  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to update colleges for this institution.", 403);
    }
  }

  const currentCollege = await findCollegeById(collegeId);
  if (!currentCollege || currentCollege.institutionId !== institutionId) {
    throw new AppError("College not found in this institution.", 404);
  }

  const normalizedName = name !== undefined ? String(name).trim() : null;
  const normalizedCode = code !== undefined ? String(code).trim().toUpperCase() : null;

  if (normalizedName) {
    const existing = await findCollegeByName(normalizedName, institutionId);
    if (existing && existing.id !== collegeId) {
      throw new AppError("A college with this name already exists in this institution.", 400);
    }
  }

  if (normalizedCode) {
    const existing = await findCollegeByCode(normalizedCode, institutionId);
    if (existing && existing.id !== collegeId) {
      throw new AppError("A college with this code already exists in this institution.", 400);
    }
  }

  return updateCollegeById({
    id: collegeId,
    name: normalizedName,
    code: normalizedCode,
    isActive: isActive === undefined ? null : Boolean(isActive),
  });
};

export const deleteCollegeService = async ({ user, institutionId, collegeId }) => {
  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to delete colleges for this institution.", 403);
    }
  }

  const college = await findCollegeById(collegeId);
  if (!college || college.institutionId !== institutionId) {
    throw new AppError("College not found in this institution.", 404);
  }

  const deleted = await deleteCollegeById(collegeId);
  if (!deleted) {
    throw new AppError("Failed to delete college.", 500);
  }

  return deleted;
};

// ===================== DEPARTMENT CRUD =====================

/**
 * Validates that a college exists and belongs to the specified institution.
 */
const validateCollegeParent = async (collegeId, institutionId) => {
  const college = await findCollegeById(collegeId);
  if (!college || college.institutionId !== institutionId) {
    throw new AppError("College not found in this institution.", 404);
  }
  return college;
};

export const listDepartmentsService = async ({ user, institutionId, collegeId }) => {
  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to access departments for this institution.", 403);
    }
  }

  await validateCollegeParent(collegeId, institutionId);

  return findDepartments(collegeId);
};

export const createDepartmentService = async ({ user, institutionId, collegeId, data }) => {
  const { name, code, isActive } = data;

  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to create departments for this institution.", 403);
    }
  }

  if (!name || !code) {
    throw new AppError("Name and code are required.", 400);
  }

  await validateCollegeParent(collegeId, institutionId);

  // Check uniqueness per college
  const existingName = await findDepartmentByName(name, collegeId);
  if (existingName) {
    throw new AppError("A department with this name already exists in this college.", 400);
  }

  const existingCode = await findDepartmentByCode(code, collegeId);
  if (existingCode) {
    throw new AppError("A department with this code already exists in this college.", 400);
  }

  return createDepartmentRecord({
    collegeId,
    name: String(name).trim(),
    code: String(code).trim().toUpperCase(),
    isActive: isActive === undefined ? true : Boolean(isActive),
  });
};

export const getDepartmentByIdService = async ({ user, institutionId, collegeId, departmentId }) => {
  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to access this institution's departments.", 403);
    }
  }

  await validateCollegeParent(collegeId, institutionId);

  const department = await findDepartmentById(departmentId);
  if (!department || department.collegeId !== collegeId) {
    throw new AppError("Department not found in this college.", 404);
  }

  return department;
};

export const updateDepartmentService = async ({ user, institutionId, collegeId, departmentId, data }) => {
  const { name, code, isActive } = data;

  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to update departments for this institution.", 403);
    }
  }

  await validateCollegeParent(collegeId, institutionId);

  const currentDept = await findDepartmentById(departmentId);
  if (!currentDept || currentDept.collegeId !== collegeId) {
    throw new AppError("Department not found in this college.", 404);
  }

  const normalizedName = name !== undefined ? String(name).trim() : null;
  const normalizedCode = code !== undefined ? String(code).trim().toUpperCase() : null;

  if (normalizedName) {
    const existing = await findDepartmentByName(normalizedName, collegeId);
    if (existing && existing.id !== departmentId) {
      throw new AppError("A department with this name already exists in this college.", 400);
    }
  }

  if (normalizedCode) {
    const existing = await findDepartmentByCode(normalizedCode, collegeId);
    if (existing && existing.id !== departmentId) {
      throw new AppError("A department with this code already exists in this college.", 400);
    }
  }

  return updateDepartmentById({
    id: departmentId,
    name: normalizedName,
    code: normalizedCode,
    isActive: isActive === undefined ? null : Boolean(isActive),
  });
};

export const deleteDepartmentService = async ({ user, institutionId, collegeId, departmentId }) => {
  if (user.role !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to delete departments for this institution.", 403);
    }
  }

  await validateCollegeParent(collegeId, institutionId);

  const department = await findDepartmentById(departmentId);
  if (!department || department.collegeId !== collegeId) {
    throw new AppError("Department not found in this college.", 404);
  }

  const deleted = await deleteDepartmentById(departmentId);
  if (!deleted) {
    throw new AppError("Failed to delete department.", 500);
  }

  return deleted;
};
