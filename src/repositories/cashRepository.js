const { query } = require('../db');

async function createTransaction({ userId, tipo, descricao, valor }) {
  const signedAmount = tipo === 'saida' ? -Math.abs(Number(valor)) : Math.abs(Number(valor));
  const result = await query(
    `INSERT INTO cash_transactions (user_id, type, description, amount)
     VALUES ($1, $2, $3, $4)
     RETURNING id, type, description, amount, created_at`,
    [userId, tipo, descricao || null, signedAmount],
  );
  return result.rows[0];
}

async function getCurrentBalance() {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) AS saldo
     FROM cash_transactions`,
    [],
  );
  return Number(result.rows[0].saldo || 0);
}

async function createClosure({
  userId,
  operador,
  valorInicial,
  totalContado,
  totalSangrias,
  valorLiquido,
  observacoes,
}) {
  const result = await query(
    `INSERT INTO cash_closures
     (user_id, operator_name, opening_balance, counted_total, total_withdrawals, net_amount, observations, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'fechado')
     RETURNING id, operator_name, opening_balance, counted_total, total_withdrawals, net_amount, observations, status, closed_at`,
    [
      userId,
      operador,
      valorInicial,
      totalContado,
      totalSangrias || 0,
      valorLiquido,
      observacoes || null,
    ],
  );
  return result.rows[0];
}

async function listClosures({ inicio, fim }) {
  const params = [];
  let where = '1=1';

  if (inicio) {
    params.push(inicio);
    where += ` AND closed_at >= $${params.length}`;
  }
  if (fim) {
    params.push(fim);
    where += ` AND closed_at <= $${params.length}`;
  }

  const result = await query(
    `SELECT c.id,
            c.operator_name AS operador,
            c.opening_balance AS valor_inicial,
            c.counted_total AS total_contado,
            c.total_withdrawals AS total_sangrias,
            c.net_amount AS valor_liquido,
            c.observations AS observacoes,
            c.status,
            c.closed_at,
            u.name AS usuario_responsavel
     FROM cash_closures c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE ${where}
     ORDER BY c.closed_at DESC`,
    params,
  );

  return result.rows;
}

module.exports = {
  createTransaction,
  getCurrentBalance,
  createClosure,
  listClosures,
};

