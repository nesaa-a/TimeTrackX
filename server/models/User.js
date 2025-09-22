module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'unique_email',
        msg: 'Email address already in use.'
      },
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('employer', 'hr'),
      allowNull: false,
      defaultValue: 'employer'
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        name: 'unique_email',
        fields: ['email']
      }
    ]
  });

  // ✅ Associations for tasks
  User.associate = (models) => {
    User.hasMany(models.Task, { foreignKey: 'userId', as: 'assignedTasks' });  // Tasks assigned to this user
    User.hasMany(models.Task, { foreignKey: 'creatorId', as: 'createdTasks' }); // Tasks created by this user (HR)
  };

  return User;
};