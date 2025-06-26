// backend/server.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const session  = require('express-session');
const passport = require('passport');
require('./middleware/googleAuth');

const path = require('path');
const app  = express();

/* -------------------------------------------------------------------------- */
/* 1. Middlewares globais                                                     */
/* -------------------------------------------------------------------------- */
app.use(express.json());

// CORS – libera localhost (dev) e domínio Render (prod)
const WHITELIST = [
  'http://localhost:3000',
  'https://helecashfinal.onrender.com'
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || WHITELIST.includes(origin)) return cb(null, true);
      return cb(new Error('Origin not allowed by CORS: ' + origin));
    },
    credentials: true
  })
);

// Sessão (necessária para Passport quando usa Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 h
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* -------------------------------------------------------------------------- */
/* 2. Rotas                                                                   */
/* -------------------------------------------------------------------------- */
// arquivos estáticos primeiro
app.use(express.static(path.join(__dirname, '../frontend')));

// rotas de API
const authRouter        = require('./routes/auth');
const lancamentosRouter = require('./routes/lancamentos');
const categoriasRouter  = require('./routes/categorias');

app.use('/api/auth',        authRouter);
app.use('/api/lancamentos', lancamentosRouter);
app.use('/api/categorias',  categoriasRouter);

// fallback SPA — por último, depois de static + API
app.get(/^\/(?!api).*$/, (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'))
);

/* -------------------------------------------------------------------------- */
/* 3. Boot                                                                    */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀  Backend rodando em http://localhost:${PORT}`)
);
