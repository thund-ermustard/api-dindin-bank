const pool = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const senhaJwt = require("../security/passJwt");

const cadastrar = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha)
    return res
      .status(400)
      .json({ messagem: "Todos os campos são obrigatórios!" });

  try {
    const queryChecarUsuario = `
        select * from usuarios where email = $1;
    `;
    const checarUsuario = await pool.query(queryChecarUsuario, [email]);

    if (checarUsuario.rowCount > 0) {
      return res.status(400).json({ mensagem: "Email já está cadastrado!" });
    }

    const query = `
        insert into usuarios (nome, email, senha)
        values
        ($1, $2, $3)
        RETURNING *
    `;

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const novoUsuario = await pool.query(query, [
      nome,
      email,
      senhaCriptografada,
    ]);

    const { senha: _, ...usuario } = novoUsuario.rows[0];

    return res.status(201).json(usuario);
  } catch (error) {
    return res.status(500).json("Erro interno do servidor");
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );
    if (usuario.rowCount < 1) {
      return res
        .status(404)
        .json({ mensagem: "Usuário e/ou senha inválido(s)" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);

    if (!senhaValida) {
      return res
        .status(400)
        .json({ mensagem: "Usuário e/ou senha inválido(s)" });
    }

    const token = jwt.sign({ id: usuario.rows[0].id }, senhaJwt, {
      expiresIn: "6h",
    });

    const { senha: _, ...usuarioLogado } = usuario.rows[0];

    return res.json({ usuario: usuarioLogado, token });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const detalhar = async (req, res) => {
  const { id: tokenId } = req.usuario;

  try {
    const query = `
        select * from usuarios where id = $1
    `;

    const { rows, rowCount } = await pool.query(query, [tokenId]);

    if (rowCount < 1) {
      return res.status(401).json({
        mensagem:
          "Para acessar este recurso um token de autenticação válido deve ser enviado.",
      });
    }
    const { senha: _, ...usuario } = rows[0];
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  cadastrar,
  login,
  detalhar,
};
