require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID); 
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('./middleware/googleAuth');

const app = express();
app.use(express.json());
app.use(cors());

// Sessão e autenticação
app.use(session({
  secret: 'sua_chave_secreta',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Rotas
const authRoutes = require('./routes/auth');
const lancamentosRouter = require('./routes/lancamentos');
const categoriasRoutes = require('./routes/categorias');

app.use('/api/auth', authRoutes);
app.use('/api/lancamentos', lancamentosRouter);
app.use('/api/categorias', categoriasRoutes);

// Servir frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
