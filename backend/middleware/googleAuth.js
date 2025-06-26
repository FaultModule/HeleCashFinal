// backend/auth/googleStrategy.js
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto         = require('crypto');
const bcrypt         = require('bcrypt');           // use o mesmo pacote do restante
const db             = require('../db');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// No Render defina no dashboard:  BASE_URL=https://helecashfinal.onrender.com

/* -------------------------------------------------------------------------- */
/* Strategy                                                                   */
/* -------------------------------------------------------------------------- */
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${BASE_URL}/api/auth/google/callback`,   // ⬅ combine com router
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const nome  = profile.displayName || profile.username;

        if (!email) {
          return done(
            new Error('Google OAuth não retornou e-mail verificado'),
            false,
          );
        }

        /* --------------------------- Encontrar ou criar -------------------------- */
        const { rows } = await db.query(
          'SELECT id, nome, email FROM usuarios WHERE email = $1',
          [email],
        );

        let usuario = rows[0];

        if (!usuario) {
          const randomPwd  = crypto.randomBytes(16).toString('hex'); // 32 chars
          const hashedPwd  = await bcrypt.hash(randomPwd, 12);

          const insert = await db.query(
            `INSERT INTO usuarios (nome, email, senha, criado_em)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, nome, email`,
            [nome, email, hashedPwd],
          );
          usuario = insert.rows[0];
        }

        // Tudo certo — devolve apenas dados necessários
        return done(null, usuario);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

/* -------------------------------------------------------------------------- */
/* Sessão (opcional)                                                          */
/* -------------------------------------------------------------------------- */
/*  ➜ Se você estiver usando JWT puro e `session: false` nas rotas protegidas,
      pode remover serialize/deserialize e não usar express-session.
*/
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await db.query(
      'SELECT id, nome, email FROM usuarios WHERE id = $1',
      [id],
    );
    return done(null, rows[0] || null);
  } catch (err) {
    return done(err, null);
  }
});
