// server/auth/googleStrategy.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const db = require('../db');

// Se estiver no Render, a variável já vem com https://
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';  
// → No Render defina BASE_URL=https://helecashfinal.onrender.com

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const nome = profile.displayName;

        const { rows } = await db.query(
          'SELECT id, nome, email FROM usuarios WHERE email = $1',
          [email],
        );

        if (rows.length === 0) {
          await db.query(
            'INSERT INTO usuarios (nome, email, criado_em) VALUES ($1, $2, NOW())',
            [nome, email],
          );
        }

        // devolve apenas o essencial
        done(null, { email, nome });
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
