require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const port = 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

router.get('/', (req, res) => {
    res.json({
        message: 'Score API'
    });
});

const checkRatingTable = async (req, res, next) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS our_user_rating (
            user_id INTEGER,
            anime_id INTEGER,
            rating INTEGER,
            PRIMARY KEY (user_id, anime_id)
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

router.post("/remove", checkRatingTable, async (req, res) => {
    const { user_id, anime_id } = req.body;

    if (!user_id || !anime_id) {
        return res.status(400).json({ msg: "failure", error: "Invalid input" });
    }

    try {
        const { rows } = await pool.query(`
            SELECT "rating" FROM our_user_rating WHERE "user_id" = $1 AND "anime_id" = $2
        `, [user_id, anime_id]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "failure", error: "Rating not found" });
        }

        const score = rows[0].rating;

        await pool.query(`
            DELETE FROM our_user_rating WHERE "user_id" = $1 AND "anime_id" = $2
        `, [user_id, anime_id]);

        // 修改這個查詢以返回新的評分
        const updateResult = await pool.query(`
            UPDATE anime_data
            SET "Score" = CASE 
                    WHEN "Scored_By" - 1 = 0 THEN NULL
                    ELSE ((COALESCE("Score", 0) * COALESCE("Scored_By", 0)) - $1) / (COALESCE("Scored_By", 0) - 1)
                END,
                "Scored_By" = GREATEST(COALESCE("Scored_By", 0) - 1, 0)
            WHERE "anime_id" = $2
            RETURNING "Score"
        `, [score, anime_id]);

        const newTotalScore = updateResult.rows[0].Score;

        res.json({ 
            msg: "success", 
            error: null,
            totalScore: newTotalScore 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "failure", error: "Internal server error" });
    }
});

router.post('/add', checkRatingTable, async (req, res) => {
    const { user_id, anime_id, score} = req.body;

    if (!user_id || !anime_id || !score) {
        return res.status(400).json({ msg: "failure", error: "Invalid input" });
    }

    try {
        // 修改這個查詢以返回新的評分
        const updateResult = await pool.query(`
            UPDATE anime_data
            SET "Score" = (
                ((COALESCE("Score", 0) * COALESCE("Scored_By", 0)) + $1) / (COALESCE("Scored_By", 0) + 1)
            ),
            "Scored_By" = COALESCE("Scored_By", 0) + 1
            WHERE "anime_id" = $2
            RETURNING "Score"
        `,[score, anime_id]);

        await pool.query(`
            INSERT INTO our_user_rating ("user_id", "anime_id", "rating")
            VALUES ($1, $2, $3)
        `,[user_id, anime_id, score]);

        const newTotalScore = updateResult.rows[0].Score;

        res.json({
            msg: "success", 
            error: null,
            totalScore: newTotalScore
        });
    } catch (err) {
        console.error('Error adding score', err);
        res.status(500).json({ 
            msg: "failure", 
            error: 'Internal Server Error' 
        });
    }
});

router.post('/getScore', checkRatingTable, async (req, res) => {
    const { userID, animeID } = req.body;

    if (!userID || !animeID) {
        return res.status(400).json({ msg: "failure", error: "Invalid request body" });
    }

    try {
        const result = await pool.query(`
            SELECT "rating"
            FROM our_user_rating
            WHERE "user_id" = $1 AND "anime_id" = $2;
        `, [userID, animeID]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "failure", error: "No score found" });
        }

        res.json({
            score: result.rows[0].rating,
        });

    } catch (err) {
        console.error('Error fetching score:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const scoreRoutes = router;