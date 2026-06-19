const mockUserRepository = {
  findActiveByUsername: jest.fn(),
  findById: jest.fn(),
  findActiveByEmail: jest.fn(),
  updatePasswordHash: jest.fn(),
};

const mockPasswordResetTokenRepository = {
  createToken: jest.fn(),
  findValidToken: jest.fn(),
  markAsUsed: jest.fn(),
};

const mockJwtService = {
  generateToken: jest.fn(),
};

const mockEmailService = {
  sendPasswordResetEmail: jest.fn(),
};

const mockBcrypt = {
  compare: jest.fn(),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('new_hashed_password'),
};

const mockCrypto = {
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked_random_token'),
  }),
};

// Apply mocks before importing
jest.mock('../../src/repositories/userRepository', () => mockUserRepository);
jest.mock('../../src/repositories/passwordResetTokenRepository', () => mockPasswordResetTokenRepository);
jest.mock('../../src/services/jwtService', () => mockJwtService);
jest.mock('../../src/services/emailService', () => mockEmailService);
jest.mock('bcryptjs', () => mockBcrypt);
jest.mock('crypto', () => mockCrypto);

const {
  AuthError,
  login,
  getAuthenticatedUser,
  forgotPassword,
  resetPassword,
} = require('../../src/services/authService');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const credentials = { username: 'testuser', senha: 'password123' };
    const mockUser = {
      id: 1,
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      role: 'admin',
      profile_id: 2,
    };

    it('should login successfully with correct credentials', async () => {
      mockUserRepository.findActiveByUsername.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwtService.generateToken.mockReturnValue('mocked_jwt_token');

      const result = await login(credentials);

      expect(mockUserRepository.findActiveByUsername).toHaveBeenCalledWith(credentials.username);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(credentials.senha, mockUser.password_hash);
      expect(mockJwtService.generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        role: mockUser.role,
        profileId: mockUser.profile_id,
      });
      expect(result).toEqual({
        token: 'mocked_jwt_token',
        usuario: {
          nome: mockUser.name,
          username: mockUser.username,
          email: mockUser.email,
          cargo: mockUser.role,
        },
      });
    });

    it('should throw AuthError if user is not found', async () => {
      mockUserRepository.findActiveByUsername.mockResolvedValue(null);

      await expect(login(credentials)).rejects.toThrow(AuthError);
      await expect(login(credentials)).rejects.toThrow('Usuário ou senha incorretos.');
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw AuthError if password is incorrect', async () => {
      mockUserRepository.findActiveByUsername.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(login(credentials)).rejects.toThrow(AuthError);
      await expect(login(credentials)).rejects.toThrow('Usuário ou senha incorretos.');
      expect(mockBcrypt.compare).toHaveBeenCalledWith(credentials.senha, mockUser.password_hash);
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return user details if user exists', async () => {
      const mockUser = { id: 1, name: 'Test User' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await getAuthenticatedUser(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw AuthError if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(getAuthenticatedUser(999)).rejects.toThrow(AuthError);
      await expect(getAuthenticatedUser(999)).rejects.toThrow('Usuário não encontrado.');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';
    const mockUser = { id: 1, name: 'Test User', email };

    it('should create token and send email if active user with email exists', async () => {
      mockUserRepository.findActiveByEmail.mockResolvedValue(mockUser);
      mockPasswordResetTokenRepository.createToken.mockResolvedValue();
      mockEmailService.sendPasswordResetEmail.mockResolvedValue();

      await forgotPassword({ email, originHeader: 'http://my-domain.com' });

      expect(mockUserRepository.findActiveByEmail).toHaveBeenCalledWith(email);
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockPasswordResetTokenRepository.createToken).toHaveBeenCalledWith(
        mockUser.id,
        'mocked_random_token',
        expect.any(Date),
      );
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith({
        to: email,
        name: mockUser.name,
        resetUrl: 'http://my-domain.com/src/trocar_senha.html?token=mocked_random_token',
      });
    });

    it('should default origin header to localhost if not provided', async () => {
      mockUserRepository.findActiveByEmail.mockResolvedValue(mockUser);

      await forgotPassword({ email });

      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          resetUrl: 'http://localhost:5500/src/trocar_senha.html?token=mocked_random_token',
        }),
      );
    });

    it('should return early and not send email if user does not exist', async () => {
      mockUserRepository.findActiveByEmail.mockResolvedValue(null);

      await forgotPassword({ email });

      expect(mockUserRepository.findActiveByEmail).toHaveBeenCalledWith(email);
      expect(mockPasswordResetTokenRepository.createToken).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const input = { token: 'mocked_random_token', novaSenha: 'new_password123' };
    const mockTokenRow = { id: 10, user_id: 1 };

    it('should reset password hash and mark token as used if token is valid', async () => {
      mockPasswordResetTokenRepository.findValidToken.mockResolvedValue(mockTokenRow);
      mockUserRepository.updatePasswordHash.mockResolvedValue();
      mockPasswordResetTokenRepository.markAsUsed.mockResolvedValue();

      await resetPassword(input);

      expect(mockPasswordResetTokenRepository.findValidToken).toHaveBeenCalledWith(input.token, expect.any(Date));
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(input.novaSenha, 'salt');
      expect(mockUserRepository.updatePasswordHash).toHaveBeenCalledWith(mockTokenRow.user_id, 'new_hashed_password');
      expect(mockPasswordResetTokenRepository.markAsUsed).toHaveBeenCalledWith(mockTokenRow.id);
    });

    it('should throw AuthError if token is invalid or expired', async () => {
      mockPasswordResetTokenRepository.findValidToken.mockResolvedValue(null);

      await expect(resetPassword(input)).rejects.toThrow(AuthError);
      await expect(resetPassword(input)).rejects.toThrow('Token inválido ou expirado.');
      expect(mockUserRepository.updatePasswordHash).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.markAsUsed).not.toHaveBeenCalled();
    });
  });
});
