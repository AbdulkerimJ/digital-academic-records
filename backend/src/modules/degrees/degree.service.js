import AppError from "../../common/utils/appError.js";
import parseNumber from "../../common/utils/parseNumber.js";
import {
  createDegreeRecord,
  findDegreeById,
  findDegrees,
  updateDegreeById,
  deleteDegreeById,
} from "./degree.repository.js";
import {
  findDegreeTitleById,
  findDegreeTitles,
  findDegreeTitlesByLevelId,
  createDegreeTitleRecord,
  updateDegreeTitleById,
} from "./degree-title.repository.js";

import {
  findDegreeLevelById,
  findDegreeLevels,
  createDegreeLevelRecord,
  updateDegreeLevelById,
} from "./degree-level.repository.js";
import { findCollegeById } from "../institutions/college.repository.js";
import { findDepartmentById } from "../institutions/department.repository.js";
import { findInstitutionById } from "../institutions/institution.repository.js";
import { findStudentById } from "../students/student.repository.js";

// ===================== DEGREE LEVEL LOOKUPS =====================

export const listDegreeLevelsService = async () => {
  return findDegreeLevels();
};

export const getDegreeLevelByIdService = async ({ degreeLevelId }) => {
  if (!degreeLevelId) {
    throw new AppError("Degree level ID is required.", 400);
  }

  const degreeLevel = await findDegreeLevelById(degreeLevelId);
  if (!degreeLevel) {
    throw new AppError("Degree level not found.", 404);
  }
  return degreeLevel;
};

export const createDegreeLevelService = async ({ user, data }) => {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Only super admins can create degree levels.", 403);
  }

  const { code, name, rank, isActive } = data;
  if (!code || !name || rank === undefined) {
    throw new AppError("Code, name, and rank are required.", 400);
  }

  return await createDegreeLevelRecord({ code, name, rank, isActive });
};

export const updateDegreeLevelService = async ({ user, id, data }) => {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Only super admins can update degree levels.", 403);
  }

  const level = await findDegreeLevelById(id);
  if (!level) {
    throw new AppError("Degree level not found.", 404);
  }

  return await updateDegreeLevelById({ id, ...data });
};

// ===================== DEGREE TITLE LOOKUPS =====================

export const listDegreeTitlesService = async ({ degreeLevelId } = {}) => {
  if (degreeLevelId) {
    return findDegreeTitlesByLevelId(degreeLevelId);
  }
  return findDegreeTitles();
};

export const getDegreeTitleByIdService = async ({ degreeTitleId }) => {
  if (!degreeTitleId) {
    throw new AppError("Degree title ID is required.", 400);
  }

  const degreeTitle = await findDegreeTitleById(degreeTitleId);
  if (!degreeTitle) {
    throw new AppError("Degree title not found.", 404);
  }
  return degreeTitle;
};

export const createDegreeTitleService = async ({ user, data }) => {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Only super admins can create degree titles.", 403);
  }

  const { degreeLevelId, code, title, isActive } = data;
  if (!degreeLevelId || !code || !title) {
    throw new AppError("Degree level ID, code, and title are required.", 400);
  }

  const level = await findDegreeLevelById(degreeLevelId);
  if (!level) {
    throw new AppError("Associated degree level not found.", 404);
  }

  return await createDegreeTitleRecord({ degreeLevelId, code, title, isActive });
};

export const updateDegreeTitleService = async ({ user, id, data }) => {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Only super admins can update degree titles.", 403);
  }

  const existingTitle = await findDegreeTitleById(id);
  if (!existingTitle) {
    throw new AppError("Degree title not found.", 404);
  }

  if (data.degreeLevelId) {
    const level = await findDegreeLevelById(data.degreeLevelId);
    if (!level) {
      throw new AppError("Associated degree level not found.", 404);
    }
  }

  return await updateDegreeTitleById({ id, ...data });
};

// ===================== DEGREE RECORD CRUD =====================

