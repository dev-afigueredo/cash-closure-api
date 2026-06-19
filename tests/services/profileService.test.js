const mockProfileRepository = {
  listAll: jest.fn(),
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  deleteProfile: jest.fn(),
};

jest.mock('../../src/repositories/profileRepository', () => mockProfileRepository);

const {
  ProfileError,
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} = require('../../src/services/profileService');

describe('profileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listProfiles', () => {
    it('should return a list of profiles', async () => {
      const mockProfiles = [{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }];
      mockProfileRepository.listAll.mockResolvedValue(mockProfiles);

      const result = await listProfiles();
      expect(result).toEqual(mockProfiles);
      expect(mockProfileRepository.listAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('createProfile', () => {
    it('should create and return a profile', async () => {
      const input = { name: 'Manager', description: 'Store manager', permissions: { read: true } };
      const expectedOutput = { id: 3, ...input };
      mockProfileRepository.createProfile.mockResolvedValue(expectedOutput);

      const result = await createProfile(input);
      expect(result).toEqual(expectedOutput);
      expect(mockProfileRepository.createProfile).toHaveBeenCalledWith(input);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the updated profile if it exists', async () => {
      const id = 3;
      const input = { name: 'Manager Updated', description: 'Updated desc', permissions: { write: true } };
      const expectedOutput = { id, ...input };
      mockProfileRepository.updateProfile.mockResolvedValue(expectedOutput);

      const result = await updateProfile(id, input);
      expect(result).toEqual(expectedOutput);
      expect(mockProfileRepository.updateProfile).toHaveBeenCalledWith(id, input);
    });

    it('should throw ProfileError if profile does not exist', async () => {
      const id = 999;
      const input = { name: 'Not Found', description: 'N/A', permissions: {} };
      mockProfileRepository.updateProfile.mockResolvedValue(null);

      await expect(updateProfile(id, input)).rejects.toThrow(ProfileError);
      await expect(updateProfile(id, input)).rejects.toThrow('Perfil não encontrado.');
      expect(mockProfileRepository.updateProfile).toHaveBeenCalledWith(id, input);
    });
  });

  describe('deleteProfile', () => {
    it('should successfully call deleteProfile if profile exists', async () => {
      const id = 3;
      mockProfileRepository.deleteProfile.mockResolvedValue(true);

      await expect(deleteProfile(id)).resolves.not.toThrow();
      expect(mockProfileRepository.deleteProfile).toHaveBeenCalledWith(id);
    });

    it('should throw ProfileError if profile does not exist on delete', async () => {
      const id = 999;
      mockProfileRepository.deleteProfile.mockResolvedValue(false);

      await expect(deleteProfile(id)).rejects.toThrow(ProfileError);
      await expect(deleteProfile(id)).rejects.toThrow('Perfil não encontrado.');
      expect(mockProfileRepository.deleteProfile).toHaveBeenCalledWith(id);
    });
  });
});
