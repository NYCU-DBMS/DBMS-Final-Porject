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

先從kaggle下載資料
然後把csv檔放到data資料夾底下
接著執行./data_preprocess/csv_preprocess.py
之後把處理過的資料(就是data的那一批)放到 C:\\Program Files\\PostgreSQL\\16\\data 底下

請先安裝PostgreSQL 16.4，option都照預設就好
選application時，選Web Devlopment的2.4.58-2
然後進去PGAdmin在PostgreSQL 16的postgres server按connect to server
接著創建Backend/.env，裡面輸入以下:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=*** (當初建資料庫的時候設的密碼)
DB_DATABASE=postgres
JWT_SECRET=***(隨便取)
```

```bash
cd Backend
npm install
npm run dev
```

(可以到http://localhost:8000/dbtest/connection 看有沒有連上資料庫)
(接著到http://localhost:8000/dbinit/importCSV 把CSV資料灌進資料庫，要等一段時間)
