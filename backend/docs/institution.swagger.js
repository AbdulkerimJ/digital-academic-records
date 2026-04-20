/**
 * @swagger
 * /app/api/institutions:
 *   post:
 *     summary: Create a new institution
 *     tags:
 *       - Institutions
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
 *       400:
 *         description: Validation failed or duplicate institution name/code
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

export {};
