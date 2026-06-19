const { generateToken, verifyToken } = require('../../src/services/jwtService');
const jwt = require('jsonwebtoken');

describe('jwtService', () => {
  const payload = { id: 1, role: 'admin', profileId: 2 };

  describe('generateToken', () => {
    it('should generate a valid JWT token with payload', () => {
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token);
      expect(decoded).toMatchObject(payload);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return decoded payload', () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded).toMatchObject(payload);
    });

    it('should throw an error for an invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('should throw an error for an expired token', () => {
      // Temporarily mock JWT_EXPIRES_IN or jwt.verify/jwt.sign behavior
      // A clean way is to generate a token with a short expiration if we can control env,
      // or simply mock jwt.verify for this specific sub-case or test with a past exp.
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET || 'senha_secreta_provisoria', { expiresIn: '0s' });
      expect(() => {
        verifyToken(expiredToken);
      }).toThrow();
    });
  });
});
