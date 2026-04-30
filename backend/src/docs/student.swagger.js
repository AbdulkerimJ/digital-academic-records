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
 *         dateOfBirth:
 *           type: string
 *           format: date
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
 *         student:
 *           $ref: '#/components/schemas/StudentProfile'
 *
 * /api/students/login:
 *   post:
 *     summary: Start student login by validating Fayda ID and sending OTP
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [faydaId]
 *             properties:
 *               faydaId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *
 * /api/students/verify:
 *   post:
 *     summary: Verify student OTP and issue login token
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [faydaId, otp]
 *             properties:
 *               faydaId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /api/students/refresh:
 *   post:
 *     summary: Refresh student access token
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Token refreshed
 *
 * /api/students/logout:
 *   post:
 *     summary: Log out current student
 *     tags: [Students]
 *     security:
 *       - studentAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *
 * /api/students/me:
 *   get:
 *     summary: Get current student profile
 *     tags: [Students]
 *     security:
 *       - studentAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *
 * /api/students/me/exams:
 *   get:
 *     summary: Get current student's exam records
 *     tags: [Students]
 *     security:
 *       - studentAuth: []
 *     responses:
 *       200:
 *         description: Exam records fetched
 *
 * /api/students/me/degrees:
 *   get:
 *     summary: Get current student's degree records
 *     tags: [Students]
 *     security:
 *       - studentAuth: []
 *     responses:
 *       200:
 *         description: Degree records fetched
 *
 * /api/students:
 *   get:
 *     summary: List and search students (Admin only)
 *     tags: [Admin - Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student list fetched
 *
 * /api/students/{id}:
 *   get:
 *     summary: Get student detail by ID (Admin only)
 *     tags: [Admin - Students]
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
 *         description: Student detail fetched
 */
