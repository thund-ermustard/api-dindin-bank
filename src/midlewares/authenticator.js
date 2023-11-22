const jwt = require("jsonwebtoken");
const senhaJwt = require("../security/passJwt");
const pool = require("../connection");

const verificarUsuarioLogado = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ mensagem: "Não autorizado" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = jwt.verify(token, senhaJwt);

    const { rows, rowsCount } = await pool.query(
      "select * from usuarios where id = $1",
      [id]
    );

    if (rowsCount < 1) {
      return res.status(401).json({ mensagem: "Não autorizado" });
    }

    const { senha, ...usuario } = rows[0];
    req.usuario = usuario;

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Não autorizado" });
  }
};

module.exports = verificarUsuarioLogado;
