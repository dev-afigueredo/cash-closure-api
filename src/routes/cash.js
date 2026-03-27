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
 *               detalhamento:
 *                 type: object
 *                 description: Quantidades de cada nota/moeda. Ex {"200": 1, "0.50": 5}
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

/**
 * @swagger
 * /api/cash/closures/{id}:
 *   get:
 *     summary: Obtém um fechamento específico pelo ID
 *     tags: [Caixa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do fechamento
 *       404:
 *         description: Fechamento não encontrado
 */
router.get('/closures/:id', authMiddleware, cashController.getClosure);

/**
 * @swagger
 * /api/cash/sangria:
 *   post:
 *     summary: Registra uma sangria (retirada)
 *     tags: [Caixa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [valor]
 *             properties:
 *               valor:
 *                 type: number
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sangria registrada com sucesso
 */
router.post('/sangria', authMiddleware, cashController.registerSangria);

/**
 * @swagger
 * /api/cash/adjust:
 *   post:
 *     summary: Ajusta o saldo do sistema para um valor informado
 *     tags: [Caixa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [saldoInformado, motivo]
 *             properties:
 *               saldoInformado:
 *                 type: number
 *               motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ajuste realizado
 */
router.post('/adjust', authMiddleware, cashController.adjustBalance);

module.exports = router;
