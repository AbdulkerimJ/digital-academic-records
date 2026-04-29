/**
 * @swagger
 * components:
 *   schemas:
 *     DegreeErrorResponse:
 *       type: object
 *       example:
 *         success: false
 *         message: Degree record not found
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     DegreeLevelItem:
 *       type: object
 *       example:
 *         id: 1
 *         code: BACHELOR
 *         name: Bachelor Degree
 *         rank: 1
 *         isActive: true
 *         createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         rank:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DegreeLevelResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Degree level fetched successfully
 *         data:
 *           degreeLevel:
 *             id: 1
 *             code: BACHELOR
 *             name: Bachelor Degree
 *             rank: 1
 *             isActive: true
 *             createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             degreeLevel:
 *               $ref: '#/components/schemas/DegreeLevelItem'
 *     DegreeLevelListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Degree levels fetched successfully
 *         data:
 *           count: 3
 *           degreeLevels:
 *             - id: 1
 *               code: BACHELOR
 *               name: Bachelor Degree
 *               rank: 1
 *               isActive: true
 *               createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *             degreeLevels:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DegreeLevelItem'
 *     DegreeTitleItem:
 *       type: object
 *       example:
 *         id: 1
 *         degreeLevelId: 1
 *         code: BSC
 *         title: Bachelor of Science (BSc)
 *         isActive: true
 *         createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: integer
 *         degreeLevelId:
 *           type: integer
 *         code:
 *           type: string
 *         title:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DegreeTitleResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Degree title fetched successfully
 *         data:
 *           degreeTitle:
 *             id: 1
 *             degreeLevelId: 1
 *             code: BSC
 *             title: Bachelor of Science (BSc)
 *             isActive: true
 *             createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             degreeTitle:
 *               $ref: '#/components/schemas/DegreeTitleItem'
 *     DegreeTitleListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Degree titles fetched successfully
 *         data:
 *           count: 4
 *           degreeTitles:
 *             - id: 1
 *               degreeLevelId: 1
 *               code: BSC
 *               title: Bachelor of Science (BSc)
 *               isActive: true
 *               createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *             degreeTitles:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DegreeTitleItem'
 *     CollegeItem:
 *       type: object
 *       example:
 *         id: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *         institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *         name: College of Engineering
 *         code: COE
 *         isActive: true
 *         createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         institutionId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CollegeResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: College fetched successfully
 *         data:
 *           college:
 *             id: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *             institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *             name: College of Engineering
 *             code: COE
 *             isActive: true
 *             createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             college:
 *               $ref: '#/components/schemas/CollegeItem'
 *     CollegeListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Colleges fetched successfully
 *         data:
 *           count: 2
 *           colleges:
 *             - id: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *               institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *               name: College of Engineering
 *               code: COE
 *               isActive: true
 *               createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *             colleges:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CollegeItem'
 *     DepartmentItem:
 *       type: object
 *       example:
 *         id: d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a
 *         collegeId: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *         name: Department of Computer Science
 *         code: CS
 *         isActive: true
 *         createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         collegeId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DepartmentResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Department fetched successfully
 *         data:
 *           department:
 *             id: d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a
 *             collegeId: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *             name: Department of Computer Science
 *             code: CS
 *             isActive: true
 *             createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             department:
 *               $ref: '#/components/schemas/DepartmentItem'
 *     DepartmentListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Departments fetched successfully
 *         data:
 *           count: 2
 *           departments:
 *             - id: d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a
 *               collegeId: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *               name: Department of Computer Science
 *               code: CS
 *               isActive: true
 *               createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *             departments:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DepartmentItem'
 *     DegreeRecordItem:
 *       type: object
 *       example:
 *         id: 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d
 *         studentId: 7d0ddf8c-9a7b-4d45-8b14-5f8a9f8a2b21
 *         institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *         institutionName: Central University
 *         degreeLevelId: 1
 *         degreeLevelCode: BACHELOR
 *         degreeLevelName: Bachelor Degree
 *         degreeTitleId: 1
 *         degreeTitleCode: BSC
 *         degreeTitle: Bachelor of Science (BSc)
 *         collegeId: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *         collegeName: College of Engineering
 *         departmentId: d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a
 *         departmentName: Department of Computer Science
 *         cgpa: 3.75
 *         graduationDate: 2025-07-15
 *         createdAt: 2026-04-27T09:15:00.000Z
 *         updatedAt: 2026-04-27T09:15:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         institutionId:
 *           type: string
 *           format: uuid
 *         institutionName:
 *           type: string
 *         degreeLevelId:
 *           type: integer
 *         degreeLevelCode:
 *           type: string
 *         degreeLevelName:
 *           type: string
 *         degreeTitleId:
 *           type: integer
 *         degreeTitleCode:
 *           type: string
 *         degreeTitle:
 *           type: string
 *         collegeId:
 *           type: string
 *           format: uuid
 *         collegeName:
 *           type: string
 *         departmentId:
 *           type: string
 *           format: uuid
 *         departmentName:
 *           type: string
 *         cgpa:
 *           type: number
 *           nullable: true
 *         graduationDate:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DegreeRecordResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Degree record fetched successfully
 *         data:
 *           degree:
 *             id: 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d
 *             studentId: 7d0ddf8c-9a7b-4d45-8b14-5f8a9f8a2b21
 *             institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *             institutionName: Central University
 *             degreeLevelId: 1
 *             degreeLevelCode: BACHELOR
 *             degreeLevelName: Bachelor Degree
 *             degreeTitleId: 1
 *             degreeTitleCode: BSC
 *             degreeTitle: Bachelor of Science (BSc)
 *             collegeId: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *             collegeName: College of Engineering
 *             departmentId: d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a
 *             departmentName: Department of Computer Science
 *             cgpa: 3.75
 *             graduationDate: 2025-07-15
 *             createdAt: 2026-04-27T09:15:00.000Z
 *             updatedAt: 2026-04-27T09:15:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             degree:
 *               $ref: '#/components/schemas/DegreeRecordItem'
 *     DegreeRecordListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Degree records fetched successfully
 *         data:
 *           degrees:
 *             - id: 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d
 *               studentId: 7d0ddf8c-9a7b-4d45-8b14-5f8a9f8a2b21
 *               institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *               institutionName: Central University
 *               degreeLevelId: 1
 *               degreeLevelCode: BACHELOR
 *               degreeLevelName: Bachelor Degree
 *               degreeTitleId: 1
 *               degreeTitleCode: BSC
 *               degreeTitle: Bachelor of Science (BSc)
 *               collegeId: c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *               collegeName: College of Engineering
 *               departmentId: d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a
 *               departmentName: Department of Computer Science
 *               cgpa: 3.75
 *               graduationDate: 2025-07-15
 *               createdAt: 2026-04-27T09:15:00.000Z
 *               updatedAt: 2026-04-27T09:15:00.000Z
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             degrees:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DegreeRecordItem'
 *
 * /api/degrees/levels:
 *   get:
 *     summary: List degree levels
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Degree levels fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeLevelListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *
 * /api/degrees/levels/{degreeLevelId}:
 *   get:
 *     summary: Get degree level by ID
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: degreeLevelId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Degree level fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeLevelResponse'
 *       400:
 *         description: Degree level ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       404:
 *         description: Degree level not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *
 * /api/degrees/titles:
 *   get:
 *     summary: List degree titles
 *     description: Returns all degree titles. Optionally filter by degree level ID using the degreeLevelId query parameter.
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: degreeLevelId
 *         schema:
 *           type: integer
 *         description: Filter titles by degree level ID
 *     responses:
 *       200:
 *         description: Degree titles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeTitleListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *
 * /api/degrees/titles/{degreeTitleId}:
 *   get:
 *     summary: Get degree title by ID
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: degreeTitleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Degree title fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeTitleResponse'
 *       400:
 *         description: Degree title ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       404:
 *         description: Degree title not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *
 * /api/institutions/{institutionId}/colleges:
 *   get:
 *     summary: List colleges for an institution
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Colleges fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollegeListResponse'
 *       403:
 *         description: Forbidden (Scope mismatch)
 *       404:
 *         description: Institution not found
 *   post:
 *     summary: Create a college in an institution
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: College created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollegeResponse'
 *       400:
 *         description: Validation failed or duplicate name/code
 *
 * /api/institutions/{institutionId}/colleges/{collegeId}:
 *   get:
 *     summary: Get college by ID
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: collegeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: College fetched successfully
 *       404:
 *         description: College not found in this institution
 *   patch:
 *     summary: Update a college
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *       - in: path
 *         name: collegeId
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: College updated successfully
 *   delete:
 *     summary: Delete a college
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *       - in: path
 *         name: collegeId
 *         required: true
 *     responses:
 *       200:
 *         description: College deleted successfully
 *
 * /api/institutions/{institutionId}/colleges/{collegeId}/departments:
 *   get:
 *     summary: List departments for a college
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *       - in: path
 *         name: collegeId
 *         required: true
 *     responses:
 *       200:
 *         description: Departments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentListResponse'
 *       404:
 *         description: College not found in this institution
 *   post:
 *     summary: Create a department in a college
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *       - in: path
 *         name: collegeId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'
 *       400:
 *         description: Validation failed or duplicate name/code
 *
 * /api/institutions/{institutionId}/colleges/{collegeId}/departments/{departmentId}:
 *   get:
 *     summary: Get department by ID
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *       - in: path
 *         name: collegeId
 *         required: true
 *       - in: path
 *         name: departmentId
 *         required: true
 *     responses:
 *       200:
 *         description: Department fetched successfully
 *       404:
 *         description: Department not found in this college
 *   patch:
 *     summary: Update a department
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *       - in: path
 *         name: collegeId
 *         required: true
 *       - in: path
 *         name: departmentId
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Department updated successfully
 *   delete:
 *     summary: Delete a department
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *       - in: path
 *         name: collegeId
 *         required: true
 *       - in: path
 *         name: departmentId
 *         required: true
 *     responses:
 *       200:
 *         description: Department deleted successfully


 *
 * /api/degrees:
 *   get:
 *     summary: List degree records
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: degreeLevelCode
 *         schema:
 *           type: string
 *         description: Filter by degree level code (e.g. BACHELOR, MASTER, PHD)
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *         description: Filter by graduation year
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by student ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Page size for pagination
 *     responses:
 *       200:
 *         description: Degree records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeRecordListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *   post:
 *     summary: Create a degree record
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     description: >
 *       Creates a new degree record for a student. Validates the full FK chain:
 *       degree title must belong to the degree level, college must belong to the institution,
 *       and department must belong to the college. CGPA must be between 0 and 4.
 *       For SUPER_ADMIN users, institutionId is required; for other users, the institution
 *       is derived from the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - degreeLevelId
 *               - degreeTitleId
 *               - collegeId
 *               - departmentId
 *               - graduationDate
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               institutionId:
 *                 type: string
 *                 format: uuid
 *                 description: Required for SUPER_ADMIN users
 *               degreeLevelId:
 *                 type: integer
 *                 description: Must reference an active degree level
 *               degreeTitleId:
 *                 type: integer
 *                 description: Must reference an active degree title belonging to the specified degree level
 *               collegeId:
 *                 type: string
 *                 format: uuid
 *                 description: Must belong to the target institution
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 description: Must belong to the specified college
 *               cgpa:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 4
 *                 nullable: true
 *                 description: Cumulative GPA (0-4 scale)
 *               graduationDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-15"
 *     responses:
 *       201:
 *         description: Degree record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeRecordResponse'
 *       400:
 *         description: Validation failed, missing fields, or FK chain violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *
 * /api/degrees/{degreeId}:
 *   get:
 *     summary: Get degree record by ID
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Degree record fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeRecordResponse'
 *       400:
 *         description: Degree ID is required or institution context is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       404:
 *         description: Degree record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *   patch:
 *     summary: Update a degree record
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     description: >
 *       Updates an existing degree record. All fields are optional.
 *       If FK references are changed, the full chain is re-validated
 *       (title belongs to level, college belongs to institution, department belongs to college).
 *     parameters:
 *       - in: path
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               degreeLevelId:
 *                 type: integer
 *               degreeTitleId:
 *                 type: integer
 *               collegeId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               cgpa:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 4
 *                 nullable: true
 *               graduationDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Degree record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeRecordResponse'
 *       400:
 *         description: Validation failed or FK chain violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       404:
 *         description: Degree record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *   delete:
 *     summary: Delete a degree record
 *     tags:
 *       - Degrees
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Degree record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Degree record deleted successfully
 *       400:
 *         description: Degree ID is required or institution context is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 *       404:
 *         description: Degree record not found or not authorized to delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DegreeErrorResponse'
 */

export {};
