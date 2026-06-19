const mockCashRepository = {
  createTransaction: jest.fn(),
  getCurrentBalance: jest.fn(),
  createClosure: jest.fn(),
  listClosures: jest.fn(),
  getClosureById: jest.fn(),
};

jest.mock('../../src/repositories/cashRepository', () => mockCashRepository);

const {
  CashError,
  registerTransaction,
  getBalance,
  saveClosure,
  listClosures,
  getClosureById,
} = require('../../src/services/cashService');

describe('cashService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerTransaction', () => {
    const input = {
      userId: 1,
      tipo: 'entrada',
      descricao: 'Venda de bolo',
      valor: 50.00,
    };

    it('should successfully register an entrada transaction', async () => {
      const mockResult = { id: 101, ...input };
      mockCashRepository.createTransaction.mockResolvedValue(mockResult);

      const result = await registerTransaction(input);

      expect(mockCashRepository.createTransaction).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResult);
    });

    it('should successfully register a saida transaction', async () => {
      const inputSaida = { ...input, tipo: 'saida' };
      const mockResult = { id: 102, ...inputSaida };
      mockCashRepository.createTransaction.mockResolvedValue(mockResult);

      const result = await registerTransaction(inputSaida);

      expect(mockCashRepository.createTransaction).toHaveBeenCalledWith(inputSaida);
      expect(result).toEqual(mockResult);
    });

    it('should throw CashError for invalid transaction type', async () => {
      const invalidInput = { ...input, tipo: 'invalid_type' };

      await expect(registerTransaction(invalidInput)).rejects.toThrow(CashError);
      await expect(registerTransaction(invalidInput)).rejects.toThrow('Tipo inválido. Use entrada ou saida.');
      expect(mockCashRepository.createTransaction).not.toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should return the balance wrapped in an object', async () => {
      mockCashRepository.getCurrentBalance.mockResolvedValue(150.50);

      const result = await getBalance();

      expect(mockCashRepository.getCurrentBalance).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ saldo: 150.50 });
    });
  });

  describe('saveClosure', () => {
    const input = {
      userId: 1,
      operador: 'John Doe',
      valorInicial: 100.00,
      totalContado: 250.00,
      totalSangrias: 50.00,
      valorLiquido: 200.00,
      observacoes: 'Tudo OK',
      detalhamento: { notas: 10 },
    };

    it('should delegate saving the closure to the repository', async () => {
      const mockResult = { id: 201, ...input, status: 'fechado' };
      mockCashRepository.createClosure.mockResolvedValue(mockResult);

      const result = await saveClosure(input);

      expect(mockCashRepository.createClosure).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResult);
    });
  });

  describe('listClosures', () => {
    it('should call repository listClosures with filters', async () => {
      const filters = { inicio: '2026-06-01', fim: '2026-06-18' };
      const mockResult = [{ id: 1, operator_name: 'John' }];
      mockCashRepository.listClosures.mockResolvedValue(mockResult);

      const result = await listClosures(filters);

      expect(mockCashRepository.listClosures).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getClosureById', () => {
    it('should return a closure by id', async () => {
      const mockResult = { id: 1, operator_name: 'John' };
      mockCashRepository.getClosureById.mockResolvedValue(mockResult);

      const result = await getClosureById(1);

      expect(mockCashRepository.getClosureById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });
});
