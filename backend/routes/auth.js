const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');
const passport = require('passport');

  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
    (req, res) => {
    const token = req.user.token;
    res.redirect(`/index.html?token=${token}`);
    }
  );
  
  router.get('/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/login.html');
    });
  });
  
  router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    
    const userExists = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    
    const hash = await bcrypt.hash(senha, 10);

    
    await db.query(
    'INSERT INTO usuarios (nome, email, senha, criado_em) VALUES ($1, $2, $3, NOW())',
    [nome, email, hash]
    );


    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

const jwt = require('jsonwebtoken');


router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

module.exports = router;

