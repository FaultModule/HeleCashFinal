// backend/auth/googleStrategy.js
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto         = require('crypto');
const bcrypt         = require('bcrypt');
const db             = require('../db');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${BASE_URL}/api/auth/google/callback`,
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

    
        const { rows } = await db.query(
          'SELECT id, nome, email FROM usuarios WHERE email = $1',
          [email],
        );

        let usuario = rows[0];

        if (!usuario) {
          const randomPwd  = crypto.randomBytes(16).toString('hex');
          const hashedPwd  = await bcrypt.hash(randomPwd, 12);

          const insert = await db.query(
            `INSERT INTO usuarios (nome, email, senha, criado_em)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, nome, email`,
            [nome, email, hashedPwd],
          );
          usuario = insert.rows[0];
        }

        
        return done(null, usuario);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);


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
