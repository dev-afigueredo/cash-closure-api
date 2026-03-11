const profileService = require('../services/profileService');

async function listProfiles(req, res) {
  try {
    const perfis = await profileService.listProfiles();
    return res.json(perfis);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ mensagem: 'Erro ao listar perfis', erro: error.message });
  }
}

async function createProfile(req, res) {
  try {
    const { name, description, permissions } = req.body;
    const perfil = await profileService.createProfile({ name, description, permissions });
    return res.status(201).json(perfil);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao criar perfil.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    const perfil = await profileService.updateProfile(id, { name, description, permissions });
    return res.json(perfil);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao atualizar perfil.' });
  }
}

async function deleteProfile(req, res) {
  try {
    const { id } = req.params;
    await profileService.deleteProfile(id);
    return res.status(204).send();
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao excluir perfil.' });
  }
}

module.exports = {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
};

