// models/CheckIn.js
module.exports = (sequelize, DataTypes) => {
  const CheckIn = sequelize.define("CheckIn", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return CheckIn;
};