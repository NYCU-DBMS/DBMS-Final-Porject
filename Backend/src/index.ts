import express from 'express'
import { query } from './db.js';
import db_test from './db_test.js';
import db_init from './db_init.js';
import dotenv from 'dotenv';

dotenv.config();
// query用法: await query('SQL內容', [參數1, 參數2])，參數會取代sql中的$1, $2等等，可以是整數、字串...
// 記得要await才能確保查詢完再做下一動，有用到await的function，要加async在前面

const port = 8000

const app = express()



app.get("/", (req: any, res: any) => {
	res.send('Hello world')
	console.log('Database config:', {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE
	  });
})

app.listen(port, () => {
	console.log(`Now listening port ${port}`)
})

app.use('/dbtest', db_test)
app.use('/dbinit', db_init)