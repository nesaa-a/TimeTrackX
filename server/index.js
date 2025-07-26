// server/index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const sql     = require('mssql');

// Import JWT middleware and routers
const { authenticateToken } = require('./middlewares/auth');
const authRoutes            = require('./routes/auth');        // defines POST /login & GET /users/me
const departmentRoutes      = require('./routes/departments');
const employeeRoutes        = require('./routes/employees');
const projectRoutes         = require('./routes/projects');
const roleRoutes            = require('./routes/roles');
const workhourRoutes        = require('./routes/workhours');
const userRoutes            = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', authRoutes);          
app.get('/health', (req, res) => res.send('OK'));  
app.use(authenticateToken);

// Protected CRUD routes
app.use('/departments', departmentRoutes);
app.use('/employees',  employeeRoutes);
app.use('/projects',   projectRoutes);
app.use('/roles',      roleRoutes);
app.use('/workhours',  workhourRoutes);
app.use('/users',      userRoutes);

const config = {
  user:     process.env.AUTH_USER,
  password: process.env.AUTH_PASS,
  server:   process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

sql.connect(config)
  .then(() => {
    console.log('✅ Connected to SQL Server');
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`🚀 Server listening on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ SQL Server connection error:', err);
    process.exit(1);
  });