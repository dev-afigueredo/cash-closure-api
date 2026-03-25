const authService = require('../services/authService');

async function login(req, res) {
  try {
    const { username, senha } = req.body;
    const result = await authService.login({ username, senha });
    return res.json({
      mensagem: '✅ Login realizado!',
      token: result.token,
      usuario: result.usuario,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao realizar login.' });
  }
}

async function me(req, res) {
  try {
    const usuario = await authService.getAuthenticatedUser(req.user.id);
    return res.json(usuario);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao obter usuário logado.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    await authService.forgotPassword({ email, originHeader: req.headers.origin });
    return res.json({
      mensagem: 'Se o e-mail existir, uma mensagem foi enviada com instruções.',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ mensagem: 'Erro ao processar esqueci senha', erro: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, novaSenha } = req.body;
    await authService.resetPassword({ token, novaSenha });
    return res.json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao redefinir senha.' });
  }
}

module.exports = {
  login,
  me,
  forgotPassword,
  resetPassword,
};

