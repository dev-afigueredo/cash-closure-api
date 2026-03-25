const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

class UserError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function listUsers() {
  return userRepository.listAllWithProfile();
}

async function getUserById(id) {
  const usuario = await userRepository.findById(id);
  if (!usuario) {
    throw new UserError('Usuário não encontrado.', 404);
  }
  return usuario;
}

async function createUser({ nome, username, email, senha, perfilId, cargo, ativo }) {
  const exists = await userRepository.existsByEmail(email);
  if (exists) {
    throw new UserError('Este e-mail já está cadastrado.', 400);
  }

  if (username) {
    const userExists = await userRepository.existsByUsername(username);
    if (userExists) {
      throw new UserError('Este nome de usuário já está cadastrado.', 400);
    }
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(senha, salt);

  return userRepository.createUser({
    nome,
    username,
    email,
    passwordHash,
    perfilId,
    cargo,
    ativo,
  });
}

async function updateUser(id, { nome, username, email, senha, perfilId, cargo, ativo }) {
  const existing = await userRepository.findPasswordHashById(id);
  if (!existing) {
    throw new UserError('Usuário não encontrado.', 404);
  }

  let passwordHash = existing.password_hash;
  if (senha) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(senha, salt);
  }

  const updated = await userRepository.updateUser({
    id,
    nome,
    username,
    email,
    passwordHash,
    perfilId,
    cargo,
    ativo,
  });

  return updated;
}

async function deleteUser(id) {
  const deleted = await userRepository.deleteById(id);
  if (!deleted) {
    throw new UserError('Usuário não encontrado.', 404);
  }
}

module.exports = {
  UserError,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

