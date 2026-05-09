import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  listCollegesService,
  getCollegeByIdService,
  createCollegeService,
  updateCollegeService,
  deleteCollegeService,
  listDepartmentsService,
  getDepartmentByIdService,
  createDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
} from "./institution.structure.service.js";

// ===================== COLLEGE CRUD =====================

export const listColleges = catchAsync(async (req, res) => {
  const { institutionId } = req.params;
  const colleges = await listCollegesService({ user: req.user, institutionId });
  return sendSuccess(res, "Colleges fetched successfully", { count: colleges.length, colleges });
});

export const createCollege = catchAsync(async (req, res) => {
  const { institutionId } = req.params;
  const college = await createCollegeService({
    user: req.user,
    institutionId,
    data: req.body,
    req,
  });
  return sendSuccess(res, "College created successfully", { college }, 201);
});

export const getCollegeById = catchAsync(async (req, res) => {
  const { institutionId, collegeId } = req.params;
  const college = await getCollegeByIdService({ user: req.user, institutionId, collegeId });
  return sendSuccess(res, "College fetched successfully", { college });
});

export const updateCollege = catchAsync(async (req, res) => {
  const { institutionId, collegeId } = req.params;
  const college = await updateCollegeService({
    user: req.user,
    institutionId,
    collegeId,
    data: req.body,
    req,
  });
  return sendSuccess(res, "College updated successfully", { college });
});

export const deleteCollege = catchAsync(async (req, res) => {
  const { institutionId, collegeId } = req.params;
  await deleteCollegeService({ user: req.user, institutionId, collegeId, req });
  return sendSuccess(res, "College deleted successfully");
});

// ===================== DEPARTMENT CRUD =====================

export const listDepartments = catchAsync(async (req, res) => {
  const { institutionId, collegeId } = req.params;
  const departments = await listDepartmentsService({ user: req.user, institutionId, collegeId });
  return sendSuccess(res, "Departments fetched successfully", { count: departments.length, departments });
});

export const createDepartment = catchAsync(async (req, res) => {
  const { institutionId, collegeId } = req.params;
  const department = await createDepartmentService({
    user: req.user,
    institutionId,
    collegeId,
    data: req.body,
    req,
  });
  return sendSuccess(res, "Department created successfully", { department }, 201);
});

export const getDepartmentById = catchAsync(async (req, res) => {
  const { institutionId, collegeId, departmentId } = req.params;
  const department = await getDepartmentByIdService({ user: req.user, institutionId, collegeId, departmentId });
  return sendSuccess(res, "Department fetched successfully", { department });
});

export const updateDepartment = catchAsync(async (req, res) => {
  const { institutionId, collegeId, departmentId } = req.params;
  const department = await updateDepartmentService({
    user: req.user,
    institutionId,
    collegeId,
    departmentId,
    data: req.body,
    req,
  });
  return sendSuccess(res, "Department updated successfully", { department });
});

export const deleteDepartment = catchAsync(async (req, res) => {
  const { institutionId, collegeId, departmentId } = req.params;
  await deleteDepartmentService({ user: req.user, institutionId, collegeId, departmentId, req });
  return sendSuccess(res, "Department deleted successfully");
});
