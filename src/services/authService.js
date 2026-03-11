const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const passwordResetTokenRepository = require('../repositories/passwordResetTokenRepository');
const { generateToken } = require('./jwtService');
const { sendPasswordResetEmail } = require('./emailService');

class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function login({ email, senha }) {
  const usuario = await userRepository.findActiveByEmail(email);
  if (!usuario) {
    throw new AuthError('E-mail ou senha incorretos.', 400);
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.password_hash);
  if (!senhaCorreta) {
    throw new AuthError('E-mail ou senha incorretos.', 400);
  }

  const token = generateToken({ id: usuario.id, role: usuario.role, profileId: usuario.profile_id });

  return {
    token,
    usuario: {
      nome: usuario.name,
      email: usuario.email,
      cargo: usuario.role,
    },
  };
}

async function getAuthenticatedUser(userId) {
  const usuario = await userRepository.findById(userId);
  if (!usuario) {
    throw new AuthError('Usuário não encontrado.', 404);
  }
  return usuario;
}

async function forgotPassword({ email, originHeader }) {
  const usuario = await userRepository.findActiveByEmail(email);
  if (!usuario) {
    // Não revela se o e-mail existe ou não
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await passwordResetTokenRepository.createToken(usuario.id, token, expiresAt);

  const resetUrl = `${originHeader || 'http://localhost:5500'}/src/trocar_senha.html?token=${token}`;

  await sendPasswordResetEmail({
    to: email,
    name: usuario.name,
    resetUrl,
  });
}

async function resetPassword({ token, novaSenha }) {
  const now = new Date();
  const tokenRow = await passwordResetTokenRepository.findValidToken(token, now);
  if (!tokenRow) {
    throw new AuthError('Token inválido ou expirado.', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(novaSenha, salt);

  await userRepository.updatePasswordHash(tokenRow.user_id, passwordHash);
  await passwordResetTokenRepository.markAsUsed(tokenRow.id);
}

module.exports = {
  AuthError,
  login,
  getAuthenticatedUser,
  forgotPassword,
  resetPassword,
};

