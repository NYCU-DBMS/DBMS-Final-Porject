require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await pool.query(query, [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];

        //和加密過後的密碼比較
        const Match = await bcrypt.compare(password, user.password);

        if (!Match) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 有效登入時間 - 30分鐘
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30m' });
        
        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log("register route");
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUserQuery = `
            SELECT * FROM Users WHERE username = $1 OR email = $2;
        `;
        const existingUserResult = await pool.query(existingUserQuery, [username, email]);

        if (existingUserResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already registered!' });
        }

        //encrypt pw
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = `
            INSERT INTO Users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, username, email;
        `;
        const newUserResult = await pool.query(insertUserQuery, [username, email, hashedPassword]);

        const newUser = newUserResult.rows[0];

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/search/:username', async (req, res) => {
    const username = req.params.username;
    const Token = req.headers.authorization?.split(' ')[1] || "User not logged in";

    try {
        const query = `
            SELECT
                "id",
                "username",
                "email"
            FROM Users
            WHERE "username" = $1;
        `;
        const { rows } = await pool.query(query, [username]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({  
            id: rows[0].id,
            username: rows[0].username,
            email: rows[0].email,
            token: Token
        });
    }
    catch (err) {
        console.error('Error fetching anime:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/update-password', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; //拿token
    const { oldPW, newPW } = req.body;
  
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    if (!oldPW || !newPW) {
      return res.status(400).json({ error: 'Both old and new passwords are required' });
    }
  
    try {
      const userInfo= jwt.verify(token, process.env.JWT_SECRET);
      const userId = userInfo.userId;
  
      const userQuery = 'SELECT id, password FROM Users WHERE id = $1';
      const { rows } = await pool.query(userQuery, [userId]);
      const user = rows[0];
      const isMatch = await bcrypt.compare(oldPW, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect' });
      }
  
      const hashedPW = await bcrypt.hash(newPW, 10);
      const updatePWQuery = 'UPDATE Users SET password = $1 WHERE id = $2';
      await pool.query(updatePWQuery, [hashedPW, userId]);
  
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error updating password:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/update-email', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; //拿token
    const { PW, newEmail } = req.body;
  
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    if (!PW || !newEmail) {
      return res.status(400).json({ error: 'Both password and new email address are required' });
    }
  
    try {
      const userInfo= jwt.verify(token, process.env.JWT_SECRET);
      const userId = userInfo.userId;
  
      const userQuery = 'SELECT id, password FROM Users WHERE id = $1';
      const { rows } = await pool.query(userQuery, [userId]);
      const user = rows[0];
      const isMatch = await bcrypt.compare(PW, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ error: 'Password is incorrect' });
      }

      const updateEmailQuery = 'UPDATE Users SET email = $1 WHERE id = $2';
      await pool.query(updateEmailQuery, [newEmail, userId]);
  
      res.json({ message: 'Email updated successfully' });
    } catch (err) {
      console.error('Error updating email:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const loginregRoutes = router; 