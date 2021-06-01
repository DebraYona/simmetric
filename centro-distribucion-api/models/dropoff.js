module.exports = (sequelize, type) => {
  const Dropoff = sequelize.define(
    'Dropoff',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: type.INTEGER,
      address: type.STRING,
      address_2: type.STRING,
      comuna: type.STRING,
      observations: type.STRING,
      latitude: type.DECIMAL(11, 8),
      longitude: type.DECIMAL(11, 8),
      time: type.DATE,
    },
    {
      tableName: 'Dropoff',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Dropoff.associate = (models) => {
    // associations can be defined here
    Dropoff.belongsTo(models.Order, {
      foreignKey: 'order_id',
      onDelete: 'CASCADE',
    });
  };
  return Dropoff;
};
