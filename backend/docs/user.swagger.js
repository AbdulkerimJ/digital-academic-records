/**
 * @swagger
 * /app/api/users:
 *   post:
 *     summary: Create an application user and send email verification OTP
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               roleId:
 *                 type: integer
 *               institutionId:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - roleId
 *               - institutionId
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation failed, invalid role/institution, or duplicate email
 *       500:
 *         description: Server error
 *
 * /app/api/users/verify-email:
 *   post:
 *     summary: Verify user email using a 6-digit OTP
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 example: "123456"
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *
 * /app/api/users/login:
 *   post:
 *     summary: Log in an application user and receive a user token
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User login successful
 *       400:
 *         description: email and password are required
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 *
 * /app/api/users/me:
 *   get:
 *     summary: Get current authenticated user from token
 *     tags:
 *       - Users
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
 *                       additionalProperties: true
 *       401:
 *         description: Not logged in
 */

export {};
