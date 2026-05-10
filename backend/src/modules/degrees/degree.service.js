import AppError from "../../common/utils/appError.js";
import { translateDatabaseError } from "../../common/utils/dbErrorHelper.js";
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
  findDegreeTitleByCode,
  findDegreeTitles,
  findDegreeTitlesByLevelId,
  createDegreeTitleRecord,
  updateDegreeTitleById,
} from "./degree-title.repository.js";

import {
  findDegreeLevelById,
  findDegreeLevels,
  findDegreeLevelByCode,
  createDegreeLevelRecord,
  updateDegreeLevelById,
} from "./degree-level.repository.js";
import { findCollegeById, findCollegeByCode } from "../institutions/college.repository.js";
import { findDepartmentById, findDepartmentByCode } from "../institutions/department.repository.js";
import { findInstitutionById, findInstitutionByCode } from "../institutions/institution.repository.js";
import { findStudentById, findStudentByNationalId } from "../students/student.repository.js";
import csv from "csv-parser";
import { Readable } from "stream";
import { logActionService } from "../audit/audit.service.js";

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

export const createDegreeLevelService = async ({ user, data, req }) => {
  if (user.roleName !== "SUPER_ADMIN") {
    throw new AppError("Only super admins can create degree levels.", 403);
  }

  const { code, name, rank, isActive } = data;
  if (!code || !name || rank === undefined) {
    throw new AppError("Code, name, and rank are required.", 400);
  }

  const level = await createDegreeLevelRecord({ code, name, rank, isActive });

  await logActionService({
    user,
    action: "CREATE_DEGREE_LEVEL",
    entityType: "DEGREE_LEVEL",
    entityId: level.id,
    newValues: level,
    req,
  });

  return level;
};

