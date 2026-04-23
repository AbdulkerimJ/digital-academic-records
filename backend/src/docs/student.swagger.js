/**
 * @swagger
 * /api/students/login:
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
 *             required:
 *               - faydaId
 *             properties:
 *               faydaId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: faydaId is required
 *       404:
 *         description: Citizen not found
 *
 * /api/students/verify:
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
 *             required:
 *               - faydaId
 *               - otp
 *             properties:
 *               faydaId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: faydaId and otp are required
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: Citizen not found
 *
 * /api/students/refresh:
 *   post:
 *     summary: Refresh student access token
 *     tags:
 *       - Students
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Missing, invalid, or expired refresh token
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
 *       401:
 *         description: Not logged in
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
 *       401:
 *         description: Not logged in
 */

export {};
