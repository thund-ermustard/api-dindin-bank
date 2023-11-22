const pool = require("../connection");

const listar = async (req, res) => {
  try {
    const query = `
            select * from categorias;
        `;
    const { rows } = await pool.query(query);

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json("Erro interno do servidor");
  }
};

module.exports = {
  listar,
};
