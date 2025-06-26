// routes/lancamentos.js
const express         = require('express');
const db              = require('../db');
const verificarToken  = require('../middleware/verificarToken');

const router = express.Router();

/* -------------------------------------------------------------------- */
/* Listar todos os lançamentos do usuário                               */
/* GET /api/lancamentos                                                 */
/* -------------------------------------------------------------------- */
router.get('/', verificarToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await db.query(
      `SELECT l.id, l.descricao, l.valor, l.data,
              c.nome  AS categoria_nome,
              c.tipo  AS categoria_tipo
         FROM lancamentos l
         JOIN categorias c ON c.id = l.categoria_id
        WHERE l.usuario_id = $1
        ORDER BY l.data DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /lancamentos:', err);
    res.status(500).json({ error: 'Erro ao listar lançamentos' });
  }
});

/* -------------------------------------------------------------------- */
/* Criar lançamento                                                     */
/* POST /api/lancamentos                                                */
/* -------------------------------------------------------------------- */
router.post('/', verificarToken, async (req, res) => {
  const { descricao, valor, data, categoria_id } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      `INSERT INTO lancamentos
         (descricao, valor, data, categoria_id, usuario_id, criado_em)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [descricao, valor, data, categoria_id, userId]
    );
    res.status(201).json({ message: 'Lançamento adicionado' });
  } catch (err) {
    console.error('POST /lancamentos:', err);
    res.status(500).json({ error: 'Erro ao criar lançamento' });
  }
});

/* -------------------------------------------------------------------- */
/* Atualizar lançamento                                                 */
/* PUT /api/lancamentos/:id                                             */
/* -------------------------------------------------------------------- */
router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, categoria_id } = req.body;
  const userId = req.user.id;

  try {
    const { rowCount } = await db.query(
      `UPDATE lancamentos
          SET descricao   = COALESCE($1, descricao),
              valor       = COALESCE($2, valor),
              data        = COALESCE($3, data),
              categoria_id= COALESCE($4, categoria_id),
              atualizado_em = NOW()
        WHERE id = $5 AND usuario_id = $6`,
      [descricao, valor, data, categoria_id, id, userId]
    );

    if (!rowCount) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Lançamento atualizado' });
  } catch (err) {
    console.error('PUT /lancamentos:', err);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

/* -------------------------------------------------------------------- */
/* Remover lançamento                                                   */
/* DELETE /api/lancamentos/:id                                          */
/* -------------------------------------------------------------------- */
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rowCount } = await db.query(
      'DELETE FROM lancamentos WHERE id = $1 AND usuario_id = $2',
      [id, userId]
    );

    if (!rowCount) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Lançamento removido' });
  } catch (err) {
    console.error('DELETE /lancamentos:', err);
    res.status(500).json({ error: 'Erro ao remover' });
  }
});

module.exports = router;
