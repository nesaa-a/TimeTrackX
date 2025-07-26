const bcrypt = require('bcrypt');
const pw = 'Admin123!';       // your desired password
bcrypt.hash(pw, 10).then(console.log);
