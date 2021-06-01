module.exports = (sequelize, type) => {
  const UserTravel = sequelize.define(
    'UserTravel',
    {
      cognito_id: type.STRING,
      travel_id: type.INTEGER,
    },
    {
      tableName: 'UserTravel',
      freezeTableName: true,
      timestamps: false,
    }
  );

  UserTravel.removeAttribute('id');
  return UserTravel;
};
