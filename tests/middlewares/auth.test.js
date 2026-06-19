const mockJwtService = {
  verifyToken: jest.fn(),
};

jest.mock('../../src/services/jwtService', () => mockJwtService);

const { authMiddleware } = require('../../src/middlewares/auth');

describe('authMiddleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should call next() if a valid Bearer token is provided', () => {
    req.headers.authorization = 'Bearer valid_token_123';
    const mockDecoded = { id: 1, role: 'admin' };
    mockJwtService.verifyToken.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(mockJwtService.verifyToken).toHaveBeenCalledWith('valid_token_123');
    expect(req.user).toEqual(mockDecoded);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is missing', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header does not start with Bearer', () => {
    req.headers.authorization = 'Basic basic_token';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if verifyToken throws an error (invalid token)', () => {
    req.headers.authorization = 'Bearer invalid_token';
    mockJwtService.verifyToken.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    authMiddleware(req, res, next);

    expect(mockJwtService.verifyToken).toHaveBeenCalledWith('invalid_token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Token inválido ou expirado.' });
    expect(next).not.toHaveBeenCalled();
  });
});
