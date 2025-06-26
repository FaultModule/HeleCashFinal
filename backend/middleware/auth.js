
const jwt = require('jsonwebtoken');


function verificarToken(req, res, next) {
  let token;


  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Credenciais ausentes: envie um token válido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
     
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    req.user = decoded; // { id, nome, email, ... }
    return next();
  });
}

module.exports = verificarToken;
