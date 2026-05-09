import AppError from "../../common/utils/appError.js";
import {
  findCollegeById,
  findColleges,
  findCollegeByCode,
  findCollegeByCodeAll,
  restoreCollegeById,
  createCollegeRecord,
  updateCollegeById,
  deleteCollegeById,
} from "./college.repository.js";
import {
  findDepartmentById,
  findDepartments,
  findDepartmentByCode,
  findDepartmentByCodeAll,
  restoreDepartmentById,
  createDepartmentRecord,
  updateDepartmentById,
  deleteDepartmentById,
} from "./department.repository.js";
import { findInstitutionById } from "./institution.repository.js";
import { logActionService } from "../audit/audit.service.js";

/**
 * Ensures that an institution is of type 'COLLEGE'.
 * Academic structures (Colleges/Departments) are only allowed for Universities/Colleges.
 */
const ensureIsCollegeInstitution = async (institutionId) => {
  const institution = await findInstitutionById(institutionId);
  if (!institution) {
    throw new AppError("Institution not found.", 404);
  }

  if (institution.type !== "COLLEGE") {
    throw new AppError(
      `Academic structures can only be managed for institutions of type COLLEGE. Current type: ${institution.type}`,
      400
    );
  }

  if (!institution.isActive) {
    throw new AppError("This institution is currently inactive. Academic structure changes are disabled.", 400);
  }

  return institution;
};

// ===================== COLLEGE CRUD =====================

