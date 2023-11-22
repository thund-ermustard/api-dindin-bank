const pool = require("../connection");
const jwt = require("jsonwebtoken");
const senhaJwt = require("../security/passJwt");

// listar transações do usuário logado

const detalhar = async (req, res) => {
  const { id } = req.params;
  const { id: tokenId } = req.usuario;

  try {
    const query = `
        select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, 
        t.categoria_id, c.descricao as categoria_nome from transacoes t 
        join categorias c on t.categoria_id = c.id where t.id = $1;
    `;
    const resultado = await pool.query(query, [id]);

    const filtroId = resultado.rows.find((transacao) => {
      return transacao.usuario_id === tokenId;
    });

    if (!filtroId) {
      return res.status(404).json({
        mensasgem:
          "Transação não encontrada ou não pertence ao usuário logado.",
      });
    }

    return res.status(200).json(filtroId);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

//cadastrar transação para o usuário logado

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const { id: idToken } = req.usuario;

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res.status(400).json({
      mensagem: "Todos os campos são obrigatórios devem ser informados.",
    });
  }

  try {
    const queryTransacao = `
        select * from transacoes where id = $1;
    `;
    const queryCategoria = `
        select * from categorias;
    `;
    const queryAtualizar = `
        update transacoes set descricao = $1, valor = $2, categoria_id = $3, tipo = $4 where id = $5
    `;
    const { rows: rowsTransacao } = await pool.query(queryTransacao, [id]);

    const findTransacao = rowsTransacao.find((transacao) => {
      return transacao.usuario_id === Number(idToken);
    });

    if (
      !findTransacao ||
      findTransacao.id != id ||
      findTransacao === undefined
    ) {
      return res.status(404).json({
        mensagem: "Transação não encontrada ou não pertence ao usuário logado.",
      });
    }

    const { rows: rowsCategoria } = await pool.query(queryCategoria);
    const findCategoria = rowsCategoria.find((categoria) => {
      return categoria.id === Number(id);
    });

    if (!findCategoria) {
      return res.status(404).json({ mensagem: "Categoria não localizada." });
    }

    const { rows: rowsAtualizar } = await pool.query(queryAtualizar, [
      descricao,
      valor,
      categoria_id,
      tipo,
      id,
    ]);
    return res.status(201).send();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

// excluir trqansacão do usuário logado

const extrato = async (req, res) => {
  const { id: idToken } = req.usuario;

  try {
    const query = `
        select * from transacoes where usuario_id = $1;
    `;
    const { rows, rowCount } = await pool.query(query, [idToken]);

    if (rowCount < 1) {
      return res
        .status(404)
        .json({ mensagem: "Não foi encontrado nenhuma transacão." });
    }

    let entradaLista = [];
    let saidaLista = [];

    for (i = 0; i < rowCount; i++) {
      if (rows[i].tipo === "entrada") {
        entradaLista.push(rows[i].valor);
      }
      if (rows[i].tipo === "saida") {
        saidaLista.push(rows[i].valor);
      }
    }
    let entradaSoma = 0;
    let saidaSoma = 0;

    for (i = 0; i < entradaLista.length; i++) {
      entradaSoma += entradaLista[i];
    }
    for (i = 0; i < saidaLista.length; i++) {
      saidaSoma += saidaLista[i];
    }
    const extratoDetalhar = {
      entrada: entradaSoma,
      saida: saidaSoma,
    };
    return res.status(200).json(extratoDetalhar);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = {
  detalhar,
  atualizar,
  extrato,
};
