const { query } = require('../db');

async function createToken(userId, token, expiresAt) {
  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  );
}

async function findValidToken(token, now) {
  const result = await query(
    `SELECT prt.id, prt.user_id
     FROM password_reset_tokens prt
     WHERE prt.token = $1
       AND prt.expires_at > $2
       AND prt.used = FALSE`,
    [token, now],
  );
  return result.rows[0] || null;
}

async function markAsUsed(id) {
  await query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [id]);
}

module.exports = {
  createToken,
  findValidToken,
  markAsUsed,
};

