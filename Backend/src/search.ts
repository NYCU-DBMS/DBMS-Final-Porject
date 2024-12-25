import express from 'express';
import { query } from './db.js';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/Hard', async  (req: any, res: any) => {
    try {
        const {keyword, sort} = req.query
        if(!keyword || !sort){
            return res.status(400).json({error: "search/Hard: No keyword or sort"});
        }

        if (sort != 'score_asc' && sort != "score_desc" && sort != "year_asc" && sort != "year_desc"){
            return res.status(400).json({error: "search/Hard: sort format error!!!"});
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
            console.error("search/Hard: Serch SQL error");
            console.error(error)
            return res.status(500).json({ success: false, message: 'search/Hard: Serch SQL error' });
        }
        try{
            const id = result.rows[0].anime_id;
            return res.status(200).json({ ID: id });            
        } catch(error){
            return res.status(200).json({});
        }


      } catch (error) {
        console.error('search/Hard: error:', error);
        res.status(500).json({ success: false, message: `search/Hard: error: ${error}` });
      }
});

router.get('/Soft', async  (req: any, res: any) => {
    try {
        const {keyword, sort} = req.query
        if(!keyword || !sort){
            return res.status(400).json({error: "search/Soft: No keyword or sort"});
        }

        if (sort != 'score_asc' && sort != "score_desc" && sort != "year_asc" && sort != "year_desc"){
            return res.status(400).json({error: "search/Soft: sort format error!!!"});
        }

        let sortBy, sortOrder;
        if(sort == 'score_asc')
            sortBy = "Score", sortOrder = "ASC";
        else if(sort == 'score_desc')
            sortBy = "Score", sortOrder = "DESC";
        else if(sort == 'year_asc')
            // Apr 3, 1998 to Apr 24, 1999 -> Apr 3, 1998 按照 Mon DD, YYYY的format轉成日期
            sortBy = "TO_DATE(SUBSTRING(Aired FROM '^(.+) to'), 'Mon DD, YYYY')", sortOrder = "ASC";
        else if(sort == 'year_desc')
            sortBy = "TO_DATE(SUBSTRING(Aired FROM '^(.+) to'), 'Mon DD, YYYY')", sortOrder = "DESC";
        const searchSQL = `
            SELECT anime_id, "Name"
            FROM anime_data_filtered
            WHERE "Name" LIKE '%${keyword}%'
            ORDER BY "${sortBy}" ${sortOrder};
        `
        let result: QueryResult;
        try{
            result = await query(searchSQL, []);
        } catch (error){
            console.error("search/Soft: Serch SQL error");
            console.error(error)
            return res.status(500).json({ success: false, message: 'search/Soft: Serch SQL error' });
        }
        const ids = result.rows.map(row => row.anime_id); // map 是遍歷陣列
        const names = result.rows.map(row => row.Name);
        return res.status(200).json({ ID: ids , Name: names});

      } catch (error) {
        console.error('search/Soft: error:', error);
        res.status(500).json({ success: false, message: `search/Soft: error: ${error}` });
      }
});

export default router;