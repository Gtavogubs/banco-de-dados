const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection(process.env.MYSQL_URL);

connection.connect((err) => {
    if (err) {
        console.error("Erro ao conectar no MySQL:", err.message);
    } else {
        console.log("Conectado ao MySQL");

        connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL
            )
        `);
    }
});

app.post("/usuarios", (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Dados incompletos" });
    }

    connection.query(
        "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
        [nome, email, senha],
        (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "E-mail já cadastrado" });
                }
                return res.status(500).json({ message: "Erro no cadastro" });
            }

            res.json({ message: "Conta criada" });
        }
    );
});

app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    connection.query(
        "SELECT nome FROM usuarios WHERE email = ? AND senha = ?",
        [email, senha],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Erro no login" });
            }

            if (!results.length) {
                return res.status(401).json({ message: "Email ou senha incorretos" });
            }

            res.json({ user: results[0] });
        }
    );
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});