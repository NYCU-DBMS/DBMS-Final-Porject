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

const checkUsersTable = async (req, res, next) => {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
      );
  `;
  try {
      await pool.query(createTableQuery);
      next();
  } catch (error) {
      console.error('Error ensuring Users table:', error);
      next();
  }
};

router.post('/login', checkUsersTable, async (req, res) => {
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

        // 有效登入時間 - 1 jhour
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register', checkUsersTable, async (req, res) => {
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

// const authenticate_search = (req, res, next) => {
//   const userID = req.body.userID;

//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   req.userID = userID;

//   if (!token) {
//     req.MSG = 'Not logged in';
//     next();
//   }

//   try {
//     const result = jwt.verify(token, process.env.JWT_SECRET);
//     req.MSG = 'Logged in';
//   } catch (err) {
//     req.MSG = 'Not logged in'
//   }

//   next();
// };

router.get('/search/:username', checkUsersTable, async (req, res) => {
    const username = req.params.username;
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
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/update-password', checkUsersTable, async (req, res) => {
    const { oldPW, newPW, userID } = req.body;

    if (!oldPW || !newPW) {
      return res.status(400).json({ error: 'Both old and new passwords are required' });
    }
  
    try {  
      const userQuery = 'SELECT id, password FROM Users WHERE id = $1';
      const { rows } = await pool.query(userQuery, [userID]);
      const user = rows[0];
      const isMatch = await bcrypt.compare(oldPW, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect' });
      }
  
      const hashedPW = await bcrypt.hash(newPW, 10);
      const updatePWQuery = 'UPDATE Users SET password = $1 WHERE id = $2';
      await pool.query(updatePWQuery, [hashedPW, userID]);
  
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error updating password:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/update-email', checkUsersTable, async (req, res) => {
    const { PW, newEmail, userID } = req.body;
  
    if (!PW || !newEmail) {
      return res.status(400).json({ error: 'Both password and new email address are required' });
    }
  
    try {
      const userQuery = 'SELECT id, password FROM Users WHERE id = $1';
      const { rows } = await pool.query(userQuery, [userID]);
      const user = rows[0];
      const isMatch = await bcrypt.compare(PW, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ error: 'Password is incorrect' });
      }

      const updateEmailQuery = 'UPDATE Users SET email = $1 WHERE id = $2';
      await pool.query(updateEmailQuery, [newEmail, userID]);
  
      res.json({ message: 'Email updated successfully' });
    } catch (err) {
      console.error('Error updating email:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const loginregRoutes = router; 