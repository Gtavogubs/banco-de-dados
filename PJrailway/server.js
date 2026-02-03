const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Página Inicial')));

const dbConfig = process.env.MYSQL_URL || {
    host: "localhost",
    user: "root",
    password: "",
    database: "alpha_gym"
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) return console.error(err.message);
    
    connection.query("CREATE DATABASE IF NOT EXISTS alpha_gym", (err) => {
        if (err) return console.error(err);
        
        connection.query("USE alpha_gym", (err) => {
            if (err) return console.error(err);
            
            const createTable = `
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    senha VARCHAR(255) NOT NULL
                )`;
            
            connection.query(createTable, (err) => {
                if (err) console.error(err);
                else console.log("Database e Tabela prontas!");
            });
        });
    });
});

app.post("/usuarios", (req, res) => {
    const { nome, email, senha } = req.body;
    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    connection.query(sql, [nome, email, senha], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao cadastrar" });
        res.json({ message: "Conta criada!", id: result.insertId });
    });
});

app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    connection.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            res.json({ message: "Sucesso!", user: results[0] });
        } else {
            res.status(401).json({ message: "Dados incorretos." });
        }
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor na porta ${PORT}`);
});