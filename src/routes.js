const express = require("express");
const usuarios = require("./controller/usuariosController");
const categorias = require("./controller/categoriasController");
const transacoes = require("./controller/transacoesController");
const verificarUsuarioLogado = require("./midlewares/authenticator");
const route = express();

route.post("/cadastro", usuarios.cadastrar);
route.post("/login", usuarios.login);

route.use(verificarUsuarioLogado);

route.get("/usuario", usuarios.detalhar);

route.get("/categoria", categorias.listar);

route.get("/transacao/extrato", transacoes.extrato);

route.get("/transacao/:id", transacoes.detalhar);

route.put("/transacao/:id", transacoes.atualizar);

module.exports = route;
