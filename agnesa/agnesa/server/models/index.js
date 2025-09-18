const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.Task = require('./Task')(sequelize, DataTypes);
db.Attendance = require('./Attendance')(sequelize, DataTypes);

// Relationships
db.User.hasMany(db.Task, { foreignKey: 'assignedTo', as: 'tasks' });
db.User.hasMany(db.Attendance, { foreignKey: 'userId' });
db.Task.belongsTo(db.User, { foreignKey: 'assignedTo', as: 'employee' });
db.Task.belongsTo(db.User, { foreignKey: 'createdBy', as: 'creator' });

db.CheckIn = require("./CheckIn")(sequelize, Sequelize);
db.User.hasMany(db.CheckIn, { foreignKey: 'userId' });
db.CheckIn.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;