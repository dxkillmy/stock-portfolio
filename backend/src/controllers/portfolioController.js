const pool = require('../db');

async function getPortfolio(req, res) {
    try {
        // Get the money balance of the user
        const [portfolios] = await pool.query(
            `SELECT id, cash_balance FROM portfolios WHERE user_id = ?`, 
            [req.user.id]
        );
        if (portfolios.length === 0) 
            return res.status(404).json({ error: " Portfolio not found" });

        const portfolio = portfolios[0];

        // Get the buy and sell transactions for the user
        const [trasactions] = await pool.query(
            `SELECT t.type, t.quantity, t.price, s.id AS stock_id, s.symbol, s.name, s.price AS current_price
            FROM transactions t
            JOIN stocks s ON s.id = t.stock_id
            WHERE t.portfolio_id = ?`,
            [portfolio.id]
        );

        // Calculate the current holdings based on the transactions
        const holdingsMap = {};

        for (const t of trasactions) {
            const id = t.stock_id;

            if (!holdingsMap[id]) {
                holdingsMap[id] = {
                    stock_id: id,
                    symbol: t.symbol,
                    name: t.name,
                    currentPrice: Number(t.current_price),
                    quantity: 0,
                    totalBuyCost: 0,
                    totalBuyQty: 0
                };
            }

            const qty = Number(t.quantity);
            const price = Number(t.price);

            if (t.type === 'buy') {
                holdingsMap[id].quantity += qty;
                holdingsMap[id].totalBuyCost += price * qty;
                holdingsMap[id].totalBuyQty += qty;
            } else if (t.type === 'sell') {
                holdingsMap[id].quantity -= qty;
            }
        }

        // Filter out stocks with zero quantity
        const holdings = [];
        for (const id in holdingsMap) {
            const item = holdingsMap[id];

            if (item.quantity > 0) {
                const avgCost = item.totalBuyCost / item.totalBuyQty;
                const marketValue = item.currentPrice * item.quantity;
                const profitLoss = (item.currentPrice - avgCost) * item.quantity;
            
                holdings.push({
                    stockId: item.stock_id,
                    symbol: item.symbol,
                    name: item.name,
                    quantity: item.quantity,
                    avgCost: Number(avgCost.toFixed(2)),
                    currentPrice: item.currentPrice,
                    marketValue: Number(marketValue.toFixed(2)) ,
                    profitLoss: Number(profitLoss.toFixed(2))
                });
            }
        }

        const cash = Number(portfolio.cash_balance);
        const stocksValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

        res.json({ 
            cash,
            stocksValue,
            totalValue: cash + stocksValue,
            holdings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getPortfolio
};