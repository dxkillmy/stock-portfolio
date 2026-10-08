const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all stocks
router.get('/', async (req, res) => {
    try {
        const q = req.query.q;
        const [rows] = q ? await pool.query('SELECT * FROM stocks WHERE symbol LIKE ? OR name LIKE ?', [`%${q}%`, `%${q}%`])
            : await pool.query('SELECT * FROM stocks');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get a specific stock by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stocks WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Stock not found'});
        } else {
            res.json(rows[0]);
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

// Add a new stock (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    const { symbol, name, price} = req.body;
    if (!symbol || !name || price == null || price < 0) {
        return res.status(400).json({ error: 'Symbol, name, price are required'});
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO stocks (symbol, name, price) VALUES (?, ?, ?)', 
            [symbol.toUpperCase(), name, price]
        );
        res.status(201).json({ id: result.insertId, symbol: symbol.toUpperCase(), name, price });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Stock symbol already exists' });
            } 
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            }
     }); 

// Update a stock (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    const { name, price } = req.body;
    if (!name || price == null || price < 0) {
        return res.status(400).json({ error: 'name and price are required'});
    }
    try {
        const [result] = await pool.query(
            'UPDATE stocks SET name = ?, price = ? WHERE id = ?',
            [name, price, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Stock not found' });
        } res.json({ id: req.params.id, name, price });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a stock (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM stocks WHERE id = ?', 
            [req.params.id]);
            res.status(204).json({ message: 'Stock deleted successfully' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ error: 'Stock has transasction, cannot delete' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;