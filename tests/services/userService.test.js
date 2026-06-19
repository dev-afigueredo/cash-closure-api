const mockUserRepository = {
  listAllWithProfile: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUsername: jest.fn(),
  createUser: jest.fn(),
  findPasswordHashById: jest.fn(),
  updateUser: jest.fn(),
  deleteById: jest.fn(),
};

const mockBcrypt = {
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
};

jest.mock('../../src/repositories/userRepository', () => mockUserRepository);
jest.mock('bcryptjs', () => mockBcrypt);

const {
  UserError,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../../src/services/userService');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return all users with profile information', async () => {
      const mockUsers = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];
      mockUserRepository.listAllWithProfile.mockResolvedValue(mockUsers);

      const result = await listUsers();
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.listAllWithProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id if found', async () => {
      const mockUser = { id: 1, name: 'User 1' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await getUserById(1);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw UserError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(getUserById(999)).rejects.toThrow(UserError);
      await expect(getUserById(999)).rejects.toThrow('Usuário não encontrado.');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('createUser', () => {
    const input = {
      nome: 'John',
      username: 'john123',
      email: 'john@example.com',
      senha: 'password',
      perfilId: 2,
      cargo: 'admin',
      ativo: true,
    };

    it('should create a new user with hashed password', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.createUser.mockResolvedValue({ id: 10, ...input, passwordHash: 'hashed_password' });

      const result = await createUser(input);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(input.email);
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(input.username);
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password', 'salt');
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        nome: input.nome,
        username: input.username,
        email: input.email,
        passwordHash: 'hashed_password',
        perfilId: input.perfilId,
        cargo: input.cargo,
        ativo: input.ativo,
      });
      expect(result).toBeDefined();
    });

    it('should throw UserError if email already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(createUser(input)).rejects.toThrow(UserError);
      await expect(createUser(input)).rejects.toThrow('Este e-mail já está cadastrado.');
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw UserError if username already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      await expect(createUser(input)).rejects.toThrow(UserError);
      await expect(createUser(input)).rejects.toThrow('Este nome de usuário já está cadastrado.');
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const id = 5;
    const input = {
      nome: 'Jane Updated',
      username: 'jane_updated',
      email: 'jane@example.com',
      senha: 'new_password',
      perfilId: 1,
      cargo: 'manager',
      ativo: true,
    };

    it('should update user and hash the new password if password is provided', async () => {
      mockUserRepository.findPasswordHashById.mockResolvedValue({ id, password_hash: 'old_hash' });
      mockUserRepository.updateUser.mockResolvedValue({ id, ...input, passwordHash: 'hashed_password' });

      const result = await updateUser(id, input);

      expect(mockUserRepository.findPasswordHashById).toHaveBeenCalledWith(id);
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('new_password', 'salt');
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith({
        id,
        nome: input.nome,
        username: input.username,
        email: input.email,
        passwordHash: 'hashed_password',
        perfilId: input.perfilId,
        cargo: input.cargo,
        ativo: input.ativo,
      });
      expect(result).toBeDefined();
    });

    it('should update user using existing hash if no new password is provided', async () => {
      mockUserRepository.findPasswordHashById.mockResolvedValue({ id, password_hash: 'old_hash' });
      mockUserRepository.updateUser.mockResolvedValue({ id, ...input, senha: null, passwordHash: 'old_hash' });

      const inputWithoutPassword = { ...input, senha: null };
      await updateUser(id, inputWithoutPassword);

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith({
        id,
        nome: input.nome,
        username: input.username,
        email: input.email,
        passwordHash: 'old_hash',
        perfilId: input.perfilId,
        cargo: input.cargo,
        ativo: input.ativo,
      });
    });

    it('should throw UserError if user not found on update', async () => {
      mockUserRepository.findPasswordHashById.mockResolvedValue(null);

      await expect(updateUser(id, input)).rejects.toThrow(UserError);
      await expect(updateUser(id, input)).rejects.toThrow('Usuário não encontrado.');
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete if user exists', async () => {
      const id = 5;
      mockUserRepository.deleteById.mockResolvedValue(true);

      await expect(deleteUser(id)).resolves.not.toThrow();
      expect(mockUserRepository.deleteById).toHaveBeenCalledWith(id);
    });

    it('should throw UserError if user not found on delete', async () => {
      const id = 999;
      mockUserRepository.deleteById.mockResolvedValue(false);

      await expect(deleteUser(id)).rejects.toThrow(UserError);
      await expect(deleteUser(id)).rejects.toThrow('Usuário não encontrado.');
      expect(mockUserRepository.deleteById).toHaveBeenCalledWith(id);
    });
  });
});
