/**
 * @swagger
 * components:
 *   schemas:
 *     CitizenErrorResponse:
 *       type: object
 *       example:
 *         success: false
 *         message: Citizen not found
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     CitizenResponse:
 *       type: object
 *       example:
 *         success: true
 *         message: Citizen fetched successfully
 *         data:
 *           faydaId: FD-2026-0001
 *           firstName: Hana
 *           fatherName: Tekle
 *           dateOfBirth: 2008-02-12
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Citizen fetched successfully
 *         data:
 *           type: object
 *           description: Citizen profile returned by the Fayda service
 *           additionalProperties: true
 *
 * /api/citizens/{faydaId}:
 *   get:
 *     summary: Fetch citizen profile by Fayda ID from Fayda service
 *     tags:
 *       - Citizens
 *     parameters:
 *       - in: path
 *         name: faydaId
 *         required: true
 *         schema:
 *           type: string
 *         description: National Fayda ID
 *     responses:
 *       200:
 *         description: Citizen fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CitizenResponse'
 *       400:
 *         description: Fayda ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CitizenErrorResponse'
 *       404:
 *         description: Citizen not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CitizenErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CitizenErrorResponse'
 */

export {};