export const listCollegesService = async ({ user, institutionId }) => {
  // Enforce institution scope for non-super-admins
  if (user.roleName !== "SUPER_ADMIN") {
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

export const createCollegeService = async ({ user, institutionId, data, req }) => {
  const { name, code, isActive } = data;

  if (user.roleName !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to create colleges for this institution.", 403);
    }
  }

  if (!name || !code) {
    throw new AppError("Name and code are required.", 400);
  }

  const normalizedName = String(name).trim();
  const normalizedCode = String(code).trim().toUpperCase();

  await ensureIsCollegeInstitution(institutionId);

  // Check uniqueness per institution (including deleted)
  const allCollege = await findCollegeByCodeAll(normalizedCode, institutionId);
  if (allCollege) {
    if (!allCollege.isDeleted) {
      throw new AppError("A college with this code already exists in this institution.", 400);
    }
    // RESTORE logic
    await restoreCollegeById(allCollege.id);
    const restored = await updateCollegeById({
      id: allCollege.id,
      name: normalizedName,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    await logActionService({
      user,
      action: "RESTORE_COLLEGE",
      entityType: "COLLEGE",
      entityId: allCollege.id,
      newValues: restored,
      req,
    });

    return restored;
  }

  const college = await createCollegeRecord({
    institutionId,
    name: normalizedName,
    code: normalizedCode,
    isActive: isActive === undefined ? true : Boolean(isActive),
  });

  await logActionService({
    user,
    action: "CREATE_COLLEGE",
    entityType: "COLLEGE",
    entityId: college.id,
    newValues: college,
    req,
  });

  return college;
};

export const getCollegeByIdService = async ({ user, institutionId, collegeId }) => {
  if (user.roleName !== "SUPER_ADMIN") {
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

export const updateCollegeService = async ({ user, institutionId, collegeId, data, req }) => {
  const { name, code, isActive } = data;

  if (user.roleName !== "SUPER_ADMIN") {
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

  if (normalizedCode) {
    const existing = await findCollegeByCode(normalizedCode, institutionId);
    if (existing && existing.id !== collegeId) {
      throw new AppError("A college with this code already exists in this institution.", 400);
    }
  }

  const updatedCollege = await updateCollegeById({
    id: collegeId,
    name: normalizedName,
    code: normalizedCode,
    isActive: isActive === undefined ? null : Boolean(isActive),
  });

  await logActionService({
    user,
    action: "UPDATE_COLLEGE",
    entityType: "COLLEGE",
    entityId: collegeId,
    oldValues: currentCollege,
    newValues: updatedCollege,
    req,
  });

  return updatedCollege;
};

export const deleteCollegeService = async ({ user, institutionId, collegeId, req }) => {
  if (user.roleName !== "SUPER_ADMIN") {
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

  await logActionService({
    user,
    action: "DELETE_COLLEGE",
    entityType: "COLLEGE",
    entityId: collegeId,
    oldValues: college,
    req,
  });

  return deleted;
};

// ===================== DEPARTMENT CRUD =====================

/**
 * Validates that a college exists and belongs to the specified institution.
 */
const validateCollegeParent = async (collegeId, institutionId) => {
  await ensureIsCollegeInstitution(institutionId);
  
  const college = await findCollegeById(collegeId);
  if (!college || college.institutionId !== institutionId) {
    throw new AppError("College not found in this institution.", 404);
  }

  if (!college.isActive) {
    throw new AppError("This college is currently inactive. Department changes are disabled.", 400);
  }

  return college;
};

export const listDepartmentsService = async ({ user, institutionId, collegeId }) => {
  if (user.roleName !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to access departments for this institution.", 403);
    }
  }

  await validateCollegeParent(collegeId, institutionId);

  return findDepartments(collegeId);
};

export const createDepartmentService = async ({ user, institutionId, collegeId, data, req }) => {
  const { name, code, isActive } = data;

  if (user.roleName !== "SUPER_ADMIN") {
    if (user.institutionId !== institutionId) {
      throw new AppError("You do not have permission to create departments for this institution.", 403);
    }
  }

  if (!name || !code) {
    throw new AppError("Name and code are required.", 400);
  }

  const normalizedName = String(name).trim();
  const normalizedCode = String(code).trim().toUpperCase();

  await validateCollegeParent(collegeId, institutionId);

  // Check uniqueness per college (including deleted)
  const allDept = await findDepartmentByCodeAll(normalizedCode, collegeId);
  if (allDept) {
    if (!allDept.isDeleted) {
      throw new AppError("A department with this code already exists in this college.", 400);
    }
    // RESTORE logic
    await restoreDepartmentById(allDept.id);
    const restored = await updateDepartmentById({
      id: allDept.id,
      name: normalizedName,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    await logActionService({
      user,
      action: "RESTORE_DEPARTMENT",
      entityType: "DEPARTMENT",
      entityId: allDept.id,
      newValues: restored,
      req,
    });

    return restored;
  }

  const department = await createDepartmentRecord({
    collegeId,
    name: normalizedName,
    code: normalizedCode,
    isActive: isActive === undefined ? true : Boolean(isActive),
  });

  await logActionService({
    user,
    action: "CREATE_DEPARTMENT",
    entityType: "DEPARTMENT",
    entityId: department.id,
    newValues: department,
    req,
  });

  return department;
};

export const getDepartmentByIdService = async ({ user, institutionId, collegeId, departmentId }) => {
  if (user.roleName !== "SUPER_ADMIN") {
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

export const updateDepartmentService = async ({ user, institutionId, collegeId, departmentId, data, req }) => {
  const { name, code, isActive } = data;

  if (user.roleName !== "SUPER_ADMIN") {
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

  if (normalizedCode) {
    const existing = await findDepartmentByCode(normalizedCode, collegeId);
    if (existing && existing.id !== departmentId) {
      throw new AppError("A department with this code already exists in this college.", 400);
    }
  }

  const updatedDept = await updateDepartmentById({
    id: departmentId,
    name: normalizedName,
    code: normalizedCode,
    isActive: isActive === undefined ? null : Boolean(isActive),
  });

  await logActionService({
    user,
    action: "UPDATE_DEPARTMENT",
    entityType: "DEPARTMENT",
    entityId: departmentId,
    oldValues: currentDept,
    newValues: updatedDept,
    req,
  });

  return updatedDept;
};

export const deleteDepartmentService = async ({ user, institutionId, collegeId, departmentId, req }) => {
  if (user.roleName !== "SUPER_ADMIN") {
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

  await logActionService({
    user,
    action: "DELETE_DEPARTMENT",
    entityType: "DEPARTMENT",
    entityId: departmentId,
    oldValues: department,
    req,
  });

  return deleted;
};
