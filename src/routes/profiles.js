const express = require('express');
const { authMiddleware } = require('../middlewares/auth');
const profileController = require('../controllers/profileController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Perfis
 *   description: Gestão de perfis de acesso
 */

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Lista todos os perfis de acesso
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de perfis
 */
router.get('/', authMiddleware, profileController.listProfiles);

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Cria um novo perfil de acesso
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: object
 *     responses:
 *       201:
 *         description: Perfil criado
 */
router.post('/', authMiddleware, profileController.createProfile);

/**
 * @swagger
 * /api/profiles/{id}:
 *   put:
 *     summary: Atualiza um perfil de acesso
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: object
 *     responses:
 *       200:
 *         description: Perfil atualizado
 */
router.put('/:id', authMiddleware, profileController.updateProfile);

/**
 * @swagger
 * /api/profiles/{id}:
 *   delete:
 *     summary: Exclui um perfil de acesso
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Perfil excluído
 */
router.delete('/:id', authMiddleware, profileController.deleteProfile);

module.exports = router;

