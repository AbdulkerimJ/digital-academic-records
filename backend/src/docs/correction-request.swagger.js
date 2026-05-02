/**
 * @swagger
 * components:
 *   schemas:
 *     CorrectionRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         requestText:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *         rejectionReason:
 *           type: string
 *         recordId:
 *           type: string
 *           format: uuid
 *         recordType:
 *           type: string
 *           enum: [EXAM, DEGREE]
 *         createdAt:
 *           type: string
 *           format: date-time

 *
 * /api/students/records/{recordId}/correction:
 *   post:
 *     summary: Submit a correction request for a specific record
 *     description: Automatically links the request to the correct institution based on the record.
 *     tags: [Correction Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the exam or degree record to correct
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestText
 *               - recordType
 *             properties:
 *               requestText:
 *                 type: string
 *               recordType:
 *                 type: string
 *                 enum: [EXAM, DEGREE]
 *     responses:
 *       201:
 *         description: Request submitted successfully

 *   get:
 *     summary: Get student's own correction requests
 *     tags: [Correction Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests
 *
 * /api/correction-requests:
 *   get:
 *     summary: List all correction requests (Admin only)
 *     tags: [Correction Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of requests
 *
 * /api/correction-requests/{id}:
 *   get:
 *     summary: Get correction request detail (Admin only)
 *     tags: [Correction Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Request detail
 *
 * /api/correction-requests/{id}/approve:
 *   patch:
 *     summary: Approve a correction request (Admin only)
 *     tags: [Correction Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Request approved
 *
 * /api/correction-requests/{id}/reject:
 *   patch:
 *     summary: Reject a correction request (Admin only)
 *     tags: [Correction Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request rejected
 */
