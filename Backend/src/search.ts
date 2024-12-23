import express from 'express';
import { query } from './db.js';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/Hard', async  (req: any, res: any) => {
    try {
        const {keyword, sort} = req.query
        if(!keyword || !sort){
            return res.status(400).json({error: "No keyword or sort"});
        }

        if (sort != 'score_asc' && sort != "score_desc" && sort != "year_asc" && sort != "year_desc"){
            return res.status(400).json({error: "sort format error!!!"});
        }

        let sort_by, sort_order;
        if(sort == 'score_asc')
            sort_by = "Score", sort_order = "ASC";
        else if(sort == 'score_desc')
            sort_by = "Score", sort_order = "DESC";
        else if(sort == 'year_asc')
            // Apr 3, 1998 to Apr 24, 1999 -> Apr 3, 1998 按照 Mon DD, YYYY的format轉成日期
            sort_by = "TO_DATE(SUBSTRING(Aired FROM '^(.+) to'), 'Mon DD, YYYY')", sort_order = "ASC";
        else if(sort == 'year_desc')
            sort_by = "TO_DATE(SUBSTRING(Aired FROM '^(.+) to'), 'Mon DD, YYYY')", sort_order = "DESC";
        const searchSQL = `
            SELECT anime_id
            FROM anime_data_filtered
            WHERE "Name" LIKE '${keyword}'
            ORDER BY "${sort_by}" ${sort_order};
        `
        let result: QueryResult;
        try{
            result = await query(searchSQL, []);
        } catch (error){
            console.error("Hard Serch SQL error");
            console.error(error)
            return res.status(500).json({ success: false, message: 'Hard Serch SQL error' });
        }
        const id = result.rows[0].anime_id;
        return res.status(200).json({ ID: id });

      } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ success: false, message: 'Database connection error' });
      }
});

router.get('/Soft', async  (req: any, res: any) => {
    try {
        const {keyword, sort} = req.query
        if(!keyword || !sort){
            return res.status(400).json({error: "No keyword or sort"});
        }

        if (sort != 'score_asc' && sort != "score_desc" && sort != "year_asc" && sort != "year_desc"){
            return res.status(400).json({error: "sort format error!!!"});
        }

        let sort_by, sort_order;
        if(sort == 'score_asc')
            sort_by = "Score", sort_order = "ASC";
        else if(sort == 'score_desc')
            sort_by = "Score", sort_order = "DESC";
        else if(sort == 'year_asc')
            // Apr 3, 1998 to Apr 24, 1999 -> Apr 3, 1998 按照 Mon DD, YYYY的format轉成日期
            sort_by = "TO_DATE(SUBSTRING(Aired FROM '^(.+) to'), 'Mon DD, YYYY')", sort_order = "ASC";
        else if(sort == 'year_desc')
            sort_by = "TO_DATE(SUBSTRING(Aired FROM '^(.+) to'), 'Mon DD, YYYY')", sort_order = "DESC";
        const searchSQL = `
            SELECT anime_id, "Name"
            FROM anime_data_filtered
            WHERE "Name" LIKE '%${keyword}%'
            ORDER BY "${sort_by}" ${sort_order};
        `
        let result: QueryResult;
        try{
            result = await query(searchSQL, []);
        } catch (error){
            console.error("Soft Serch SQL error");
            console.error(error)
            return res.status(500).json({ success: false, message: 'Soft Serch SQL error' });
        }
        const ids = result.rows.map(row => row.anime_id); // map 是遍歷陣列
        const names = result.rows.map(row => row.Name);
        return res.status(200).json({ ID: ids , Name: names});

      } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ success: false, message: 'Database connection error' });
      }
});

export default router;