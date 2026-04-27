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
 *       properties:
 *         accessToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/UserAuthUser'
 *     CurrentUserProfile:
 *       type: object
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
 *       properties:
 *         id:
 *           type: integer
 *         role_name:
 *           type: string
 *     AdminUserRecord:
 *       type: object
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
