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

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT UNNEST(string_to_array("Genres", ', ')) AS genre
            FROM anime_data
            ORDER BY genre;
        `;
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No genres found' });
        }

        const genres = rows.map(row => row.genre);
        res.json({ genres });
    } catch (err) {
        console.error('Error fetching genres:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:category', async (req, res) => {
    const category = req.params.category;
    const sortType = req.query.sort;
    let sortMethod = '';
    let query = '';

    switch (sortType) {
        case 'score_asc':
            query = `
                SELECT "anime_id"
                FROM anime_data
                WHERE "Score" IS NOT NULL AND "Genres" ILIKE $1
                ORDER BY "Score" ASC;
            `;
            break;

        case 'score_desc':
            query = `
                SELECT "anime_id"
                FROM anime_data
                WHERE "Score" IS NOT NULL AND "Genres" ILIKE $1
                ORDER BY "Score" DESC;
            `;
            break;

        case 'year_asc':
            query = `
                SELECT "anime_id"
                FROM anime_data
                WHERE "Aired" IS NOT NULL AND "Aired" != 'Not available' AND "Genres" ILIKE $1
                ORDER BY
                    CAST(substring("Aired" FROM '\\d{4}') AS INT) ASC;
            `;
            break;

        case 'year_desc':
            query = `
                SELECT "anime_id"
                FROM anime_data
                WHERE "Aired" IS NOT NULL AND "Aired" != 'Not available' AND "Genres" ILIKE $1
                ORDER BY
                    CAST(substring("Aired" FROM '\\d{4}') AS INT) DESC;
            `;
            break;

        default:
            return res.status(400).json({ error: 'Invalid sort type' });
    }
    try {
        const { rows } = await pool.query(query, [`%${category}%`]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No anime found' });
        }

        const animeIds = rows.map(row => row.anime_id);
        res.json({ ID: animeIds });
    } catch (err) {
        console.error('Error fetching anime IDs:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const categoryRoutes = router; 