// /server/server.js
const app = require('./app');
const db = require('./models');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5051;

// Connect DB and start server
db.sequelize.sync({ alter: true })  // You can use `force: true` for dev resets
  .then(() => {
    console.log('✅ Database connected and synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
  });