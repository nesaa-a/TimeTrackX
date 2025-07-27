// db/db.js
const sqlConfig = {
    user: 'EMRI_USER',
    password: 'FJALEKALIMI',
    database: 'TimeTrackX',
    server: 'localhost',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
module.exports = sqlConfig;
