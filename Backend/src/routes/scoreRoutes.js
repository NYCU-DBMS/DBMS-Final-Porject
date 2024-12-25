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

router.post("/remove", async (req, res) => {
    const { user_id, anime_id } = req.body;

    if (!user_id || !anime_id) {
        return res.status(400).json({ msg: "failure", error: "Invalid input" });
    }

    try {
        const { rows } = await pool.query(`
            SELECT "rating" FROM user_rating WHERE "userid" = $1 AND "anime_id" = $2
        `, [user_id, anime_id]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "failure", error: "Rating not found" });
        }

        const score = rows[0].rating;

        await pool.query(`
            DELETE FROM user_rating WHERE "userid" = $1 AND "anime_id" = $2
        `, [user_id, anime_id]);

        await pool.query(`
            UPDATE anime_data
            SET "Score" = CASE 
                    WHEN "Scored_By" - 1 = 0 THEN NULL
                    ELSE ((COALESCE("Score", 0) * COALESCE("Scored_By", 0)) - $1) / (COALESCE("Scored_By", 0) - 1)
                END,
                "Scored_By" = GREATEST(COALESCE("Scored_By", 0) - 1, 0)
            WHERE "anime_id" = $2
        `, [score, anime_id]);

        res.json({ msg: "success", error: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "failure", error: "Internal server error" });
    }
});

router.post('/add', async (req, res) => {
    const { user_id, anime_id, score} = req.body;

    if (!user_id || !anime_id || !score) {
        return res.status(400).json({ msg: "failure", error: "Invalid input" });
    }

    try {
        //update score related info in anime_data table
        await pool.query(`
            UPDATE anime_data
            SET "Score" = (
                ((COALESCE("Score", 0) * COALESCE("Scored_By", 0)) + $1) / (COALESCE("Scored_By", 0) + 1)
            ),
            "Scored_BY" = COALESCE("Scored_By", 0) + 1
            WHERE "anime_id" = $2
        `,[score, anime_id]);

        //update user_rating table
        await pool.query(`
            INSERT INTO user_rating ("username", "anime_id", "rating")
            VALUES ($1, $2, $3)
        `,[user_id,anime_id,score]);

        //update user_rating table
        await pool.query(`
            INSERT INTO user_rating ("username", "anime_id", "rating")
            VALUES ($1, $2, $3)
        `,[user_id,anime_id,score]);

        res.json({msg: "success", error: null});
    } catch (err) {
        console.error('Error adding score', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const animeRoutes = router; 