const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticate} = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json({ error: 'Email and password are required'});
    }

    try{
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if(existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registerd'});
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', 
            [email,passwordHash]
        );
        await pool.query('INSERT INTO portfolios (user_id) VALUES (?)', [result.insertId]);
        res.status(201).json({ id: result.insertId, email});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login a user
router.post('/login', async (req,res) => {
    const { email, password} = req.body;
    try{
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))){
            return res.status(401).json({ error: 'Invalid email or password'});
        }
        const token = jwt.sign(
            { id: user.id, role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        );
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    }
});

router.get('/me', authenticate, (req, res) => {
    res.json(req.user);
});

module.exports = router;