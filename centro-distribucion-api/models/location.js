module.exports = (sequelize, type) => {
  const Location = sequelize.define(
    'Location',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: type.STRING,
      address: type.STRING,
      address_2: type.STRING,
      comuna: type.STRING,
      latitude: type.DECIMAL(11, 8),
      longitude: type.DECIMAL(11, 8),
      pickup_time: type.STRING,
      contract_id: type.INTEGER,
    },
    {
      tableName: 'Location',
      freezeTableName: true,
      timestamps: false,
    }
  );
  Location.associate = (models) => {
    // associations can be defined here
    Location.hasMany(models.Order, {
      foreignKey: 'location_id',
    });
    Location.belongsTo(models.Order, {
      foreignKey: 'contract_id',
    });
  };
  return Location;
};
