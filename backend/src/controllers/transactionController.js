const pool = require('../db');

async function getHistory(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT t.id, t.stock_id, s.symbol, s.name, t.type, t.quantity, t.price, t.created_at 
            FROM transactions t 
            JOIN portfolios p ON p.id = t.portfolio_id
            JOIN stocks s ON s.id = t.stock_id
            WHERE p.user_id = ?
            ORDER BY t.created_at DESC, t.id DESC
            LIMIT 50`, 
            [req.user.id]
        );
        res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' })
    }
}

module.exports = {
    getHistory
};