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

const splitDates = (aired) => {
    if (!aired) return { startDate: null, endDate: null };
  
    const parts = aired.split(' to ');
    const startDate = DateToFormat(parts[0].trim());
    const endDate = parts[1] ? DateToFormat(parts[1].trim()) : '?';
  
    return { startDate, endDate };
};

const DateToFormat = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) {
      return null;
    }
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

router.get('/', (req, res) => {
    res.json({
        message: 'Anime API'
    });
});

router.get('/all', async (req, res) => {
    //console.log('Route hit');
    const sortType = req.query.sort;
    //console.log('Received sortType:', sortType);
    let sortMethod = ''

    switch (sortType) {
        case 'score_asc':
            sortMethod = '"Score" ASC';
            break;
        case 'score_desc':
            sortMethod = '"Score" DESC';
            break;
        case 'year_asc':
            sortMethod =  
            `
                WHERE "Aired" IS NOT NULL
                CASE 
                    WHEN \"Aired\" = \'Not available\' THEN 10000
                    ELSE 10001 
                END DESC\, 
                CAST\(substring\(\"Aired\" FROM \'\(\\d\{4\}\)\'\) AS INT\) ASC`;
            break;
        case 'year_desc':
            sortMethod =  
            `
                WHERE "Aired" IS NOT NULL
                CASE 
                    WHEN \"Aired\" = \'Not available\' THEN 1
                    ELSE 0 
                END ASC\, 
                CAST\(substring\(\"Aired\" FROM \'\(\\d\{4\}\)\'\) AS INT\) DESC`;
            break;
        default:
            return res.status(400).json({ error: 'Invalid sort type' });
    }

    try {
        const query = `
            SELECT "anime_id"
            FROM anime_data
            ORDER BY ${sortMethod};
        `;

        const { rows } = await pool.query(query);

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

router.get('/:id(\\d+)', async (req, res) => {
    //console.log('Route hit');
    const animeId = req.params.id;
    try {
        const query = `
            SELECT
                "Name",
                "Score", 
                "Genres" as "Category", 
                "Synopsis" as "Description",
                "Type",
                "Episodes",
                "Aired",
                "Image_URL"
            FROM anime_data
            WHERE "anime_id" = $1;
        `;
        const { rows } = await pool.query(query, [animeId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Anime not found' });
        }
        const { Name, Score, Category, Description, Type, Episodes, Aired, Image_URL } = rows[0];
        const { startDate, endDate } = splitDates(Aired);
        res.json({
            Name,
            Score,
            Category,
            Description,
            Type,
            Episodes: Episodes || -1,
            'Air_Date': startDate,
            'End_Date': endDate,
            Image_URL,
        });
    }
    catch (err) {
        console.error('Error fetching anime:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const animeRoutes = router; 

/*
SET client_encoding TO 'UTF8';

SELECT "Name", "Aired"
FROM anime_data
ORDER BY 
    CASE 
        WHEN "Aired" = 'Not available' THEN 1
        ELSE 0
    END ASC,
    CAST(substring("Aired" FROM '(\d{4})') AS INT) DESC;

SELECT "Name", "Aired"
FROM anime_data
ORDER BY 
    CASE 
        WHEN "Aired" = 'Not available' THEN 10000
        ELSE 10001
    END DESC,
    CAST(substring("Aired" FROM '(\d{4})') AS INT) ASC;

SELECT "anime_id", "Aired"
FROM anime_data
ORDER BY 
    CASE 
        WHEN "Aired" = 'Not available' THEN 1
        ELSE 0
    END ASC,
    CAST(substring("Aired" FROM '(\d{4})') AS INT) DESC;


SELECT "anime_id", "Aired"
FROM anime_data
ORDER BY 
    CASE 
        WHEN "Aired" = 'Not available' THEN 10000
        ELSE 10001
    END DESC,
    CAST(substring("Aired" FROM '(\d{4})') AS INT) ASC;

*/