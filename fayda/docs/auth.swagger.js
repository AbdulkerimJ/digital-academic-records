/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to a Fayda ID
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
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for a Fayda ID
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
 *         description: OTP verified
 *       400:
 *         description: Invalid OTP or request
 */

export {};