export const createDegreeService = async ({ user, data = {} }) => {
  let {
    studentId,
    institutionId,
    degreeLevelId,
    degreeTitleId,
    collegeId,
    departmentId,
    cgpa,
    graduationDate,
  } = data;

  // Institution scoping
  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }
    institutionId = user.institutionId;
  } else {
    if (!institutionId) {
      throw new AppError("Institution ID is required for super admin.", 400);
    }
  }

  // Validate institution
  const institution = await findInstitutionById(institutionId);
  if (!institution) {
    throw new AppError("Invalid institution.", 400);
  }

  // Validate required fields
  if (!studentId || !degreeLevelId || !degreeTitleId || !collegeId || !departmentId || !graduationDate) {
    throw new AppError(
      "Student ID, degree level, degree title, college, department, and graduation date are required.",
      400,
    );
  }

  // Validate student
  const student = await findStudentById(studentId);
  if (!student) {
    throw new AppError("Student not found.", 400);
  }

  // Validate degree level
  const degreeLevel = await findDegreeLevelById(degreeLevelId);
  if (!degreeLevel || !degreeLevel.isActive) {
    throw new AppError("Degree level not found or inactive.", 400);
  }

  // Validate degree title
  const degreeTitle = await findDegreeTitleById(degreeTitleId);
  if (!degreeTitle || !degreeTitle.isActive) {
    throw new AppError("Degree title not found or inactive.", 400);
  }

  // Validate degree title belongs to the degree level
  if (degreeTitle.degreeLevelId !== degreeLevel.id) {
    throw new AppError(
      "Degree title does not belong to the specified degree level.",
      400,
    );
  }

  // Validate college
  const college = await findCollegeById(collegeId);
  if (!college || !college.isActive) {
    throw new AppError("College not found or inactive.", 400);
  }

  // Validate college belongs to the institution
  if (college.institutionId !== institutionId) {
    throw new AppError(
      "College does not belong to the specified institution.",
      400,
    );
  }

  // Validate department
  const department = await findDepartmentById(departmentId);
  if (!department || !department.isActive) {
    throw new AppError("Department not found or inactive.", 400);
  }

  // Validate department belongs to the college
  if (department.collegeId !== collegeId) {
    throw new AppError(
      "Department does not belong to the specified college.",
      400,
    );
  }

  // Validate CGPA
  const parsedCgpa = parseNumber(cgpa, "CGPA");
  if (parsedCgpa !== null && (parsedCgpa < 0 || parsedCgpa > 4)) {
    throw new AppError("CGPA must be between 0 and 4.", 400);
  }

  // Validate graduation date
  const parsedGraduationDate = new Date(graduationDate);
  if (isNaN(parsedGraduationDate.getTime())) {
    throw new AppError("Graduation date must be a valid date.", 400);
  }

  const created = await createDegreeRecord({
    studentId,
    institutionId,
    degreeLevelId,
    degreeTitleId,
    collegeId,
    departmentId,
    cgpa: parsedCgpa,
    graduationDate,
  });

  return findDegreeById(created.id);
};

export const listDegreesService = async ({
  user,
  filters = {},
  pagination = {},
}) => {
  const query = { ...filters };

  // enforce institution scope
  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution is required.", 400);
    }
    query.institutionId = user.institutionId;
  }

  return findDegrees(query, pagination);
};

export const getDegreeByIdService = async ({ user, degreeId }) => {
  if (!degreeId) {
    throw new AppError("Degree ID is required.", 400);
  }

  let institutionId = null;

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }

    institutionId = user.institutionId;
  }

  const degree = await findDegreeById(degreeId, institutionId);
  if (!degree) {
    throw new AppError("Degree record not found.", 404);
  }
  return degree;
};

