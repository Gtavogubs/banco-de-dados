const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

connection.connect(err => {
    if (err) {
        console.error("Erro ao conectar no MySQL:", err);
        return;
    }
    console.log("✅ MySQL conectado!");

    const createTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL
        )`;

    connection.query(createTable, err => {
        if (err) console.error(err);
        else console.log("✅ Tabela usuarios pronta!");
    });
});

app.post("/usuarios", (req, res) => {
    const { nome, email, senha } = req.body;

    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    connection.query(sql, [nome, email, senha], err => {
        if (err) {
            return res.status(400).json({ message: "E-mail já cadastrado" });
        }
        res.json({ message: "Conta criada com sucesso!" });
    });
});

app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    const sql = "SELECT id, nome, email FROM usuarios WHERE email = ? AND senha = ?";
    connection.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0) {
            return res.status(401).json({ message: "E-mail ou senha inválidos" });
        }

        res.json({ user: results[0] });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
