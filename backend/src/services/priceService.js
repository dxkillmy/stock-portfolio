const pool = require('../db');

async function refreshPrices() {
     const [stocks] = await pool.query(
        `SELECT id, price FROM stocks`
        );
    for (const s of stocks) {
        const change = 1 + (Math.random() * 0.04 - 0.02);
        const newPrice = Math.max(0.01, Number(s.price) * change).toFixed(2);
        await pool.query(
            `UPDATE stocks SET price = ? WHERE id = ?`,
            [newPrice, s.id]
        );
    }
    return stocks.length;
}

module.exports = {
    refreshPrices
};