module.exports = (sequelize, type) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      first_name: type.STRING,
      last_name: type.STRING,
      cognito_id: type.STRING,
      role: type.INTEGER,
      last_login: type.TIME,
    },
    {
      tableName: 'User',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  User.associate = (models) => {
    // associations can be defined here
    User.hasMany(models.UserTravel, { foreignKey: 'user_id' });
  };
  return User;
};
