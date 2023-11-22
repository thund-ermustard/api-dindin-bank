const express = require("express");
const route = require("./routes");
const app = express();

app.use(express.json());

app.use(route);

app.listen(3000, () => {
  console.log("Iniciado pt 3000");
});
