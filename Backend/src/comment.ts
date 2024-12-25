import express from 'express';
import { query } from './db.js';
import { QueryResult } from 'pg';

const router = express.Router();

const checkCommentTableExist = async () => {
    const checkTableQuery = `
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables 
            WHERE table_name = 'Comment'
        );
    `;
    const checkResult : QueryResult = await query(checkTableQuery, []);
    // console.log(checkResult);
    if (!checkResult.rows[0].exists){
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS "Comment" (
                comment_id SERIAL,
                anime_id INTEGER,
                user_id INTEGER,
                username VARCHAR(255),
                content TEXT,
                PRIMARY KEY (comment_id)
            );
        `;
        await query(createTableQuery, []);
        console.log(`comment/checkTable: Table Favorites_List created`);
    } else {
        return 0;
    }
}

router.post('/add', async  (req: any, res: any) => {
    try {
        const {user_id, anime_id, content} = req.body
        if(!user_id || !anime_id || !content){
            return res.status(400).json({msg: "", error: "comment/add: No user_id or anime_id or content"});
        }

        await checkCommentTableExist();
        try{
            const getUsernameQuery = `
                SELECT "Username"
                FROM user_details
                WHERE "Mal_ID"=${user_id};
            `
            const getUsernameResult: QueryResult = await query(getUsernameQuery, []);
            if (getUsernameResult.rows.length==0){
                return res.status(400).json({error: "User ID not exist"});
            }
            const username = getUsernameResult.rows[0].Username;
            const addCommentQuery = `
                INSERT INTO "Comment" (anime_id, user_id, username, content)
                VALUES (${anime_id}, ${user_id}, '${username}', '${content}');
            `;
            await query(addCommentQuery, []);
            console.log("comment/add: Add success");
            return res.status(200).json({msg: "success", error: ""});       
        } catch(error){
            console.error('comment/add: Add SQL error: ', error);
            return res.status(400).json({msg: "", error: "comment/add: Add SQL error"});
        }

      } catch (error) {
        console.error('comment/add: error:', error);
        res.status(500).json({ msg: "", message: `comment/add: error: ${error}` });
      }
});

router.post('/get', async  (req: any, res: any) => {
    try {
        const {anime_id} = req.body
        if(!anime_id){
            return res.status(400).json({msg: "", error: "comment/get: No anime_id"});
        }

        await checkCommentTableExist();
        try{
            const getCommentQuery = `
                SELECT user_id, username, content, comment_id
                FROM "Comment"
                WHERE anime_id=${anime_id};
            `;
            const getCommentResult: QueryResult = await query(getCommentQuery, []);
            const user_id = getCommentResult.rows.map(row => row.user_id);
            const username = getCommentResult.rows.map(row => row.username);
            const content = getCommentResult.rows.map(row => row.content);
            const comment_id = getCommentResult.rows.map(row => row.comment_id);

            console.log("comment/get: get success");
            return res.status(200).json({user_id: user_id, username: username, content: content, comment_id: comment_id});       
        } catch(error){
            console.error('comment/get: Get SQL error: ', error);
            return res.status(400).json({msg: "", error: "comment/get: Get SQL error"});
        }

      } catch (error) {
        console.error('comment/get: error:', error);
        res.status(500).json({ msg: "", message: `comment/get: error: ${error}` });
      }
});

router.post('/deleteByID', async  (req: any, res: any) => {
    try {
        const {comment_id} = req.body
        if(!comment_id){
            return res.status(400).json({msg: "", error: "comment/deleteByID: No comment_id"});
        }

        await checkCommentTableExist();
        try{
            const deleteCommentQuery = `
                DELETE FROM "Comment"
                WHERE comment_id=${comment_id};
            `;
            await query(deleteCommentQuery, []);

            console.log("comment/deleteByID: delete success");
            return res.status(200).json({msg: "success", error: ""});       
        } catch(error){
            console.error('comment/deleteByID: deleteByID SQL error: ', error);
            return res.status(400).json({msg: "", error: "comment/deleteByID: deleteByID SQL error"});
        }

      } catch (error) {
        console.error('comment/deleteByID: error:', error);
        res.status(500).json({ msg: "", message: `comment/deleteByID: error: ${error}` });
      }
});


router.post('/deleteByInfo', async  (req: any, res: any) => {
    try {
        const {user_id, anime_id, content} = req.body
        if(!user_id || !anime_id || !content){
            return res.status(400).json({msg: "", error: "comment/deleteByInfo: No user_id or anime_id or content"});
        }

        await checkCommentTableExist();
        try{
            const deleteCommentQuery = `
                DELETE FROM "Comment"
                WHERE user_id=${user_id} AND anime_id=${anime_id} AND content='${content}';
            `;
            await query(deleteCommentQuery, []);

            console.log("comment/deleteByInfo: delete success");
            return res.status(200).json({msg: "success", error: ""});       
        } catch(error){
            console.error('comment/deleteByInfo: deleteByInfo SQL error: ', error);
            return res.status(400).json({msg: "", error: "comment/deleteByInfo: deleteByInfo SQL error"});
        }

      } catch (error) {
        console.error('comment/deleteByInfo: error:', error);
        res.status(500).json({ msg: "", message: `comment/deleteByInfo: error: ${error}` });
      }
});


export default router;
