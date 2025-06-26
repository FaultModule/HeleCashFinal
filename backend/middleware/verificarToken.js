// backend/middleware/verificarToken.js
const jwt = require('jsonwebtoken');

/**
 * Middleware que valida JWT vindo no header Authorization: Bearer <token>
 * ou em cookie access_token.
 */
function verificarToken(req, res, next) {
  let token;

  /* ----- Header ------------------------------------------------------- */
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];

  /* ----- Cookie ------------------------------------------------------- */
  if (!token && req.cookies?.access_token) token = req.cookies.access_token;

  /* ----- Sem credencial ---------------------------------------------- */
  if (!token) {
    return res.status(401).json({ error: 'Credenciais ausentes.' });
  }

  /* ----- Verificação -------------------------------------------------- */
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = decoded;          // { id, nome, email, … }
    next();
  });
}

module.exports = verificarToken;
