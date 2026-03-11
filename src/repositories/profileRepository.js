const { query } = require('../db');

async function listAll() {
  const result = await query(
    'SELECT id, name, description, permissions, created_at, updated_at FROM access_profiles ORDER BY name',
    [],
  );
  return result.rows;
}

async function createProfile({ name, description, permissions }) {
  const result = await query(
    `INSERT INTO access_profiles (name, description, permissions)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, permissions`,
    [name, description || null, permissions || {}],
  );
  return result.rows[0];
}

async function updateProfile(id, { name, description, permissions }) {
  const result = await query(
    `UPDATE access_profiles
     SET name = $1,
         description = $2,
         permissions = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, description, permissions`,
    [name, description || null, permissions || {}, id],
  );
  return result.rows[0] || null;
}

async function deleteProfile(id) {
  const result = await query('DELETE FROM access_profiles WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  listAll,
  createProfile,
  updateProfile,
  deleteProfile,
};

