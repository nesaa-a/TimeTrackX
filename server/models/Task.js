module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium"
    },
    status: {
      type: DataTypes.ENUM("pending", "in progress", "completed"),
      defaultValue: "pending"
    },

    // ✅ Add these two fields:
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, { as: "assignee", foreignKey: "userId" });
    Task.belongsTo(models.User, { as: "creator", foreignKey: "creatorId" });
  };

  return Task;
};