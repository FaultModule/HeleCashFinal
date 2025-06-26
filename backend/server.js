// backend/server.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const session  = require('express-session');
const passport = require('passport');
require('./middleware/googleAuth');        // carrega estratégia Google

const app = express();

/* ------------------------------------------------------------------------ */
/* Middlewares globais                                                      */
/* ------------------------------------------------------------------------ */
app.use(express.json());

// CORS precisa permitir credentials para sessões/cookies.
app.use(
  cors({
    origin: 'http://localhost:3000',       // ajuste a URL do seu front
    credentials: true
  })
);

// Se você DEPLOYAR atrás de proxy (Vercel, Render, etc.) — descomente:
// app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,    // 👉 coloque no arquivo .env
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 h (opcional)
  })
);

app.use(passport.initialize());
app.use(passport.session());               // necessário se usar Login Google

/* ------------------------------------------------------------------------ */
/* Rotas                                                                    */
/* ------------------------------------------------------------------------ */
const authRouter        = require('./routes/auth');
const lancamentosRouter = require('./routes/lancamentos');
const categoriasRouter  = require('./routes/categorias');

// prefixe tudo que é API sob /api para clareza
app.use('/api/auth',        authRouter);
app.use('/api/lancamentos', lancamentosRouter);
app.use('/api/categorias',  categoriasRouter);

/* ------------------------------------------------------------------------ */
/* Arquivos estáticos (frontend)                                            */
/* ------------------------------------------------------------------------ */
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// se quiser SPA-fallback: redireciona qualquer rota não-API p/ index.html
app.get(/^\/(?!api).*$/, (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'))
);

/* ------------------------------------------------------------------------ */
/* Boot                                                                     */
/* ------------------------------------------------------------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀  Backend rodando em http://localhost:${PORT}`)
);
