
require('dotenv').config();

const express   = require('express');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const passport  = require('passport');
const db        = require('../db');

const router = express.Router();


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) return res.redirect('/login.html');


    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    
    res.redirect(`/index.html?token=${token}`);
  })(req, res, next);
});


router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login.html');
  });
});


router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const { rows } = await db.query(
      'SELECT 1 FROM usuarios WHERE email = $1',
      [email]
    );
    if (rows.length) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      `INSERT INTO usuarios (nome, email, senha, criado_em)
       VALUES ($1, $2, $3, NOW())`,
      [nome, email, hash]
    );

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error('Erro em /register:', err);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});


router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const { rows } = await db.query(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = $1',
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.error('Erro em /login:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

module.exports = router;
