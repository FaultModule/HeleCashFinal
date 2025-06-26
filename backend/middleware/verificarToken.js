const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  let token;

  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];

  if (!token && req.cookies?.access_token) token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Credenciais ausentes.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = decoded;
    next();
  });
}

module.exports = verificarToken;
