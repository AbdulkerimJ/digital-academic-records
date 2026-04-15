/**
 * @swagger
 * /api/citizens/{faydaId}:
 *   get:
 *     summary: Get citizen details by Fayda ID
 *     tags:
 *       - Citizens
 *     parameters:
 *       - in: path
 *         name: faydaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Citizen Fayda ID
 *     responses:
 *       200:
 *         description: Citizen record found
 *       404:
 *         description: Citizen not found
 */

export {};
