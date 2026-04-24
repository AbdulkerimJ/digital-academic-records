/**
 * @swagger
 *
 * # Admin - Institution Endpoints
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
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
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
 *             properties:
 *               name:
 *                 type: string
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
 *             required:
 *               - name
 *               - code
 *               - type
 *     responses:
 *       201:
 *         description: Institution created successfully
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
 *                   example: Institution created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     institution:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         code:
 *                           type: string
 *                         type:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation failed or duplicate institution name/code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Institution already exists with this code
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You are not logged in. Please log in to get access.
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You do not have permission to perform this action.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Something went wrong.
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
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *       404:
 *         description: Institution not found
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
 *       400:
 *         description: Validation failed or duplicate institution name/code
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *       404:
 *         description: Institution not found
 */

export {};
