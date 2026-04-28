/**
 * @swagger
 * components:
 *   schemas:
 *     ExamErrorResponse:
 *       type: object
 *       example:
 *         success: false
 *         message: Exam record not found
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     ExamLevelItem:
 *       type: object
 *       example:
 *         id: 1
 *         code: GRADE_12
 *         name: Grade 12 Exam
 *         isActive: true
 *         createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ExamLevelResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Exam level fetched successfully
 *         data:
 *           examLevel:
 *             id: 1
 *             code: GRADE_12
 *             name: Grade 12 Exam
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
 *             examLevel:
 *               $ref: '#/components/schemas/ExamLevelItem'
 *     ExamLevelListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Exam levels fetched successfully
 *         data:
 *           count: 2
 *           examLevels:
 *             - id: 1
 *               code: GRADE_12
 *               name: Grade 12 Exam
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
 *             examLevels:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamLevelItem'
 *     ExamRecordItem:
 *       type: object
 *       example:
 *         id: 1b6e7c2d-7ed6-4d9a-9d52-2b0ce0d724f4
 *         studentId: 7d0ddf8c-9a7b-4d45-8b14-5f8a9f8a2b21
 *         examLevelId: 1
 *         examLevelCode: GRADE_12
 *         examLevelName: Grade 12 Exam
 *         institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *         year: 2025
 *         totalScore: 78.5
 *         averageScore: 78.5
 *         percentile: 92
 *         resultStatus: PASS
 *         createdAt: 2026-04-27T09:15:00.000Z
 *         updatedAt: 2026-04-27T09:15:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         examLevelId:
 *           type: integer
 *         examLevelCode:
 *           type: string
 *         examLevelName:
 *           type: string
 *         institutionId:
 *           type: string
 *           format: uuid
 *         year:
 *           type: integer
 *         totalScore:
 *           type: number
 *           nullable: true
 *         averageScore:
 *           type: number
 *           nullable: true
 *         percentile:
 *           type: number
 *           nullable: true
 *         resultStatus:
 *           type: string
 *           enum:
 *             - PASS
 *             - FAIL
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ExamRecordResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Exam record fetched successfully
 *         data:
 *           examRecord:
 *             id: 1b6e7c2d-7ed6-4d9a-9d52-2b0ce0d724f4
 *             studentId: 7d0ddf8c-9a7b-4d45-8b14-5f8a9f8a2b21
 *             examLevelId: 1
 *             examLevelCode: GRADE_12
 *             examLevelName: Grade 12 Exam
 *             institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *             year: 2025
 *             totalScore: 78.5
 *             averageScore: 78.5
 *             percentile: 92
 *             resultStatus: PASS
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
 *             examRecord:
 *               $ref: '#/components/schemas/ExamRecordItem'
 *     ExamRecordListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Exam records fetched successfully
 *         data:
 *           examRecords:
 *             - id: 1b6e7c2d-7ed6-4d9a-9d52-2b0ce0d724f4
 *               studentId: 7d0ddf8c-9a7b-4d45-8b14-5f8a9f8a2b21
 *               examLevelId: 1
 *               examLevelCode: GRADE_12
 *               examLevelName: Grade 12 Exam
 *               institutionId: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *               year: 2025
 *               totalScore: 78.5
 *               averageScore: 78.5
 *               percentile: 92
 *               resultStatus: PASS
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
 *             examRecords:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamRecordItem'
 *     CreatedExamRecordResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Exam record created successfully
 *         data:
 *           examRecord:
 *             id: 1b6e7c2d-7ed6-4d9a-9d52-2b0ce0d724f4
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             examRecord:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *
 * /api/exams/levels:
 *   get:
 *     summary: List exam levels
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Exam levels fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamLevelListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *   post:
 *     summary: Create a new exam level (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 example: GRADE_12
 *               name:
 *                 type: string
 *                 example: Grade 12 Exam
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Exam level created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamLevelResponse'
 *       400:
 *         description: Validation failed or duplicate exam level code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *
 * /api/exams/levels/{examLevelId}:
 *   get:
 *     summary: Get exam level by ID
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: examLevelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam level fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamLevelResponse'
 *       400:
 *         description: Exam level is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       404:
 *         description: Exam level not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *   patch:
 *     summary: Update an exam level (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: examLevelId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Exam level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamLevelResponse'
 *       400:
 *         description: Validation failed or duplicate exam level code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       404:
 *         description: Exam level not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *
 * /api/exams:
 *   get:
 *     summary: List exam records
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: institutionId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by institution ID
 *       - in: query
 *         name: examLevelCode
 *         schema:
 *           type: string
 *         description: Filter by exam level code
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
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
 *         description: Exam records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamRecordListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *   post:
 *     summary: Create an exam record
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     description: At least one of totalScore, averageScore, or percentile must be provided. For SUPER_ADMIN users, institutionId is required; for other users, the institution is derived from the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - examLevelId
 *               - year
 *               - resultStatus
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               examLevelId:
 *                 type: integer
 *               institutionId:
 *                 type: string
 *                 format: uuid
 *                 description: Required for SUPER_ADMIN users
 *               year:
 *                 type: integer
 *               totalScore:
 *                 type: number
 *               averageScore:
 *                 type: number
 *               percentile:
 *                 type: number
 *               resultStatus:
 *                 type: string
 *                 enum:
 *                   - PASS
 *                   - FAIL
 *     responses:
 *       201:
 *         description: Exam record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatedExamRecordResponse'
 *       400:
 *         description: Validation failed or missing institution context
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       403:
 *         description: Forbidden (if role permissions block access)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *
 * /api/exams/{examId}:
 *   get:
 *     summary: Get exam record by ID
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Exam record fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamRecordResponse'
 *       400:
 *         description: Exam ID is required or institution context is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       404:
 *         description: Exam record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *   patch:
 *     summary: Update an exam record
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
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
 *               year:
 *                 type: integer
 *               totalScore:
 *                 type: number
 *               averageScore:
 *                 type: number
 *               percentile:
 *                 type: number
 *               resultStatus:
 *                 type: string
 *                 enum:
 *                   - PASS
 *                   - FAIL
 *     responses:
 *       200:
 *         description: Exam record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamRecordResponse'
 *       400:
 *         description: Validation failed or exam ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       404:
 *         description: Exam record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *   delete:
 *     summary: Delete an exam record
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Exam record deleted successfully
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
 *                   example: Exam record deleted successfully
 *       400:
 *         description: Validation failed or exam ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       404:
 *         description: Exam record not found or not authorized to delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 */

export {};
