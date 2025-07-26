// server/index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const sql     = require('mssql');

// Import middleware and routers
const { authenticateToken }       = require('./middlewares/auth');
const authRoutes                  = require('./routes/auth');
const departmentRoutes            = require('./routes/departments');
const employeeRoutes              = require('./routes/employees');
const projectRoutes               = require('./routes/projects');
const roleRoutes                  = require('./routes/roles');
const workhourRoutes              = require('./routes/workhours');
const userRoutes                  = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

// Public routes (no authentication required)
app.use('/', authRoutes);

// Protect all subsequent routes with JWT
app.use(authenticateToken);

// Protected CRUD routes
app.use('/departments', departmentRoutes);
app.use('/employees',  employeeRoutes);
app.use('/projects',   projectRoutes);
app.use('/roles',      roleRoutes);
app.use('/workhours',  workhourRoutes);
app.use('/users',      userRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));

// Database configuration from .env
const config = {
  user:     process.env.AUTH_USER,
  password: process.env.AUTH_PASS,
  server:   process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: { encrypt: false, trustServerCertificate: true }
};

// Connect to SQL Server and start Express server
sql.connect(config)
  .then(() => {
    console.log('✅ Connected to SQL Server');
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ SQL Server connection error:', err);
    process.exit(1);
  });


// Endpoint për login (generon JWT)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await new sql.Request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @username');
    const user = result.recordset[0];
    if (!user) return res.status(401).send('Invalid credentials');
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ userId: user.UserId, roleId: user.RoleId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Mbrohen të gjitha rutat pas këtij middleware
app.use(authenticateToken);

// Endpoint bazë për test (opsional)
app.get('/', (req, res) => res.send('🚀 TimeTrackX API po funksionon!'));  