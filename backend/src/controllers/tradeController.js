const pool = require('../db');

async function processTrade(type, req, res) {
    const { stock_id, quantity } = req.body;
    if (!stock_id || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'stock_id and positive integer quantity are required' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Get the user's portfolio
        const [portfolios] = await conn.query(
            `SELECT id, cash_balance FROM portfolios WHERE user_id = ? FOR UPDATE`,
            [req.user.id]
        );
        if (portfolios.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Portfolio not found' });
        }
        const portfolio = portfolios[0];

        // Get the stock details
        const [stocks] = await conn.query(
            `SELECT id, price FROM stocks WHERE id = ?`,
            [stock_id]
        );
        if (stocks.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Stock not found' });
        }

        const price = Number(stocks[0].price);
        const totalPrice = price * quantity;

        // Check conditions for buy and sell
        if(type === 'buy') {
            if(Number(portfolio.cash_balance) < totalPrice) {
                await conn.rollback();
                return res.status(400).json({ error: 'Insufficient funds' });
            }
            await conn.query(
                `UPDATE portfolios SET cash_balance = cash_balance - ? WHERE id = ?`,
                [totalPrice, portfolio.id]
            );
        } else if (type === 'sell') {
            const [txList] = await conn.query(
                `SELECT type, quantity FROM transactions WHERE portfolio_id = ? AND stock_id = ?`,
                [portfolio.id, stock_id]
            );

            let ownedQty = 0;
            for (const item of txList) {
                if (item.type === 'buy') {
                    ownedQty += Number(item.quantity);
                } else if (item.type === 'sell') {
                    ownedQty -= Number(item.quantity);
                }
            }
            if (ownedQty < quantity) {
                await conn.rollback();
                return res.status(400).json({ error: 'Insufficient stock quantity' });
            }
        await conn.query(
            `UPDATE portfolios SET cash_balance = cash_balance + ? WHERE id = ?`,
            [totalPrice, portfolio.id]
        );
        }

        // Record the transaction
        const [result] = await conn.query(
            `INSERT INTO transactions (portfolio_id, stock_id, type, quantity, price) VALUES (?, ?, ?, ?, ?)`,
            [portfolio.id, stock_id, type, quantity, stocks[0].price]
        );

        await conn.commit();
        res.status(201).json({ id: result.insertId , type, stock_id, quantity, price, total: totalPrice });
    } catch (err) {
        await conn.rollback();
        if (err.status) 
            return res.status(err.status).json({ error: err.message });
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        conn.release();
    }
}

const buy = (req, res) => processTrade('buy', req, res);
const sell = (req, res) => processTrade('sell', req, res);

module.exports = {
    buy,
    sell
};