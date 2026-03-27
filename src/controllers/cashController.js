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
      detalhamento,
    } = req.body;

    const closure = await cashService.saveClosure({
      userId: req.user.id,
      operador,
      valorInicial,
      totalContado,
      totalSangrias,
      valorLiquido,
      observacoes,
      detalhamento,
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

async function registerSangria(req, res) {
  try {
    const { valor, observacoes } = req.body;
    if (!valor || isNaN(valor) || valor <= 0) {
      return res.status(400).json({ mensagem: 'Valor inválido para sangria.' });
    }
    const transaction = await cashService.registerTransaction({
      userId: req.user.id,
      tipo: 'saida',
      descricao: observacoes || 'Sangria',
      valor,
    });
    return res.status(201).json({ mensagem: 'Sangria registrada com sucesso', dados: transaction });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ mensagem: error.message || 'Erro ao registrar sangria.' });
  }
}

async function adjustBalance(req, res) {
  try {
    const { saldoInformado, motivo } = req.body;
    if (saldoInformado === undefined || isNaN(saldoInformado) || saldoInformado < 0) {
      return res.status(400).json({ mensagem: 'Saldo informado inválido.' });
    }
    if (!motivo) {
      return res.status(400).json({ mensagem: 'Motivo é obrigatório para ajuste de saldo.' });
    }

    const { saldo: saldoAtual } = await cashService.getBalance();
    const diferenca = Number(saldoInformado) - Number(saldoAtual);

    if (diferenca === 0) {
      return res.status(400).json({ mensagem: 'O saldo atual já é igual ao saldo informado.' });
    }

    const tipo = diferenca > 0 ? 'entrada' : 'saida';
    const transaction = await cashService.registerTransaction({
      userId: req.user.id,
      tipo,
      descricao: `Ajuste de sistema: ${motivo}`,
      valor: Math.abs(diferenca),
    });

    const novoSaldo = await cashService.getBalance();

    return res.status(201).json({
      mensagem: 'Ajuste de saldo realizado com sucesso.',
      transacao: transaction,
      saldoAnterior: saldoAtual,
      saldoNovo: novoSaldo.saldo,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ mensagem: error.message || 'Erro ao ajustar saldo.' });
  }
}

async function getClosure(req, res) {
  try {
    const { id } = req.params;
    const closure = await cashService.getClosureById(id);
    if (!closure) {
      return res.status(404).json({ mensagem: 'Fechamento não encontrado.' });
    }
    return res.json(closure);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar fechamento', erro: error.message });
  }
}

module.exports = {
  registerTransaction,
  getBalance,
  saveClosure,
  listClosures,
  registerSangria,
  adjustBalance,
  getClosure,
};

