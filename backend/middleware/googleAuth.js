const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db');
const jwt = require('jsonwebtoken');

passport.serializeUser((user, done) => {
  done(null, user); // será salvo na sessão
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const nome = profile.displayName;

    // Verifica se usuário já existe
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    let user = result.rows[0];

    // Se não existir, cria
    if (!user) {
      const insert = await db.query(
        'INSERT INTO usuarios (nome, email, criado_em) VALUES ($1, $2, NOW()) RETURNING *',
        [nome, email]
      );
      user = insert.rows[0];
    }

    // Gera token JWT
    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Adiciona o token ao objeto user
    user.token = token;

    return done(null, user);

  } catch (err) {
    console.error(err);
    return done(err, null);
  }
}));
