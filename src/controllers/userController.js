const userService = require('../services/userService');

async function listUsers(req, res) {
  try {
    const usuarios = await userService.listUsers();
    return res.json(usuarios);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ mensagem: 'Erro ao listar usuários', erro: error.message });
  }
}

async function getUser(req, res) {
  try {
    const { id } = req.params;
    const usuario = await userService.getUserById(id);
    return res.json(usuario);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao obter usuário.' });
  }
}

async function createUser(req, res) {
  try {
    const { nome, username, email, senha, perfilId, cargo, ativo } = req.body;
    const usuario = await userService.createUser({ nome, username, email, senha, perfilId, cargo, ativo });
    return res.status(201).json(usuario);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao criar usuário.' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nome, username, email, senha, perfilId, cargo, ativo } = req.body;
    const usuario = await userService.updateUser(id, { nome, username, email, senha, perfilId, cargo, ativo });
    return res.json(usuario);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao atualizar usuário.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    return res.status(204).send();
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao excluir usuário.' });
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};

