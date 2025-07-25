// server/index.js
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  user: process.env.AUTH_USER,
  password: process.env.AUTH_PASS,
  server: 'localhost',
  database: 'TimeTrackX',
  options: { encrypt: false, trustServerCertificate: true }
};

// 1) Lidhja me SQL Server dhe start i server-it
sql.connect(config)
  .then(() => {
    console.log('✅ Lidhja me SQL Server u realizua!');
    app.listen(8080, () =>
      console.log('🚀 Server po dëgjon në http://localhost:8080')
    );
  })
  .catch(err => console.error('❌ Gabim gjatë lidhjes:', err));

// 2) Middleware për JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 3) Login (merr JWT)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // hyn nga tabela Users
  try {
    const r = await new sql.Request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @username');
    const user = r.recordset[0];
    if (!user) return res.status(401).send('Invalid credentials');
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ userId: user.UserId, roleId: user.RoleId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// --- Mbrohen të gjitha rutat pas këtij rreshti ---
app.use(authenticateToken);

/* =======================
   4) Departments CRUD
   ======================= */
app.get('/departments', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Departments');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/departments/:id', async (req, res) => {
  const { id } = req.params;
  const r = await new sql.Request().input('id', sql.Int, id)
    .query('SELECT * FROM Departments WHERE DepartmentId = @id');
  if (!r.recordset.length) return res.status(404).send('Not found');
  res.json(r.recordset[0]);
});

app.post('/departments', async (req, res) => {
  const { Name, Description } = req.body;
  const r = await new sql.Request()
    .input('Name', sql.NVarChar(100), Name)
    .input('Description', sql.NVarChar(255), Description)
    .query(`
      INSERT INTO Departments (Name, Description)
      VALUES (@Name, @Description);
      SELECT SCOPE_IDENTITY() AS DepartmentId;
    `);
  res.status(201).json({ DepartmentId: r.recordset[0].DepartmentId });
});

app.put('/departments/:id', async (req, res) => {
  const { id } = req.params;
  const { Name, Description } = req.body;
  await new sql.Request()
    .input('id', sql.Int, id)
    .input('Name', sql.NVarChar(100), Name)
    .input('Description', sql.NVarChar(255), Description)
    .query(`
      UPDATE Departments
      SET Name=@Name, Description=@Description
      WHERE DepartmentId=@id
    `);
  res.sendStatus(204);
});

app.delete('/departments/:id', async (req, res) => {
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .query('DELETE FROM Departments WHERE DepartmentId=@id');
  res.sendStatus(204);
});


/* =======================
   5) Employees CRUD
   ======================= */
app.get('/employees', async (req, res) => {
  const { search = '', page=1, limit=10 } = req.query;
  const offset = (page-1)*limit;
  const pattern = `%${search}%`;
  // count
  const cnt = await new sql.Request()
    .input('pattern', sql.NVarChar, pattern)
    .query(`
      SELECT COUNT(*) AS total
      FROM Employees
      WHERE FirstName LIKE @pattern
         OR LastName  LIKE @pattern
         OR Position  LIKE @pattern
    `);
  // data
  const data = await new sql.Request()
    .input('pattern', sql.NVarChar, pattern)
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, parseInt(limit))
    .query(`
      SELECT * FROM Employees
      WHERE FirstName LIKE @pattern
         OR LastName  LIKE @pattern
         OR Position  LIKE @pattern
      ORDER BY Id
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);
  res.json({ total: cnt.recordset[0].total, page:+page, limit:+limit, data: data.recordset });
});

app.get('/employees/:id', async (req, res) => {
  const r = await new sql.Request().input('id', sql.Int, req.params.id)
    .query('SELECT * FROM Employees WHERE Id=@id');
  if (!r.recordset.length) return res.status(404).send('Not found');
  res.json(r.recordset[0]);
});

app.post('/employees', async (req, res) => {
  const { FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId } = req.body;
  const r = await new sql.Request()
    .input('FirstName', sql.NVarChar(100), FirstName)
    .input('LastName',  sql.NVarChar(100), LastName)
    .input('Email',     sql.NVarChar(100), Email)
    .input('Position',  sql.NVarChar(100), Position)
    .input('Salary',    sql.Decimal(10,2), Salary)
    .input('HireDate',  sql.Date, HireDate)
    .input('DepartmentId', sql.Int, DepartmentId)
    .query(`
      INSERT INTO Employees
      (FirstName,LastName,Email,Position,Salary,HireDate,DepartmentId)
      VALUES
      (@FirstName,@LastName,@Email,@Position,@Salary,@HireDate,@DepartmentId);
      SELECT SCOPE_IDENTITY() AS Id;
    `);
  res.status(201).json({ Id: r.recordset[0].Id });
});

app.put('/employees/:id', async (req, res) => {
  const { FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId } = req.body;
  await new sql.Request()
    .input('Id', sql.Int, req.params.id)
    .input('FirstName', sql.NVarChar(100), FirstName)
    .input('LastName',  sql.NVarChar(100), LastName)
    .input('Email',     sql.NVarChar(100), Email)
    .input('Position',  sql.NVarChar(100), Position)
    .input('Salary',    sql.Decimal(10,2), Salary)
    .input('HireDate',  sql.Date, HireDate)
    .input('DepartmentId', sql.Int, DepartmentId)
    .query(`
      UPDATE Employees SET
        FirstName=@FirstName, LastName=@LastName,
        Email=@Email, Position=@Position,
        Salary=@Salary, HireDate=@HireDate,
        DepartmentId=@DepartmentId
      WHERE Id=@Id
    `);
  res.sendStatus(204);
});

app.delete('/employees/:id', async (req, res) => {
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .query('DELETE FROM Employees WHERE Id=@id');
  res.sendStatus(204);
});


/* =======================
   6) Projects CRUD
   ======================= */
app.get('/projects', async (req, res) => {
  const r = await sql.query('SELECT * FROM Projects');
  res.json(r.recordset);
});
app.get('/projects/:id', async (req, res) => {
  const r = await new sql.Request().input('id', sql.Int, req.params.id)
    .query('SELECT * FROM Projects WHERE ProjectId=@id');
  if (!r.recordset.length) return res.status(404).send('Not found');
  res.json(r.recordset[0]);
});
app.post('/projects', async (req, res) => {
  const { Name, Description, StartDate, EndDate } = req.body;
  const r = await new sql.Request()
    .input('Name', sql.NVarChar(100), Name)
    .input('Description', sql.NVarChar(255), Description)
    .input('StartDate', sql.Date, StartDate)
    .input('EndDate', sql.Date, EndDate)
    .query(`
      INSERT INTO Projects (Name,Description,StartDate,EndDate)
      VALUES (@Name,@Description,@StartDate,@EndDate);
      SELECT SCOPE_IDENTITY() AS ProjectId;
    `);
  res.status(201).json({ ProjectId: r.recordset[0].ProjectId });
});
app.put('/projects/:id', async (req, res) => {
  const { Name, Description, StartDate, EndDate } = req.body;
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .input('Name', sql.NVarChar(100), Name)
    .input('Description', sql.NVarChar(255), Description)
    .input('StartDate', sql.Date, StartDate)
    .input('EndDate', sql.Date, EndDate)
    .query(`
      UPDATE Projects
      SET Name=@Name,Description=@Description,StartDate=@StartDate,EndDate=@EndDate
      WHERE ProjectId=@id
    `);
  res.sendStatus(204);
});
app.delete('/projects/:id', async (req, res) => {
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .query('DELETE FROM Projects WHERE ProjectId=@id');
  res.sendStatus(204);
});


/* =======================
   7) Roles CRUD
   ======================= */
app.get('/roles', async (req, res) => {
  const r = await sql.query('SELECT * FROM Roles');
  res.json(r.recordset);
});
app.get('/roles/:id', async (req, res) => {
  const r = await new sql.Request().input('id', sql.Int, req.params.id)
    .query('SELECT * FROM Roles WHERE RoleId=@id');
  if (!r.recordset.length) return res.status(404).send('Not found');
  res.json(r.recordset[0]);
});
app.post('/roles', async (req, res) => {
  const { Name } = req.body;
  const r = await new sql.Request()
    .input('Name', sql.NVarChar(50), Name)
    .query(`
      INSERT INTO Roles (Name)
      VALUES (@Name);
      SELECT SCOPE_IDENTITY() AS RoleId;
    `);
  res.status(201).json({ RoleId: r.recordset[0].RoleId });
});
app.put('/roles/:id', async (req, res) => {
  const { Name } = req.body;
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .input('Name', sql.NVarChar(50), Name)
    .query('UPDATE Roles SET Name=@Name WHERE RoleId=@id');
  res.sendStatus(204);
});
app.delete('/roles/:id', async (req, res) => {
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .query('DELETE FROM Roles WHERE RoleId=@id');
  res.sendStatus(204);
});


/* =======================
   8) WorkHours CRUD
   ======================= */
app.get('/workhours', async (req, res) => {
  const r = await sql.query(`
    SELECT w.*, e.FirstName, e.LastName, p.Name AS ProjectName
    FROM WorkHours w
    JOIN Employees e ON w.EmployeeId=e.Id
    LEFT JOIN Projects p  ON w.ProjectId=p.ProjectId
  `);
  res.json(r.recordset);
});
app.get('/workhours/:id', async (req, res) => {
  const r = await new sql.Request().input('id', sql.Int, req.params.id)
    .query('SELECT * FROM WorkHours WHERE WorkHoursId=@id');
  if (!r.recordset.length) return res.status(404).send('Not found');
  res.json(r.recordset[0]);
});
app.post('/workhours', async (req, res) => {
  const { EmployeeId, ProjectId, WorkDate, Hours } = req.body;
  const r = await new sql.Request()
    .input('EmployeeId', sql.Int, EmployeeId)
    .input('ProjectId',  sql.Int, ProjectId)
    .input('WorkDate',   sql.Date, WorkDate)
    .input('Hours',      sql.Decimal(4,2), Hours)
    .query(`
      INSERT INTO WorkHours (EmployeeId,ProjectId,WorkDate,Hours)
      VALUES (@EmployeeId,@ProjectId,@WorkDate,@Hours);
      SELECT SCOPE_IDENTITY() AS WorkHoursId;
    `);
  res.status(201).json({ WorkHoursId: r.recordset[0].WorkHoursId });
});
app.put('/workhours/:id', async (req, res) => {
  const { EmployeeId, ProjectId, WorkDate, Hours } = req.body;
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .input('EmployeeId', sql.Int, EmployeeId)
    .input('ProjectId',  sql.Int, ProjectId)
    .input('WorkDate',   sql.Date, WorkDate)
    .input('Hours',      sql.Decimal(4,2), Hours)
    .query(`
      UPDATE WorkHours
      SET EmployeeId=@EmployeeId,ProjectId=@ProjectId,
          WorkDate=@WorkDate,Hours=@Hours
      WHERE WorkHoursId=@id
    `);
  res.sendStatus(204);
});
app.delete('/workhours/:id', async (req, res) => {
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .query('DELETE FROM WorkHours WHERE WorkHoursId=@id');
  res.sendStatus(204);
});


/* =======================
   9) Users CRUD
   ======================= */
app.get('/users', async (req, res) => {
  const r = await sql.query(`
    SELECT u.UserId, u.Username, r.Name AS RoleName,
           e.FirstName, e.LastName
    FROM Users u
    JOIN Roles r      ON u.RoleId=r.RoleId
    JOIN Employees e  ON u.EmployeeId=e.Id
  `);
  res.json(r.recordset);
});
app.get('/users/:id', async (req, res) => {
  const r = await new sql.Request().input('id', sql.Int, req.params.id)
    .query('SELECT * FROM Users WHERE UserId=@id');
  if (!r.recordset.length) return res.status(404).send('Not found');
  const u = r.recordset[0];
  delete u.PasswordHash;
  res.json(u);
});
app.post('/users', async (req, res) => {
  const { EmployeeId, Username, Password, RoleId } = req.body;
  const hash = await bcrypt.hash(Password, 10);
  const r = await new sql.Request()
    .input('EmployeeId', sql.Int, EmployeeId)
    .input('Username',   sql.NVarChar(50), Username)
    .input('PasswordHash', sql.NVarChar(255), hash)
    .input('RoleId',     sql.Int, RoleId)
    .query(`
      INSERT INTO Users (EmployeeId,Username,PasswordHash,RoleId)
      VALUES (@EmployeeId,@Username,@PasswordHash,@RoleId);
      SELECT SCOPE_IDENTITY() AS UserId;
    `);
  res.status(201).json({ UserId: r.recordset[0].UserId });
});
app.put('/users/:id', async (req, res) => {
  const { EmployeeId, Username, RoleId } = req.body;
  // opsionalisht Password nuk ndryshon këtu
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .input('EmployeeId', sql.Int, EmployeeId)
    .input('Username', sql.NVarChar(50), Username)
    .input('RoleId', sql.Int, RoleId)
    .query(`
      UPDATE Users
      SET EmployeeId=@EmployeeId,Username=@Username,RoleId=@RoleId
      WHERE UserId=@id
    `);
  res.sendStatus(204);
});
app.delete('/users/:id', async (req, res) => {
  await new sql.Request()
    .input('id', sql.Int, req.params.id)
    .query('DELETE FROM Users WHERE UserId=@id');
  res.sendStatus(204);
});
