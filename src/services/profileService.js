const profileRepository = require('../repositories/profileRepository');

class ProfileError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function listProfiles() {
  return profileRepository.listAll();
}

async function createProfile({ name, description, permissions }) {
  return profileRepository.createProfile({ name, description, permissions });
}

async function updateProfile(id, { name, description, permissions }) {
  const updated = await profileRepository.updateProfile(id, { name, description, permissions });
  if (!updated) {
    throw new ProfileError('Perfil não encontrado.', 404);
  }
  return updated;
}

async function deleteProfile(id) {
  const deleted = await profileRepository.deleteProfile(id);
  if (!deleted) {
    throw new ProfileError('Perfil não encontrado.', 404);
  }
}

module.exports = {
  ProfileError,
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
};

