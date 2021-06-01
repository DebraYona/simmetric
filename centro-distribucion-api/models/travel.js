module.exports = (sequelize, type) => {
  const Travel = sequelize.define(
    'Travel',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      packages_quantity: type.INTEGER,
      driver_user_id: type.STRING,
      driver_name: type.STRING,
      driver_last_name: type.STRING,
      warehouse_user_id: type.STRING,
      warehouse_user_name: type.STRING,
      warehouse_user_last_name: type.STRING,
      pickup_location: type.INTEGER,
      dropoff_location: type.INTEGER,
      status: type.INTEGER,
      initiated_date: type.TIME,
      on_cd_date: type.TIME,
      verified_date: type.TIME,
      dispatched_date: type.TIME,
    },
    {
      tableName: 'Travel',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Travel.associate = (models) => {
    // associations can be defined here
    Travel.hasMany(models.Product, {
      foreignKey: 'travel_id',
    });
    Travel.hasMany(models.UserTravel, { foreignKey: 'travel_id' });
  };
  return Travel;
};
