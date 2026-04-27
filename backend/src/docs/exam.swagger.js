/**
 * @swagger
 * components:
 *   schemas:
 *     ExamErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     ExamTypeItem:
 *       type: object
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
 *     ExamTypeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             examType:
 *               $ref: '#/components/schemas/ExamTypeItem'
 *     ExamTypeListResponse:
 *       type: object
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
 *             examTypes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamTypeItem'
 *     ExamRecordItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         examTypeId:
 *           type: integer
 *         examTypeCode:
 *           type: string
 *         examTypeName:
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
 * /api/exams/types:
 *   get:
 *     summary: List exam types
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Exam types fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamTypeListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *   post:
 *     summary: Create a new exam type (Admin only)
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
 *         description: Exam type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamTypeResponse'
 *       400:
 *         description: Validation failed or duplicate exam type code
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
 * /api/exams/types/{examTypeId}:
 *   get:
 *     summary: Get exam type by ID
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: examTypeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam type fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamTypeResponse'
 *       400:
 *         description: Exam type is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *       404:
 *         description: Exam type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamErrorResponse'
 *   patch:
 *     summary: Update an exam type (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: examTypeId
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
 *         description: Exam type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamTypeResponse'
 *       400:
 *         description: Validation failed or duplicate exam type code
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
 *         description: Exam type not found
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
 *         name: examTypeCode
 *         schema:
 *           type: string
 *         description: Filter by exam type code
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
 *               - examTypeId
 *               - year
 *               - resultStatus
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               examTypeId:
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
