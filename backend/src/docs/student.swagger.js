/**
 * @swagger
 * components:
 *   schemas:
 *     StudentErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     StudentAuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         nationalId:
 *           type: string
 *     StudentProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         nationalId:
 *           type: string
 *         tokenVersion:
 *           type: integer
 *     StudentAuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/StudentAuthUser'
 *     StudentMeResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/StudentProfile'
 *
 * /api/students/login:
 *   post:
 *     summary: Start student login by validating Fayda ID and sending OTP
 *     description: Sends an OTP to the citizen linked to the given Fayda ID.
 *     tags:
 *       - Students
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - faydaId
 *             properties:
 *               faydaId:
 *                 type: string
 *                 description: National Fayda ID
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
 *       400:
 *         description: Fayda ID is missing or OTP delivery failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 *       404:
 *         description: Citizen not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 *
 * /api/students/verify:
 *   post:
 *     summary: Verify student OTP and issue login token
 *     description: Verifies the OTP through Fayda and creates the student record if needed.
 *     tags:
 *       - Students
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - faydaId
 *               - otp
 *             properties:
 *               faydaId:
 *                 type: string
 *                 description: National Fayda ID
 *               otp:
 *                 type: string
 *                 description: One-time password from Fayda
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StudentAuthResponse'
 *       400:
 *         description: Missing Fayda ID/OTP or OTP verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 *       401:
 *         description: Invalid OTP payload or expired session token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 *       404:
 *         description: Citizen not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 *
 * /api/students/refresh:
 *   post:
 *     summary: Refresh student access token
 *     tags:
 *       - Students
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StudentAuthResponse'
 *       401:
 *         description: Missing, invalid, or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 *
 * /api/students/logout:
 *   post:
 *     summary: Log out current student
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 *
 * /api/students/me:
 *   get:
 *     summary: Get current authenticated student profile
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StudentMeResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentErrorResponse'
 */

export {};
