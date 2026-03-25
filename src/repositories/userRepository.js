const { query } = require('../db');

async function findByEmail(email) {
  const result = await query(
    'SELECT id, name, username, email, password_hash, role, profile_id, active FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] || null;
}

async function findActiveByEmail(email) {
  const result = await query(
    'SELECT id, name, username, email, password_hash, role, profile_id FROM users WHERE email = $1 AND active = TRUE',
    [email],
  );
  return result.rows[0] || null;
}

async function findActiveByUsername(username) {
  const result = await query(
    'SELECT id, name, username, email, password_hash, role, profile_id FROM users WHERE username = $1 AND active = TRUE',
    [username],
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `SELECT u.id, u.name, u.username, u.email, u.role, u.profile_id, p.name AS perfil_nome
     FROM users u
     LEFT JOIN access_profiles p ON p.id = u.profile_id
     WHERE u.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

async function listAllWithProfile() {
  const result = await query(
    `SELECT u.id, u.name, u.username, u.email, u.role, u.active, u.profile_id, p.name AS perfil_nome
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

async function existsByUsername(username) {
  const result = await query('SELECT id FROM users WHERE username = $1', [username]);
  return result.rowCount > 0;
}

async function createUser({ nome, username, email, passwordHash, perfilId, cargo, ativo }) {
  const result = await query(
    `INSERT INTO users (name, username, email, password_hash, profile_id, role, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, username, email, role, active, profile_id`,
    [nome, username, email, passwordHash, perfilId || null, cargo || 'funcionario', ativo ?? true],
  );
  return result.rows[0];
}

async function updateUser({ id, nome, username, email, passwordHash, perfilId, cargo, ativo }) {
  const result = await query(
    `UPDATE users
     SET name = $1,
         username = $2,
         email = $3,
         password_hash = $4,
         profile_id = $5,
         role = $6,
         active = $7,
         updated_at = NOW()
     WHERE id = $8
     RETURNING id, name, username, email, role, active, profile_id`,
    [nome, username, email, passwordHash, perfilId || null, cargo || 'funcionario', ativo ?? true, id],
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
  findActiveByUsername,
  findById,
  listAllWithProfile,
  existsByEmail,
  existsByUsername,
  createUser,
  updateUser,
  deleteById,
  findPasswordHashById,
  updatePasswordHash,
};

