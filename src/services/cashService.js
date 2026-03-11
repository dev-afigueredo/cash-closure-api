const cashRepository = require('../repositories/cashRepository');

class CashError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function registerTransaction({ userId, tipo, descricao, valor }) {
  if (!['entrada', 'saida'].includes(tipo)) {
    throw new CashError('Tipo inválido. Use entrada ou saida.', 400);
  }
  return cashRepository.createTransaction({ userId, tipo, descricao, valor });
}

async function getBalance() {
  const saldo = await cashRepository.getCurrentBalance();
  return { saldo };
}

async function saveClosure({ userId, operador, valorInicial, totalContado, totalSangrias, valorLiquido, observacoes }) {
  const closure = await cashRepository.createClosure({
    userId,
    operador,
    valorInicial,
    totalContado,
    totalSangrias,
    valorLiquido,
    observacoes,
  });
  return closure;
}

async function listClosures({ inicio, fim }) {
  return cashRepository.listClosures({ inicio, fim });
}

module.exports = {
  CashError,
  registerTransaction,
  getBalance,
  saveClosure,
  listClosures,
};

