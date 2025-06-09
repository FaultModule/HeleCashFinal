const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

router.get('/', verificarToken, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.id, l.descricao, l.valor, l.data,
                c.nome AS categoria_nome, c.tipo AS categoria_tipo
            FROM lancamentos l
            JOIN categorias c ON l.categoria_id = c.id
            ORDER BY l.data DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar lançamentos'});
    }
    
})

router.post('/', verificarToken, async (req, res) => {

    const { descricao, valor, data, categoria_id, usuario_id} = req.body;

    try {
        await db.query(`
            INSERT INTO lancamentos (descricao, valor, data, criado_em, categoria_id, usuario_id)
            VALUES ($1, $2, $3, NOW(), $4, $5)    
            `,[descricao, valor, data, categoria_id, usuario_id]);

        res.status(201).json({ message: 'Lançamento criado com sucesso'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar lançamento'});
    }

});

module.exports = router;