export const updateDegreeLevelService = async ({ user, id, data, req }) => {
  if (user.roleName !== "SUPER_ADMIN") {
    throw new AppError("Only super admins can update degree levels.", 403);
  }

  const level = await findDegreeLevelById(id);
  if (!level) {
    throw new AppError("Degree level not found.", 404);
  }

  const updated = await updateDegreeLevelById({ id, ...data });

  await logActionService({
    user,
    action: "UPDATE_DEGREE_LEVEL",
    entityType: "DEGREE_LEVEL",
    entityId: id,
    oldValues: level,
    newValues: updated,
    req,
  });

  return updated;
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

export const createDegreeTitleService = async ({ user, data, req }) => {
  if (user.roleName !== "SUPER_ADMIN") {
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

  const titleRecord = await createDegreeTitleRecord({ degreeLevelId, code, title, isActive });

  await logActionService({
    user,
    action: "CREATE_DEGREE_TITLE",
    entityType: "DEGREE_TITLE",
    entityId: titleRecord.id,
    newValues: titleRecord,
    req,
  });

  return titleRecord;
};

export const updateDegreeTitleService = async ({ user, id, data, req }) => {
  if (user.roleName !== "SUPER_ADMIN") {
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

  const updated = await updateDegreeTitleById({ id, ...data });

  await logActionService({
    user,
    action: "UPDATE_DEGREE_TITLE",
    entityType: "DEGREE_TITLE",
    entityId: id,
    oldValues: existingTitle,
    newValues: updated,
    req,
  });

  return updated;
};

// ===================== DEGREE RECORD CRUD =====================

export const createDegreeService = async ({ user, data = {}, req }) => {
  let {
    studentId,
    nationalId,
    institutionId,
    institutionCode,
    degreeLevelId,
    degreeLevelCode,
    degreeTitleId,
    degreeTitleCode,
    collegeId,
    collegeCode,
    departmentId,
    departmentCode,
    cgpa,
    graduationDate,
  } = data;

  // 1. Institution context
  if (user.roleName !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }
    institutionId = user.institutionId;
  } else {
    // Super Admin: Resolve code if provided
    if (!institutionId && institutionCode) {
      const inst = await findInstitutionByCode(institutionCode);
      if (!inst) throw new AppError("Institution code not found.", 404);
      institutionId = inst.id;
    }

    if (!institutionId) {
      throw new AppError("Institution ID or Code is required for super admin.", 400);
    }
  }

  // Verify Institution is Active and of correct type
  const institution = await findInstitutionById(institutionId);
  if (!institution || !institution.isActive) {
    throw new AppError("Institution not found or is currently inactive.", 400);
  }

  if (institution.type !== 'COLLEGE') {
    throw new AppError(`Institution '${institution.name}' is of type '${institution.type}'. Only 'COLLEGE' type institutions can issue degree records.`, 403);
  }

  // 2. Resolve Student
  let student;
  if (studentId) {
    student = await findStudentById(studentId);
  } else if (nationalId) {
    student = await findStudentByNationalId(nationalId);
  }

  if (!student) {
    throw new AppError("Student not registered.", 404);
  }
  studentId = student.id;

  // 3. Resolve Degree Level
  let degreeLevel;
  if (degreeLevelId) {
    degreeLevel = await findDegreeLevelById(degreeLevelId);
  } else if (degreeLevelCode) {
    degreeLevel = await findDegreeLevelByCode(degreeLevelCode);
  }

  if (!degreeLevel || !degreeLevel.isActive) {
    throw new AppError("Degree level not found or inactive.", 400);
  }
  degreeLevelId = degreeLevel.id;

  // 4. Resolve Degree Title
  let degreeTitle;
  if (degreeTitleId) {
    degreeTitle = await findDegreeTitleById(degreeTitleId);
  } else if (degreeTitleCode) {
    degreeTitle = await findDegreeTitleByCode(degreeTitleCode);
  }

  if (!degreeTitle || !degreeTitle.isActive) {
    throw new AppError("Degree title not found or inactive.", 400);
  }
  degreeTitleId = degreeTitle.id;

  if (degreeTitle.degreeLevelId !== degreeLevelId) {
    throw new AppError("Degree title does not belong to the specified degree level.", 400);
  }

  // 5. Resolve College
  let college;
  if (collegeId) {
    college = await findCollegeById(collegeId);
  } else if (collegeCode) {
    college = await findCollegeByCode(collegeCode, institutionId);
  }

  if (!college || !college.isActive) {
    throw new AppError("College not found or inactive.", 400);
  }
  collegeId = college.id;

  // 6. Resolve Department
  let department;
  if (departmentId) {
    department = await findDepartmentById(departmentId);
  } else if (departmentCode) {
    department = await findDepartmentByCode(departmentCode, collegeId);
  }

  if (!department || !department.isActive) {
    throw new AppError("Department not found or inactive.", 400);
  }
  departmentId = department.id;

  // 7. Validation
  if (!graduationDate) {
    throw new AppError("graduationDate is required", 400);
  }

  const parsedCgpa = cgpa !== undefined ? parseNumber(cgpa, "CGPA") : null;
  if (parsedCgpa !== null && (parsedCgpa < 0 || parsedCgpa > 4)) {
    throw new AppError("CGPA must be between 0 and 4.", 400);
  }

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

  const result = await findDegreeById(created.id);

  await logActionService({
    user,
    action: "ISSUE_DEGREE",
    entityType: "DEGREE",
    entityId: result.id,
    newValues: result,
    req,
  });

  return result;
};

export const uploadBulkDegreesService = async ({
  user,
  fileBuffer,
  onProgress,
  institutionId,
  institutionCode,
  req,
}) => {
  if (!fileBuffer) {
    throw new AppError("No file provided", 400);
  }

  const records = [];
  await new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer);
    stream
      .pipe(csv())
      .on("data", (data) => records.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  if (records.length === 0) {
    throw new AppError("No records found in the CSV file.", 400);
  }

  const results = {
    total: records.length,
    successRate: "0%",
    successful: [],
    failed: [],
  };

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      const mappedData = {
        nationalId: record.nationalId || record.nationalid || record.NationalId,
        degreeLevelCode: record.degreeLevelCode || record.degreelevelcode || record.DegreeLevelCode,
        degreeTitleCode: record.degreeTitleCode || record.degreetitlecode || record.DegreeTitleCode,
        institutionCode: record.institutionCode || record.institutioncode || record.InstitutionCode,
        collegeCode: record.collegeCode || record.collegecode || record.CollegeCode,
        departmentCode: record.departmentCode || record.departmentcode || record.DepartmentCode,
        cgpa: record.cgpa || record.CGPA,
        graduationDate: record.graduationDate || record.graduationdate || record.GraduationDate,
      };

      await createDegreeService({
        user,
        data: {
          ...mappedData,
          institutionId: mappedData.institutionId || institutionId,
          institutionCode: mappedData.institutionCode || institutionCode,
        },
        req,
      });
      results.successful.push({
        id: mappedData.nationalId,
        date: mappedData.graduationDate,
      });
    } catch (err) {
      const translated = translateDatabaseError(err);
      results.failed.push({
        id: record.nationalId || record.nationalid || `Row ${i + 1}`,
        reason: translated ? translated.message : err.message,
      });
    }

    if (onProgress) {
      const progress = Math.round(((i + 1) / records.length) * 100);
      onProgress({
        percent: `${progress}%`,
        current: i + 1,
        total: records.length,
        lastResult: {
          id: record.nationalId || record.nationalid || `Row ${i + 1}`,
          success: !results.failed.find((f) => f.id === (record.nationalId || record.nationalid) || f.id === `Row ${i + 1}`),
        },
      });
    }
  }

  results.successRate = results.total > 0
    ? `${Math.round((results.successful.length / results.total) * 100)}%`
    : "0%";

  await logActionService({
    user,
    action: "BULK_ISSUE_DEGREES",
    entityType: "DEGREE",
    entityId: "BULK",
    newValues: { successful: results.successful.length, failed: results.failed.length },
    req,
  });

  return results;
};

export const listDegreesService = async ({
  user,
  filters = {},
  pagination = {},
}) => {
  const query = { ...filters };

  // enforce institution scope
  if (user.roleName !== "SUPER_ADMIN") {
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

  if (user.roleName !== "SUPER_ADMIN") {
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
  req,
}) => {
  if (!degreeId) {
    throw new AppError("Degree ID is required.", 400);
  }

  let institutionId = null;

  if (user.roleName !== "SUPER_ADMIN") {
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

  // Validate Institution is Active
  const institution = await findInstitutionById(effectiveInstitutionId);
  if (!institution || !institution.isActive) {
    throw new AppError("Institution is currently inactive. Updates are disabled.", 400);
  }

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

  const result = await findDegreeById(degreeId);

  await logActionService({
    user,
    action: "UPDATE_DEGREE",
    entityType: "DEGREE",
    entityId: degreeId,
    oldValues: currentRecord,
    newValues: result,
    req,
  });

  return result;
};

export const deleteDegreeService = async ({ user, degreeId, req }) => {
  if (!degreeId) {
    throw new AppError("Degree ID is required.", 400);
  }

  let institutionId = null;

  if (user.roleName !== "SUPER_ADMIN") {
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

  await logActionService({
    user,
    action: "DELETE_DEGREE",
    entityType: "DEGREE",
    entityId: degreeId,
    req,
  });

  return deleted;
};




