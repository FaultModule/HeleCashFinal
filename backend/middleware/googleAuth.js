const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const db = require('./db'); // sua conexão com o banco

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://helecashfinal.onrender.com/api/auth/callback/google/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const nome = profile.displayName;

    let user = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      await db.query(
        'INSERT INTO usuarios (nome, email, criado_em) VALUES ($1, $2, NOW())',
        [nome, email]
      );
    }

    done(null, { email, nome }); // ou o ID do banco
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

