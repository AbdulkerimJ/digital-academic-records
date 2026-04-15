/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Start login by validating Fayda ID and sending OTP
 *     tags:
 *       - Auth
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
 *       404:
 *         description: Citizen not found
 *
 * /api/auth/verify:
 *   post:
 *     summary: Verify OTP and issue login token
 *     tags:
 *       - Auth
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
 *       400:
 *         description: Invalid OTP or request
 */

export {};
