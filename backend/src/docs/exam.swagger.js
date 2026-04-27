/**
 * @swagger
 *
 * # Exam Endpoints
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
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *             required:
 *               - code
 *               - name
 *     responses:
 *       201:
 *         description: Exam type created successfully
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
 *     responses:
 *       200:
 *         description: Exam records fetched successfully
 *   post:
 *     summary: Create an exam record
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     description: At least one of totalScore, averageScore or percentile must be provided.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               examTypeId:
 *                 type: integer
 *               institutionId:
 *                 type: string
 *                 format: uuid
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
 *             required:
 *               - studentId
 *               - examTypeId
 *               - institutionId
 *               - year
 *               - resultStatus
 *     responses:
 *       201:
 *         description: Exam record created successfully
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
 */

export {};
