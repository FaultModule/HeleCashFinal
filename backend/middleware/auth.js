// middleware/verificarToken.js
const jwt = require('jsonwebtoken');

/**
 * Middleware que valida o JWT.
 * 1. Procura token no header Authorization: Bearer <token>
 * 2. Se não encontrar, tenta cookie access_token (útil quando usa httpOnly cookies)
 * 3. Em caso de sucesso, injeta req.user com o payload decodificado.
 */
function verificarToken(req, res, next) {
  let token;

  /* ---------------------------------- Header --------------------------------- */
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  /* ---------------------------------- Cookie --------------------------------- */
  if (!token && req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  /* ------------------------------ Sem credencial ----------------------------- */
  if (!token) {
    return res
      .status(401)
      .json({ error: 'Credenciais ausentes: envie um token válido.' });
  }

  /* ---------------------------------- Verify --------------------------------- */
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // token expirou ou é inválido
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    req.user = decoded; // { id, nome, email, ... }
    return next();
  });
}

module.exports = verificarToken;
