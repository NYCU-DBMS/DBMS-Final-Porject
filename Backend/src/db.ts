import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import csvParser from 'csv-parser';
import * as readline from 'readline';

dotenv.config();

const pool = new Pool({ // manager of connection, will init several connection to be acquired
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: String(process.env.DB_USER),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// each query will acquire a connection automatically (each query may in different connection)
export const query = (text: any, params: any) => pool.query(text, params);

/*
export const processCSVHeaders = (inputPath: string, outputPath: string) => {
  console.log(`Processing ${inputPath}`);

  const readStream = fs.createReadStream(inputPath, 'utf8');
  const writeStream = fs.createWriteStream(outputPath, 'utf8');

  const rl = readline.createInterface({
    input: readStream,
    output: writeStream,
    terminal: false
  });

  let isFirstLine = true;

  rl.on('line', (line) => {
    if (isFirstLine) {
      // 處理表頭（第一行）
      const newHeader = line.replace(/ /g, '_'); // 替換空格為下劃線
      writeStream.write(newHeader + '\n'); // 寫入修改過的表頭
      isFirstLine = false; // 已經處理過表頭
    } else {
      // 直接寫入其他行
      writeStream.write(line + '\n');
    }
  });

  rl.on('close', () => {
    console.log('CSV header processed successfully!');
  });

  rl.on('error', (err) => {
    console.error('Error processing file:', err);
  });
};*/

const parseCsvFile = (client: any, filePath: string, tableName: string, columns: Array<string>, columnTypes: Array<string>): Promise<any> => {
  return new Promise((resolve, reject) => {
    const promises: Array<Promise<any>> = []; // 存储每行的插入操作
    const batch: Array<string> = []; // 用于存储当前批次的 SQL 插入语句
    let idx = 0
    fs.createReadStream(filePath, {highWaterMark: 256}) // create file string to analyze csv data
    .pipe(csvParser())
    .on('data', (row) => {
      idx++;
      // console.log('row: ', idx);
      const values = columns.map((col) => {
        const value = row[col];
      
        // 檢查 row[col] 是否為 undefined 或 null
        if (value === undefined || value === null || value === 'Unknown' || value === 'UNKNOWN' || value === '') {
          return "NULL"; // 如果值是 undefined 或 null，使用 SQL 中的 NULL
        } else if (typeof value === 'string') {
          // 處理字符串，轉義單引號
          return `'${value.replace(/'/g, "''")}'`;
        } else {
          // 如果是數字或其他類型，直接返回該值
          return value;
        }
      }).join(', '); // 使用逗號分隔每個處理過的值

      const queryText = `
      INSERT INTO ${tableName} ("${columns.join('", "')}")
      VALUES (${values})
      `;
      client.query(queryText); // 每次插入数据时，存储到 promises 中
    })
    .on('end', async () => {
      console.log(`${tableName}: Analysis end. There are ${idx} rows`);
      resolve('')
    })
    .on('error', (err) => {
      console.error('Error while parsing CSV file:', err);
      reject(err); // 解析失败，抛出错误
    });
  });
}

// 導入 CSV
export const importCsvToDb = async (filePath: string, tableName: string, columns: Array<string>, columnTypes: Array<string>) => {
  const client = await pool.connect(); // acquire a connection, all SQL will be done in this connection
  try {

    await client.query('BEGIN'); // BEGIN可以保證接下來的操作同時成功or失敗，如果中途失敗，就會復原前面的操作
    console.log(`Begin importing ${filePath} to ${tableName}...`);

    const checkTableQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables 
        WHERE table_name = $1
      );
    `;

    const res = await client.query(checkTableQuery, [tableName]);

    if (res.rows[0].exists) {
      console.log(`${tableName}: Table "${tableName}" already exists. Stopping function.`);
      return;  // 表格存在，停止執行
    }
    else{
      console.log(`${tableName}: Table "${tableName}" not exists.`);
    }

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${columns.map((col, idx) => `"${col}" ${columnTypes[idx]}`).join(', \n')}
    );`;
    await client.query(createTableQuery);
    console.log(`${tableName}: Table ${tableName} created`);

    // const _ = await parseCsvFile(client, filePath, tableName, columns, columnTypes)

    const copyCSVQuery = `
      COPY ${tableName}
      FROM '${filePath}'
      WITH (FORMAT CSV, HEADER, NULL '');
    `;
    await client.query(copyCSVQuery);

    await client.query('COMMIT'); // COMMIT上去，BEGIN到COMMIT之間的SQL操作才會生效
    console.log(`${tableName}: Import CSV successfully`);

  } catch (err) {
    // 發生錯誤時回滾事務
    await client.query('ROLLBACK');
    console.error('導入過程中發生錯誤:', err);
  } finally {
    client.release();
  }
};

