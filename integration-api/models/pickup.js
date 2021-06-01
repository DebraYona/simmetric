module.exports = (sequelize, type) => {
  const Pickup = sequelize.define(
    'Pickup',
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
      time_retail: type.DATE
    },
    {
      tableName: 'Pickup',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Pickup.associate = (models) => {
    // associations can be defined here
    Pickup.belongsTo(models.Order, {
      foreignKey: 'order_id',
      onDelete: 'CASCADE',
    });
  };
  return Pickup;
};
