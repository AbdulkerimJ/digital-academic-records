/**
 * @swagger
 * /app/api/citizens/{faydaId}:
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Citizen fetched successfully
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       400:
 *         description: Fayda ID is required
 *       404:
 *         description: Citizen not found
 *       500:
 *         description: Server error
 */

export {};
