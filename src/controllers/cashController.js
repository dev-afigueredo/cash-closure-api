const cashService = require('../services/cashService');

async function registerTransaction(req, res) {
  try {
    const { tipo, descricao, valor } = req.body;
    const transaction = await cashService.registerTransaction({
      userId: req.user.id,
      tipo,
      descricao,
      valor,
    });
    return res.status(201).json(transaction);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || 'Erro ao registrar movimentação.' });
  }
}

async function getBalance(req, res) {
  try {
    const result = await cashService.getBalance();
    return res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ mensagem: 'Erro ao obter saldo', erro: error.message });
  }
}

async function saveClosure(req, res) {
  try {
    const {
      operador,
      valorInicial,
      totalContado,
      totalSangrias,
      valorLiquido,
      observacoes,
    } = req.body;

    const closure = await cashService.saveClosure({
      userId: req.user.id,
      operador,
      valorInicial,
      totalContado,
      totalSangrias,
      valorLiquido,
      observacoes,
    });

    return res.status(201).json({
      mensagem: '✅ Fechamento salvo com sucesso!',
      dados: closure,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    return res.status(status).json({ mensagem: error.message || '❌ Erro ao salvar fechamento.' });
  }
}

async function listClosures(req, res) {
  try {
    const { inicio, fim } = req.query;
    const closures = await cashService.listClosures({ inicio, fim });
    return res.json(closures);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res
      .status(500)
      .json({ mensagem: 'Erro ao buscar relatórios de fechamento', erro: error.message });
  }
}

module.exports = {
  registerTransaction,
  getBalance,
  saveClosure,
  listClosures,
};

