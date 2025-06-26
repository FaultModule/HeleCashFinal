require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const session  = require('express-session');
const passport = require('passport');
require('./middleware/googleAuth');
const app = express();


app.use(express.json());


app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);



app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } 
  })
);

app.use(passport.initialize());
app.use(passport.session());


const authRouter        = require('./routes/auth');
const lancamentosRouter = require('./routes/lancamentos');
const categoriasRouter  = require('./routes/categorias');


app.use('/api/auth',        authRouter);
app.use('/api/lancamentos', lancamentosRouter);
app.use('/api/categorias',  categoriasRouter);


const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));


app.get(/^\/(?!api).*$/, (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'))
);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀  Backend rodando em http://localhost:${PORT}`)
);
