import express from 'express';
import { query } from './db';  // 移除 .js
import db_test from './db_test';  // 移除 .js
import db_init from './db_init';  // 移除 .js
import search from './search';
import favorite from './favorite';
import comment from './comment';
//import { authRoutes } from './routes/authRoutes';  // 移除 .js 並使用具名導入
import { animeRoutes } from './routes/animeRoutes';  //anime api
import { categoryRoutes } from './routes/categoryRoutes'; //category api
import { loginregRoutes } from './routes/loginregRoutes'; //login register modify account api
import { scoreRoutes } from './routes/scoreRoutes';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const port = 8000;
const app = express();

// 中間件設置
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基本路由
app.get("/", (req, res) => {
  res.send('Hello world');
  console.log('Database config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });
});

// API 路由
app.use('/api/auth', loginregRoutes);
app.use('/dbtest', db_test);
app.use('/dbinit', db_init);
app.use('/api/anime', animeRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/score', scoreRoutes)
app.use('/api/search', search);
app.use('/api/favorite', favorite);
app.use('/api/comment', comment);

app.listen(port, () => {
  console.log(`Now listening port ${port}`);
});