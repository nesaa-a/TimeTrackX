// models/Attendance.js

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hoursWorked: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return Attendance;
};