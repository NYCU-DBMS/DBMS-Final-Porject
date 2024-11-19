# Anime Information Website

## Overview

現代化、高互動性的動畫資料整合網站，具有分類、檢索、評價、登入、收藏清單等功能，讓使用者能夠更方便找到感興趣的動畫。

## 啟動流程:
### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend

撰寫時請統一使用小駝峰命名函數

請先安裝PostgreSQL 16.4，option都照預設就好
選application時，選Web Devlopment的2.4.58-2
然後進去PGAdmin在PostgreSQL 16的server上面創一個test的資料庫
(可以到http://localhost:8000/dbtest/connection看有沒有連上)

```bash
cd Backend
npm install
npm run dev
```

### DataBase
建立資料庫：
```sql
CREATE DATABASE IF NOT EXISTS dbms_final;
USE dbms_final;

CREATE TABLE Users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

新增一個管理員帳號 (暫無特權) ：
```sql
use dbms_final;
INSERT INTO Users (id, username, email, password) 
VALUES (UUID(), 'admin', 'admin', '$2a$10$rD872rosLum4f6TsXtkC6e0H40.7g6YMlqfkKMlLNg6E0rXB3wPZK');
select * from Users;
```
