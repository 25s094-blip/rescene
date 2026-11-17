const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',      // 'localhost' 대신 '127.0.0.1'로 변경!
  port: 3306,             // Workbench에 뜬 포트가 3306이 아니면 그 숫자로 변경
  user: 'root',
  password: '',           // 포터블 MySQL 비밀번호가 있으면 입력
  database: 'h_20609',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;