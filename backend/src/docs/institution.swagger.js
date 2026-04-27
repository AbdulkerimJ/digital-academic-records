/**
 * @swagger
 * components:
 *   schemas:
 *     InstitutionErrorResponse:
 *       type: object
 *       example:
 *         success: false
 *         message: Institution not found
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     InstitutionItem:
 *       type: object
 *       example:
 *         id: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *         name: Regional Exam Board
 *         code: REB
 *         type: EXAM_BOARD
 *         isActive: true
 *         createdAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - GOVERNMENT_BODY
 *             - EXAM_BOARD
 *             - UNIVERSITY
 *             - COLLEGE
 *             - REGIONAL_OFFICE
 *             - OTHER
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     InstitutionResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Institution fetched successfully
 *         data:
 *           institution:
 *             id: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *             name: Regional Exam Board
 *             code: REB
 *             type: EXAM_BOARD
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
 *             institution:
 *               $ref: '#/components/schemas/InstitutionItem'
 *     InstitutionListResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Institutions fetched successfully
 *         data:
 *           count: 2
 *           institutions:
 *             - id: 9a6a2bf0-8c10-4f0d-a5d8-2d8f87c7b701
 *               name: Regional Exam Board
 *               code: REB
 *               type: EXAM_BOARD
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
 *             institutions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InstitutionItem'
 *
 * /api/institutions:
 *   get:
 *     summary: List institutions (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Institutions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Institutions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *   post:
 *     summary: Create a new institution (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Institutions
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
 *               - name
 *               - code
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ministry of Education
 *               code:
 *                 type: string
 *                 example: MOE
 *               type:
 *                 type: string
 *                 enum:
 *                   - GOVERNMENT_BODY
 *                   - EXAM_BOARD
 *                   - UNIVERSITY
 *                   - COLLEGE
 *                   - REGIONAL_OFFICE
 *                   - OTHER
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Institution created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionResponse'
 *       400:
 *         description: Validation failed or duplicate institution name/code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *
 * /api/institutions/{institutionId}:
 *   get:
 *     summary: Get institution by ID (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Institutions
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
 *         description: Institution fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       404:
 *         description: Institution not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *   patch:
 *     summary: Update institution by ID (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Institutions
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
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - GOVERNMENT_BODY
 *                   - EXAM_BOARD
 *                   - UNIVERSITY
 *                   - COLLEGE
 *                   - REGIONAL_OFFICE
 *                   - OTHER
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Institution updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionResponse'
 *       400:
 *         description: Validation failed or duplicate institution name/code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 *       404:
 *         description: Institution not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionErrorResponse'
 */

export {};
