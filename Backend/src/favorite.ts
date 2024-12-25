import express from 'express';
import { query } from './db.js';
import { QueryResult } from 'pg';
import dayjs from 'dayjs';

const router = express.Router();

router.post('/create', async  (req: any, res: any) => {
    try {
        console.log(req.body)
        const {user_id, list_title} = req.body
        if(!user_id || !list_title){
            return res.status(400).json({msg: "", error: "favorite/create: No user_id or list_title"});
        }

        const checkTableQuery = `
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables 
                WHERE table_name = 'Favorites_List'
            );
        `;

        const checkResult : QueryResult = await query(checkTableQuery, []);
        if (!checkResult.rows[0].exists){
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "Favorites_List" (
                user_id INTEGER,
                list_title VARCHAR(255),
                anime_id INTEGER,
                anime_title VARCHAR(255),
                favorited_date DATE,
                PRIMARY KEY (user_id, list_title, anime_id)
                );
            `;
            await query(createTableQuery, []);
            console.log(`favorite/create: Table Favorites_List created`);
        }

        let checkListResult: QueryResult;
        try{
            const checkListQuery = `
            SELECT EXISTS(
                SELECT *
                FROM "Favorites_List"
                WHERE user_id='${user_id}' AND list_title='${list_title}'
            );`;
            checkListResult = await query(checkListQuery, []);            
        } catch(error){
            console.error("favorite/create: check list exist or not fail, error: ", error);
            return res.status(400).json({msg: "", error: "favorite/create: check list exist or not fail"});
        }

        if (checkListResult.rows[0].exist){
            console.error('favorite/create: List to create has existed');
            return res.status(400).json({msg: "", error: "favorite/create: List to create has existed"});
        }
        else{
            try{
                const createListQuery = `
                    INSERT INTO "Favorites_List" (user_id, list_title, anime_id, anime_title, favorited_date)
                    VALUES (${user_id}, '${list_title}', -1, '-1', '1970-01-01');
                `;
                await query(createListQuery, []);  
                console.log("favorite/create: Create List Success!");
                return res.status(200).json({msg: "success", error: ""});              
            }catch(error){
                console.error("favorite/create: Create list fail, error: ", error);
                return res.status(400).json({msg: "", error: "favorite/create: Create list fail"});
            }

        }
      } catch (error) {
        console.error('favorite/create: error:', error);
        res.status(500).json({ msg: "", message: `favorite/create: error: ${error}` });
      }
});


router.post('/insert', async  (req: any, res: any) => {
    try {
        const {user_id, list_title, anime_id} = req.body
        if(!user_id || !list_title || !anime_id){
            return res.status(400).json({msg: "", error: "favorite/insert: No user_id or list_title or anime_id"});
        }

        let checkListResult: QueryResult;
        try{
            const checkListQuery = `
            SELECT EXISTS(
                SELECT *
                FROM "Favorites_List"
                WHERE user_id=${user_id} AND list_title='${list_title}'
            );`;
            checkListResult = await query(checkListQuery, []);            
        } catch(error){
            console.error("favorite/insert: check list exist or not fail, error: ", error);
            return res.status(400).json({msg: "", error: "favorite/insert: check list exist or not fail"});
        }
        if (checkListResult.rows[0].exists){
            try{
                const animeNameQuery = `
                    SELECT "Name"
                    FROM anime_data_filtered
                    WHERE anime_id=${anime_id};
                `
                const animeNameResult: QueryResult = await query(animeNameQuery, []);
                if(animeNameResult.rows.length == 0){
                    return res.status(400).json({msg: "", error: "anime not exist"});  
                }
                const anime_name = animeNameResult.rows[0].Name;
                const now = dayjs();
                const formattedDate = now.format('YYYY-MM-DD');
                const insertQuery = `
                INSERT INTO "Favorites_List" (user_id, list_title, anime_id, anime_title, favorited_date)
                VALUES (${user_id}, '${list_title}', ${anime_id}, '${anime_name}', '${formattedDate}');
                `;
                console.log(insertQuery)
                await query(insertQuery, []);        
                console.log("favorite/insert: insert success");
                return res.status(200).json({msg: "success", error: ""});       
            } catch(error){
                console.error('favorite/insert: Insert SQL error: ', error);
                return res.status(400).json({msg: "", error: "favorite/insert: Insert SQL error or anime repeat"});
            }

        }
        else{
            console.error('favorite/insert: List not exist');
            return res.status(400).json({msg: "", error: "favorite/insert: List not exist"});
        }
      } catch (error) {
        console.error('favorite/insert: error:', error);
        res.status(500).json({ msg: "", message: `favorite/insert: error: ${error}` });
      }
});

router.post('/deleteList', async  (req: any, res: any) => {
    try {
        const {user_id, list_title} = req.body
        if(!user_id || !list_title){
            return res.status(400).json({msg: "", error: "favorite/deleteList: No user_id or list_title"});
        }

        let checkListResult: QueryResult;
        try{
            const checkListQuery = `
            SELECT EXISTS(
                SELECT *
                FROM "Favorites_List"
                WHERE user_id=${user_id} AND list_title='${list_title}'
            );`;
            checkListResult = await query(checkListQuery, []);            
        } catch(error){
            console.error("favorite/deleteList: check list exist or not fail, error: ", error);
            return res.status(400).json({msg: "", error: "favorite/deleteList: check list exist or not fail"});
        }

        if (checkListResult.rows[0].exists){
            try{
                const deleteQuery = `
                    DELETE FROM "Favorites_List"
                    WHERE user_id=${user_id} AND list_title='${list_title}';
                `;
                await query(deleteQuery, []);        
                console.log("favorite/deleteList: Delete success");
                return res.status(200).json({msg: "success", error: ""});       
            } catch(error){
                console.error('favorite/deleteList: Delete SQL error');
                return res.status(400).json({msg: "", error: "favorite/deleteList: Delete SQL error"});
            }

        }
        else{
            console.error('favorite/deleteList: List not exist');
            return res.status(400).json({msg: "", error: "favorite/deleteList: List not exist"});
        }
      } catch (error) {
        console.error('favorite/deleteList: error:', error);
        res.status(500).json({ msg: "", message: `favorite/deleteList: error: ${error}` });
      }
});

router.post('/deleteAnime', async  (req: any, res: any) => {
    try {
        const {user_id, list_title, anime_id} = req.body
        if(!user_id || !list_title || !anime_id){
            return res.status(400).json({msg: "", error: "favorite/deleteAnime: No user_id or list_title or anime_id"});
        }

        let checkListResult: QueryResult;
        try{
            const checkListQuery = `
            SELECT EXISTS(
                SELECT *
                FROM "Favorites_List"
                WHERE user_id=${user_id} AND list_title='${list_title}'
            );`;
            checkListResult = await query(checkListQuery, []);            
        } catch(error){
            console.error("favorite/deleteAnime: check list exist or not fail, error: ", error);
            return res.status(400).json({msg: "", error: "favorite/deleteAnime: check list exist or not fail"});
        }

        if (checkListResult.rows[0].exists){
            try{
                const deleteQuery = `
                    DELETE FROM "Favorites_List"
                    WHERE user_id=${user_id} AND list_title='${list_title}' AND anime_id=${anime_id};
                `;
                await query(deleteQuery, []);        
                console.log("favorite/deleteAnime: Delete anime success");
                return res.status(200).json({msg: "success", error: ""});       
            } catch(error){
                console.error('favorite/deleteAnime: Delete anime SQL error');
                return res.status(400).json({msg: "", error: "favorite/deleteAnime: Delete anime SQL error"});
            }

        }
        else{
            console.error('favorite/deleteAnime: List not exist');
            return res.status(400).json({msg: "", error: "favorite/deleteAnime: List not exist"});
        }
      } catch (error) {
        console.error('favorite/deleteAnime: error:', error);
        res.status(500).json({ msg: "", message: `favorite/deleteAnime: error: ${error}` });
      }
});

router.post('/getList', async  (req: any, res: any) => {
    try {
        const {user_id, list_title} = req.body
        if(!user_id || !list_title){
            return res.status(400).json({msg: "", error: "favorite/getList: No user_id or list_title"});
        }

        let checkListResult: QueryResult;
        try{
            const checkListQuery = `
            SELECT EXISTS(
                SELECT *
                FROM "Favorites_List"
                WHERE user_id=${user_id} AND list_title='${list_title}'
            );`;
            checkListResult = await query(checkListQuery, []);            
        } catch(error){
            console.error("favorite/getList: check list exist or not fail, error: ", error);
            return res.status(400).json({msg: "", error: "favorite/getList: check list exist or not fail"});
        }

        if (checkListResult.rows[0].exists){
            try{
                const getQuery = `
                    SELECT *
                    FROM "Favorites_List"
                    WHERE user_id=${user_id} AND list_title='${list_title}' AND anime_id<>-1;
                `;
                const getResult: QueryResult = await query(getQuery, []);
                const anime_ids = getResult.rows.map(row => row.anime_id);
                const anime_titles = getResult.rows.map(row => row.anime_title)
                console.log("favorite/getList: getList success");
                return res.status(200).json({anime_id: anime_ids, anime_name: anime_titles});       
            } catch(error){
                console.error('favorite/getList: getList SQL error');
                return res.status(400).json({msg: "", error: "favorite/getList: getList SQL error"});
            }

        }
        else{
            console.error('favorite/getList: List not exist');
            return res.status(400).json({msg: "", error: "favorite/getList: List not exist"});
        }
      } catch (error) {
        console.error('favorite/getList: error:', error);
        res.status(500).json({ msg: "", message: `favorite/getList: error: ${error}` });
      }
});

export default router;
