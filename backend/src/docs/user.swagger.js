/**
 * @swagger
 * components:
 *   schemas:
 *     UserErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     UserAuthUser:
 *       type: object
 *       example:
 *         id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         roleName: REGISTRAR
 *         institutionId: 8f1f2b40-3d74-4df7-8f2d-0b1b4e1d9fd1
 *         institutionName: Regional Exam Board
 *         institutionCode: REB
 *         institutionType: EXAM_BOARD
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         roleName:
 *           type: string
 *         institutionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         institutionName:
 *           type: string
 *           nullable: true
 *         institutionCode:
 *           type: string
 *           nullable: true
 *         institutionType:
 *           type: string
 *           nullable: true
 *     UserAuthResponse:
 *       type: object
 *       example:
 *         accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *           firstName: John
 *           lastName: Doe
 *           email: john.doe@example.com
 *           roleName: REGISTRAR
 *           institutionId: 8f1f2b40-3d74-4df7-8f2d-0b1b4e1d9fd1
 *           institutionName: Regional Exam Board
 *           institutionCode: REB
 *           institutionType: EXAM_BOARD
 *       properties:
 *         accessToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/UserAuthUser'
 *     CurrentUserProfile:
 *       type: object
 *       example:
 *         id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         role: REGISTRAR
 *         roleId: 2
 *         institutionId: 8f1f2b40-3d74-4df7-8f2d-0b1b4e1d9fd1
 *         institutionName: Regional Exam Board
 *         institutionCode: REB
 *         institutionType: EXAM_BOARD
 *         tokenVersion: 0
 *         passwordChangedAt: null
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *         roleId:
 *           type: integer
 *         institutionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         institutionName:
 *           type: string
 *           nullable: true
 *         institutionCode:
 *           type: string
 *           nullable: true
 *         institutionType:
 *           type: string
 *           nullable: true
 *         tokenVersion:
 *           type: integer
 *         passwordChangedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     RoleItem:
 *       type: object
 *       example:
 *         id: 1
 *         role_name: SUPER_ADMIN
 *       properties:
 *         id:
 *           type: integer
 *         role_name:
 *           type: string
 *     AdminUserRecord:
 *       type: object
 *       example:
 *         id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         isActive: true
 *         isSuspended: false
 *         suspendedAt: null
 *         suspensionReason: null
 *         suspender: null
 *         invitationExpires: 2026-04-28T10:00:00.000Z
 *         roleId: 2
 *         roleName: REGISTRAR
 *         institutionId: 8f1f2b40-3d74-4df7-8f2d-0b1b4e1d9fd1
 *         institutionName: Regional Exam Board
 *         institutionCode: REB
 *         institutionType: EXAM_BOARD
 *         tokenVersion: 0
 *         passwordChangedAt: null
 *         createdAt: 2026-04-27T09:00:00.000Z
 *         updatedAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         isActive:
 *           type: boolean
 *         isSuspended:
 *           type: boolean
 *         suspendedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         suspensionReason:
 *           type: string
 *           nullable: true
 *         suspender:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *         invitationExpires:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         roleId:
 *           type: integer
 *         roleName:
 *           type: string
 *           nullable: true
 *         institutionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         institutionName:
 *           type: string
 *           nullable: true
 *         institutionCode:
 *           type: string
 *           nullable: true
 *         institutionType:
 *           type: string
 *           nullable: true
 *         tokenVersion:
 *           type: integer
 *         passwordChangedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserInviteRecord:
 *       type: object
 *       example:
 *         id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         isActive: false
 *         invitationExpires: 2026-04-28T10:00:00.000Z
 *         roleId: 2
 *         institutionId: 8f1f2b40-3d74-4df7-8f2d-0b1b4e1d9fd1
 *         institutionName: Regional Exam Board
 *         institutionCode: REB
 *         institutionType: EXAM_BOARD
 *         createdAt: 2026-04-27T09:00:00.000Z
 *         updatedAt: 2026-04-27T09:00:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         isActive:
 *           type: boolean
 *         invitationExpires:
 *           type: string
 *           format: date-time
 *         roleId:
 *           type: integer
 *         institutionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         institutionName:
 *           type: string
 *           nullable: true
 *         institutionCode:
 *           type: string
 *           nullable: true
 *         institutionType:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserUpdatedRecord:
 *       type: object
 *       example:
 *         id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *         firstName: Jane
 *         lastName: Doe
 *         email: jane.doe@example.com
 *         roleId: 2
 *         institutionId: 8f1f2b40-3d74-4df7-8f2d-0b1b4e1d9fd1
 *         createdAt: 2026-04-27T09:00:00.000Z
 *         updatedAt: 2026-04-27T10:00:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         roleId:
 *           type: integer
 *         institutionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DeletedUserRecord:
 *       type: object
 *       example:
 *         id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *         firstName: Jane
 *         lastName: Doe
 *         email: jane.doe@example.com
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *     UserSuspendRecord:
 *       type: object
 *       example:
 *         id: 2f2d8c2c-0fd1-4d0d-a8db-8d7d8a5c4d6a
 *         firstName: Jane
 *         lastName: Doe
 *         email: jane.doe@example.com
 *         isActive: true
 *         isSuspended: true
 *         suspendedAt: 2026-04-27T10:00:00.000Z
 *         suspendedBy: 4c4c2b5b-3e3c-46dd-8c18-fc76b1b2d1a1
 *         suspensionReason: Test account misuse
 *         tokenVersion: 1
 *         updatedAt: 2026-04-27T10:00:00.000Z
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         isActive:
 *           type: boolean
 *         isSuspended:
 *           type: boolean
 *         suspendedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         suspendedBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         suspensionReason:
 *           type: string
 *           nullable: true
 *         tokenVersion:
 *           type: integer
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserListResponse:
 *       type: object
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
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminUserRecord'
 *     UserDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/AdminUserRecord'
 *     UserActionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserInviteRecord'
 *                 - $ref: '#/components/schemas/UserUpdatedRecord'
 *                 - $ref: '#/components/schemas/DeletedUserRecord'
 *                 - $ref: '#/components/schemas/UserSuspendRecord'
 *     RoleListResponse:
 *       type: object
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
 *             roles:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoleItem'
 *
 * /api/users/login:
 *   post:
 *     summary: Log in an application user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User login successful
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
 *                   $ref: '#/components/schemas/UserAuthResponse'
 *       400:
 *         description: email and password are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Account is not active or suspended
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/refresh:
 *   post:
 *     summary: Refresh user access token
 *     tags:
 *       - Users
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
 *                   $ref: '#/components/schemas/UserAuthResponse'
 *       401:
 *         description: Missing, invalid, or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/logout:
 *   post:
 *     summary: Log out current user
 *     tags:
 *       - Users
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
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/activate-invite:
 *   post:
 *     summary: Activate invited account by token and set password
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Account activated successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserInviteRecord'
 *       400:
 *         description: Invalid token, expired invite, or weak password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/roles:
 *   get:
 *     summary: List roles (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     tags:
 *       - Users
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/CurrentUserProfile'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *   patch:
 *     summary: Update currently authenticated user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserUpdatedRecord'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/change-password:
 *   patch:
 *     summary: Change current user's password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   $ref: '#/components/schemas/UserAuthResponse'
 *       400:
 *         description: Invalid request body or weak password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in or current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users:
 *   get:
 *     summary: List all application users (Admin only)
 *     description: Accessible only to SUPER_ADMIN users. The currently authenticated requester is excluded from the returned list.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully (includes count and users list)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *   post:
 *     summary: Invite an application user (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - roleId
 *               - institutionId
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               roleId:
 *                 type: integer
 *               institutionId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User invited successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserInviteRecord'
 *       400:
 *         description: Validation failed, duplicate email, or invalid role reference
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/{userId}:
 *   get:
 *     summary: Get an application user by ID (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User fetched successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/AdminUserRecord'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *   patch:
 *     summary: Update an application user (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               roleId:
 *                 type: integer
 *               institutionId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserUpdatedRecord'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *   delete:
 *     summary: Delete an application user (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/DeletedUserRecord'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/{userId}/resend-invite:
 *   post:
 *     summary: Resend activation invite for an inactive user (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invitation resent successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserInviteRecord'
 *       400:
 *         description: User is active or request invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/{userId}/revoke-invite:
 *   patch:
 *     summary: Revoke activation invite for an inactive user (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invitation revoked successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserInviteRecord'
 *       400:
 *         description: User is active or request invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/{userId}/suspend:
 *   patch:
 *     summary: Suspend a user account (Admin only)
 *     description: Accessible only to SUPER_ADMIN users. Suspended users cannot log in or refresh sessions.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User suspended successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserSuspendRecord'
 *       400:
 *         description: Invalid request or user is already suspended
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *
 * /api/users/{userId}/unsuspend:
 *   patch:
 *     summary: Unsuspend a user account (Admin only)
 *     description: Accessible only to SUPER_ADMIN users.
 *     tags:
 *       - Admin - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User unsuspended successfully
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserSuspendRecord'
 *       400:
 *         description: Invalid request or user is not suspended
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 */

export {};
