/**
 * @swagger
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
 *       400:
 *         description: email and password are required
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account is not active
 *
 * /api/users/refresh:
 *   post:
 *     summary: Refresh user access token
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Missing, invalid, or expired refresh token
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
 *       401:
 *         description: Not logged in
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
 *       400:
 *         description: Invalid token, expired invite, or weak password
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
 *       401:
 *         description: Not logged in
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
 *       400:
 *         description: Invalid request body or weak password
 *       401:
 *         description: Not logged in or current password is incorrect
 *       404:
 *         description: User not found
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
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
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
 *       400:
 *         description: Validation failed, duplicate email, or invalid role reference
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
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
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *       404:
 *         description: User not found
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
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *       404:
 *         description: User not found
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
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *       404:
 *         description: User not found
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
 *       400:
 *         description: User is active or request invalid
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *       404:
 *         description: User not found
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
 *       400:
 *         description: User is active or request invalid
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Forbidden (requires SUPER_ADMIN)
 *       404:
 *         description: User not found
 */

export {};
