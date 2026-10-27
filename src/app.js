require("dotenv").config();
const express = require("express");
const prisma = require("./prisma");

const app = express();
app.use(express.json());

// Health check: não toca no banco. Será usado pela AWS para saber se a API está viva.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar usuários." });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body ?? {};

  if (!name || !email) {
    return res.status(422).json({ error: "name e email são obrigatórios." });
  }

  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (e) {
    // P2002 = violação de unique (e-mail repetido)
    if (e.code === "P2002") {
      return res.status(422).json({ error: "Este e-mail já está cadastrado." });
    }
    console.error(e);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});