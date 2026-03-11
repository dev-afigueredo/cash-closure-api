const { query } = require('../db');

async function findByEmail(email) {
  const result = await query(
    'SELECT id, name, email, password_hash, role, profile_id, active FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] || null;
}

async function findActiveByEmail(email) {
  const result = await query(
    'SELECT id, name, email, password_hash, role, profile_id FROM users WHERE email = $1 AND active = TRUE',
    [email],
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.role, u.profile_id, p.name AS perfil_nome
     FROM users u
     LEFT JOIN access_profiles p ON p.id = u.profile_id
     WHERE u.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

async function listAllWithProfile() {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.role, u.active, u.profile_id, p.name AS perfil_nome
     FROM users u
     LEFT JOIN access_profiles p ON p.id = u.profile_id
     ORDER BY u.name`,
    [],
  );
  return result.rows;
}

async function existsByEmail(email) {
  const result = await query('SELECT id FROM users WHERE email = $1', [email]);
  return result.rowCount > 0;
}

async function createUser({ nome, email, passwordHash, perfilId, cargo, ativo }) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, profile_id, role, active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, active, profile_id`,
    [nome, email, passwordHash, perfilId || null, cargo || 'funcionario', ativo ?? true],
  );
  return result.rows[0];
}

async function updateUser({ id, nome, email, passwordHash, perfilId, cargo, ativo }) {
  const result = await query(
    `UPDATE users
     SET name = $1,
         email = $2,
         password_hash = $3,
         profile_id = $4,
         role = $5,
         active = $6,
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, name, email, role, active, profile_id`,
    [nome, email, passwordHash, perfilId || null, cargo || 'funcionario', ativo ?? true, id],
  );
  return result.rows[0] || null;
}

async function deleteById(id) {
  const result = await query('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount > 0;
}

async function findPasswordHashById(id) {
  const result = await query('SELECT id, password_hash FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function updatePasswordHash(id, passwordHash) {
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    passwordHash,
    id,
  ]);
}

module.exports = {
  findByEmail,
  findActiveByEmail,
  findById,
  listAllWithProfile,
  existsByEmail,
  createUser,
  updateUser,
  deleteById,
  findPasswordHashById,
  updatePasswordHash,
};

