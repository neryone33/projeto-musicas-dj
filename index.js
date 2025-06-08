require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const users = []; // Armazenamento em memória

// Rota de registro
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email e senha são obrigatórios.');

    const userExists = users.find(u => u.email === email);
    if (userExists) return res.status(409).send('Usuário já registrado.');

    users.push({ email, password });
    res.status(201).send('User registered');
});

// Rota de login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'segredoJWT', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).send('Credenciais inválidas.');
});

// Middleware para autenticar JWT
const autenticarJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).send('Token não fornecido.');

    const token = authHeader.split(' ')[1];
    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET || 'segredoJWT');
        req.user = dados;
        next();
    } catch (err) {
        res.status(403).send('Token inválido.');
    }
};

// Rota protegida
app.get('/musicas', autenticarJWT, (req, res) => {
    res.json([
        { id: 1, titulo: 'Música A', artista: 'DJ A' },
        { id: 2, titulo: 'Música B', artista: 'DJ B' },
    ]);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
