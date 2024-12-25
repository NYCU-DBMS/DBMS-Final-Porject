import { importCsvToDb } from './db.js';
import express from 'express';
import { query } from './db.js';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/importCSV', async  (req: any, res: any) => {
    try {
        let filePath = 'C:\\Program Files\\PostgreSQL\\16\\data\\anime-dataset-2023.csv';
        let tableName = 'anime_data';
        let columns = ['anime_id', 'Name', 'English_name', 'Other_name', 'Score', 'Genres', 'Synopsis',
            'Type', 'Episodes', 'Aired', 'Premiered', 'Status', 'Producers', 'Licensors', 'Studios', 'Source',
            'Duration', 'Rating', 'Rank', 'Popularity', 'Favorites', 'Scored_By', 'Members', 'Image_URL'
        ];
        let columnTypes = ['FLOAT', 'VARCHAR(255)', 'VARCHAR(255)', 'TEXT', 'DECIMAL(3,2)', 'VARCHAR(255)',
            'TEXT', 'VARCHAR(255)', 'FLOAT', 'VARCHAR(255)', 'VARCHAR(255)', 'VARCHAR(255)', 'TEXT', 'TEXT', 
            'TEXT', 'VARCHAR(255)', 'VARCHAR(255)', 'VARCHAR(255)', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT',
            'FLOAT', 'VARCHAR(255)'
        ]
        await importCsvToDb(filePath, tableName, columns, columnTypes);
        filePath = 'C:\\Program Files\\PostgreSQL\\16\\data\\anime-filtered.csv';
        tableName = 'anime_data_filtered';
        columns = ['anime_id', 'Name', 'Score', 'Genres', 'English_name', 'Japanese_name', 'sypnopsis', 'Type',
            'Episodes', 'Aired', 'Premiered', 'Producers', 'Licensors', 'Studios', 'Source', 'Duration', 'Rating',
            'Ranked', 'Popularity', 'Members', 'Favorites', 'Watching', 'Completed', 'On_Hold', 'Dropped'
        ]
        columnTypes = ['INTEGER', 'VARCHAR(255)', 'DECIMAL(3,2)', 'VARCHAR(255)', 'VARCHAR(255)', 'VARCHAR(255)',
            'TEXT', 'VARCHAR(50)', 'FLOAT', 'VARCHAR(50)', 'VARCHAR(50)', 'TEXT', 'TEXT', 'TEXT', 'VARCHAR(50)',
            'VARCHAR(50)', 'VARCHAR(50)', 'FLOAT', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER',
            'INTEGER'
        ]
        await importCsvToDb(filePath, tableName, columns, columnTypes);

        filePath = 'C:\\Program Files\\PostgreSQL\\16\\data\\final_animedataset.csv';
        tableName = 'user_rating_origin';
        columns = ['username', 'anime_id', 'my_score', 'user_id', 'gender', 'title', 'type', 'source', 'score', 'scored_by',
            'rank', 'popularity', 'genre'
        ]
        columnTypes = ['VARCHAR(255)', 'INTEGER', 'INTEGER', 'INTEGER', 'VARCHAR(10)', 'VARCHAR(255)', 'VARCHAR(50)',
            'VARCHAR(50)', 'DECIMAL(3,2)', 'INTEGER', 'FLOAT', 'INTEGER', 'VARCHAR(255)']
        await importCsvToDb(filePath, tableName, columns, columnTypes);

        filePath = 'C:\\Program Files\\PostgreSQL\\16\\data\\user-filtered.csv';
        tableName = 'user_rating';
        columns = ['username', 'anime_id', 'rating']
        columnTypes = ['INTEGER', 'INTEGER', 'INTEGER']
        await importCsvToDb(filePath, tableName, columns, columnTypes);

        filePath = 'C:\\Program Files\\PostgreSQL\\16\\data\\users-details-2023.csv';
        tableName = 'user_details';
        columns = ['Mal_ID', 'Username', 'Gender', 'Birthday', 'Location', 'Joined', 'Days_Watched', 'Mean_Score',
            'Watching', 'Completed', 'On Hold', 'Dropped', 'Plan_to_Watch', 'Total_Entries', 'Rewatched', 'Episodes_Watched',
        ]
        columnTypes = ['INTEGER', 'VARCHAR(255)', 'VARCHAR(50)', 'TIMESTAMP', 'VARCHAR(255)', 'TIMESTAMP', 'FLOAT', 'FLOAT',
            'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT']
        await importCsvToDb(filePath, tableName, columns, columnTypes);

        filePath = 'C:\\Program Files\\PostgreSQL\\16\\data\\users-score-2023.csv';
        tableName = 'user_rating_with_name';
        columns = ['user_id', 'Username', 'anime_id', 'Anime_Title', 'rating']
        columnTypes = ['INTEGER', 'VARCHAR(255)', 'INTEGER', 'VARCHAR(255)', 'INTEGER']
        await importCsvToDb(filePath, tableName, columns, columnTypes);

      } catch (error) {
        console.error('init db with csv fail:', error);
        res.status(500).json({ message: 'init db with csv fail'});
      }
});

export default router;


