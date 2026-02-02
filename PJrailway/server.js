const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path"); // Importante para gerenciar pastas na nuvem
const app = express();

app.use(cors());
app.use(express.json());

// Serve os arquivos da pasta 'Página Inicial'
// Usar path.join garante que o caminho funcione tanto em Windows quanto no Linux da Railway
app.use(express.static(path.join(__dirname, 'Página Inicial'))); 

// CONFIGURAÇÃO DA CONEXÃO
// Na Railway, você usará a variável MYSQL_URL que eles fornecem.
// Se não houver essa variável (ex: no seu PC), ele usa os dados locais.
const db = mysql.createConnection(process.env.MYSQL_URL || {
    host: "localhost",
    user: "root",
    password: "", // Sua senha local
    database: "alpha_gym"
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar ao banco:", err.message);
        return;
    }
    console.log("✅ Conexão estabelecida com o MySQL!");
});

// ROTA: Cadastro de Usuários
app.post("/usuarios", (req, res) => {
    const { nome, email, senha } = req.body;
    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    
    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao cadastrar. E-mail já existe?" });
        }
        res.json({ message: "Conta criada!", id: result.insertId });
    });
});

// ROTA: Login
app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json(err);
        
        if (results.length > 0) {
            res.json({ message: "Sucesso!", user: results[0] });
        } else {
            res.status(401).json({ message: "Dados incorretos." });
        }
    });
});

// PORTA DINÂMICA
// A Railway define a porta automaticamente na variável process.env.PORT
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});