/**
 * @swagger
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
 *       400:
 *         description: Fayda ID is required
 *       404:
 *         description: Citizen not found
 */

export {};
