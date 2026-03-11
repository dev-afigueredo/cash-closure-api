const express = require('express');
const { authMiddleware } = require('../middlewares/auth');
const cashController = require('../controllers/cashController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Caixa
 *   description: Operações de caixa e fechamento
 */

/**
 * @swagger
 * /api/cash/transactions:
 *   post:
 *     summary: Registra uma movimentação de caixa (entrada/saida)
 *     tags: [Caixa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, valor]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [entrada, saida]
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *     responses:
 *       201:
 *         description: Movimentação registrada
 */
router.post('/transactions', authMiddleware, cashController.registerTransaction);

/**
 * @swagger
 * /api/cash/balance:
 *   get:
 *     summary: Obtém o saldo atual em dinheiro
 *     tags: [Caixa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo atual
 */
router.get('/balance', authMiddleware, cashController.getBalance);

/**
 * @swagger
 * /api/cash/closures:
 *   post:
 *     summary: Salva o fechamento de caixa
 *     tags: [Caixa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [operador, valorInicial, totalContado, valorLiquido]
 *             properties:
 *               operador:
 *                 type: string
 *               valorInicial:
 *                 type: number
 *               totalContado:
 *                 type: number
 *               totalSangrias:
 *                 type: number
 *               valorLiquido:
 *                 type: number
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fechamento salvo com sucesso
 */
router.post('/closures', authMiddleware, cashController.saveClosure);

/**
 * @swagger
 * /api/cash/closures:
 *   get:
 *     summary: Obtém relatório de fechamentos de caixa
 *     tags: [Caixa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: inicio
 *         schema:
 *           type: string
 *         description: Data/hora inicial (ISO)
 *       - in: query
 *         name: fim
 *         schema:
 *           type: string
 *         description: Data/hora final (ISO)
 *     responses:
 *       200:
 *         description: Lista de fechamentos
 */
router.get('/closures', authMiddleware, cashController.listClosures);

module.exports = router;

