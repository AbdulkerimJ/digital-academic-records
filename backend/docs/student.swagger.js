/**
 * @swagger
 * /app/api/students/login:
 *   post:
 *     summary: Start login by validating Fayda ID and sending OTP
 *     tags:
 *       - Students
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               faydaId:
 *                 type: string
 *             required:
 *               - faydaId
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: OTP sent successfully
 *                 data:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: faydaId is required
 *       404:
 *         description: Citizen not found
 *       500:
 *         description: Server error
 *
 * /app/api/students/verify:
 *   post:
 *     summary: Verify OTP and issue login token
 *     tags:
 *       - Students
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               faydaId:
 *                 type: string
 *               otp:
 *                 type: string
 *             required:
 *               - faydaId
 *               - otp
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       additionalProperties: true
 *       400:
 *         description: faydaId and otp are required
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: Citizen not found
 *       500:
 *         description: Server error
 *
 * /app/api/students/me:
 *   get:
 *     summary: Get current authenticated user from token
 *     tags:
 *       - Students
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user payload
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
 *                   example: Current user fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         national_id:
 *                           type: string
 *       401:
 *         description: Not logged in
 */

export {};
