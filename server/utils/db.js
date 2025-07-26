// server/utils/db.js
// Ky modul krijon dhe raporton një ConnectionPool për MSSQL

const sql = require('mssql');

// Lexojmë konfigurimin nga .env
const dbConfig = {
  user:     process.env.AUTH_USER,
  password: process.env.AUTH_PASS,
  server:   process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Krijojmë pool-in si Promise që lidhet kur niset serveri
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('🗄️  Database pool created');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database Connection Pool Error', err);
    throw err;
  });

module.exports = {
  sql,        // objekti mssql për të aksesuar tipat dhe funksionet
  poolPromise // promise që zgjidhet me ConnectionPool-in e lidhur
};