export const updateDegreeService = async ({
  user,
  degreeId,
  degreeLevelId,
  degreeTitleId,
  collegeId,
  departmentId,
  cgpa,
  graduationDate,
}) => {
  if (!degreeId) {
    throw new AppError("Degree ID is required.", 400);
  }

  let institutionId = null;

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }

    institutionId = user.institutionId;
  }

  const currentRecord = await findDegreeById(degreeId, institutionId);
  if (!currentRecord) {
    throw new AppError("Degree record not found.", 404);
  }

  // Resolve the effective values (use new if provided, else keep current)
  const effectiveDegreeLevelId = degreeLevelId !== undefined ? degreeLevelId : currentRecord.degreeLevelId;
  const effectiveDegreeTitleId = degreeTitleId !== undefined ? degreeTitleId : currentRecord.degreeTitleId;
  const effectiveCollegeId = collegeId !== undefined ? collegeId : currentRecord.collegeId;
  const effectiveDepartmentId = departmentId !== undefined ? departmentId : currentRecord.departmentId;
  const effectiveInstitutionId = institutionId || currentRecord.institutionId;

  // Validate degree level if changed
  if (degreeLevelId !== undefined) {
    const degreeLevel = await findDegreeLevelById(degreeLevelId);
    if (!degreeLevel || !degreeLevel.isActive) {
      throw new AppError("Degree level not found or inactive.", 400);
    }
  }

  // Validate degree title if changed
  if (degreeTitleId !== undefined) {
    const title = await findDegreeTitleById(degreeTitleId);
    if (!title || !title.isActive) {
      throw new AppError("Degree title not found or inactive.", 400);
    }
  }

  // Validate title belongs to level (check whenever either changes)
  if (degreeLevelId !== undefined || degreeTitleId !== undefined) {
    const title = await findDegreeTitleById(effectiveDegreeTitleId);
    if (title && title.degreeLevelId !== effectiveDegreeLevelId) {
      throw new AppError(
        "Degree title does not belong to the specified degree level.",
        400,
      );
    }
  }

  // Validate college if changed
  if (collegeId !== undefined) {
    const college = await findCollegeById(collegeId);
    if (!college || !college.isActive) {
      throw new AppError("College not found or inactive.", 400);
    }
    if (college.institutionId !== effectiveInstitutionId) {
      throw new AppError(
        "College does not belong to the specified institution.",
        400,
      );
    }
  }

  // Validate department if changed
  if (departmentId !== undefined) {
    const department = await findDepartmentById(departmentId);
    if (!department || !department.isActive) {
      throw new AppError("Department not found or inactive.", 400);
    }
  }

  // Validate department belongs to college (check whenever either changes)
  if (collegeId !== undefined || departmentId !== undefined) {
    const department = await findDepartmentById(effectiveDepartmentId);
    if (department && department.collegeId !== effectiveCollegeId) {
      throw new AppError(
        "Department does not belong to the specified college.",
        400,
      );
    }
  }

  // Validate CGPA if provided
  if (cgpa !== undefined) {
    const parsedCgpa = parseNumber(cgpa, "CGPA");
    if (parsedCgpa !== null && (parsedCgpa < 0 || parsedCgpa > 4)) {
      throw new AppError("CGPA must be between 0 and 4.", 400);
    }
  }

  // Validate graduation date if provided
  if (graduationDate !== undefined) {
    const parsedDate = new Date(graduationDate);
    if (isNaN(parsedDate.getTime())) {
      throw new AppError("Graduation date must be a valid date.", 400);
    }
  }

  await updateDegreeById({
    id: degreeId,
    institutionId,
    degreeLevelId,
    degreeTitleId,
    collegeId,
    departmentId,
    cgpa: cgpa !== undefined ? parseNumber(cgpa, "CGPA") : undefined,
    graduationDate,
  });

  return findDegreeById(degreeId);
};

export const deleteDegreeService = async ({ user, degreeId }) => {
  if (!degreeId) {
    throw new AppError("Degree ID is required.", 400);
  }

  let institutionId = null;

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }

    institutionId = user.institutionId;
  }

  const deleted = await deleteDegreeById(degreeId, institutionId);

  if (!deleted) {
    throw new AppError(
      "Degree record not found or you are not authorized to delete it.",
      404,
    );
  }

  return deleted;
};




