import express from 'express';
import { query } from './db.js';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/Hard', async  (req: any, res: any) => {
    try {
        const {keyword} = req.query
        if(!keyword){
            return res.status(400).json({error: "search/Hard: No keyword or sort"});
        }

        const searchSQL = `
            SELECT anime_id
            FROM anime_data_filtered
            WHERE "Name" ILIKE '${keyword}'
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
            sortBy = "COALESCE(\"Score\", 0)", sortOrder = "ASC";
        else if(sort == 'score_desc')
            sortBy = "COALESCE(\"Score\", 0)", sortOrder = "DESC";
        else if(sort == 'year_asc'){
            // "Apr 3, 1998 to Apr 24, 1999" 或是 "Dec 21, 2012" -> Apr 3, 1998 按照 Mon DD, YYYY的format轉成日期
            sortBy = `
                CASE 
                    WHEN "Aired" ~ ' to ' THEN TO_DATE(SUBSTRING("Aired" FROM '^(.+) to'), 'Mon DD, YYYY')
                    WHEN "Aired" ~ ', ' THEN TO_DATE("Aired", 'Mon DD, YYYY')
                    ELSE TO_DATE('Jan 1, ' || "Aired", 'Mon DD, YYYY')
                END
            `;
            sortOrder = "ASC";
        }
        else if(sort == 'year_desc'){
            sortBy = `
                CASE 
                    WHEN "Aired" ~ ' to ' THEN TO_DATE(SUBSTRING("Aired" FROM '^(.+) to'), 'Mon DD, YYYY')
                    WHEN "Aired" ~ ', ' THEN TO_DATE("Aired", 'Mon DD, YYYY')
                    ELSE TO_DATE('Jan 1, ' || "Aired", 'Mon DD, YYYY')
                END
            `; 
            sortOrder = "DESC";
        }
        const searchSQL = `
            SELECT anime_id, "Name", "Score"
            FROM anime_data_filtered
            WHERE "Name" ILIKE '%${keyword}%' AND "Aired" ~ '^\\w{3} \\d{1,2}, \\d{4}'
            ORDER BY ${sortBy} ${sortOrder};
        `
        let result: QueryResult;
        try{
            result = await query(searchSQL, []);
            console.log(result);
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