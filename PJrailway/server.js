const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔴 CONEXÃO SOMENTE VIA RAILWAY
const connection = mysql.createConnection(process.env.MYSQL_URL);

connection.connect((err) => {
    if (err) {
        console.error("Erro ao conectar no MySQL:", err);
        return;
    }
    console.log("✅ Conectado ao MySQL (Railway)");

    const createTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL
        )
    `;

    connection.query(createTable, (err) => {
        if (err) console.error(err);
        else console.log("✅ Tabela usuarios pronta");
    });
});

// --- CADASTRO ---
app.post("/usuarios", (req, res) => {
    const { nome, email, senha } = req.body;

    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    connection.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ message: "E-mail já cadastrado" });
            }
            return res.status(500).json({ message: "Erro no cadastro" });
        }

        res.json({ message: "Conta criada", user: { nome } });
    });
});

// --- LOGIN ---
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    const sql = "SELECT nome FROM usuarios WHERE email = ? AND senha = ?";
    connection.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro no login" });

        if (results.length === 0) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }

        res.json({ user: results[0] });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
