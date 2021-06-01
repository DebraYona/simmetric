module.exports = (sequelize, type) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      service_order_id: type.STRING,
      contract_id: type.STRING,
      client_id: type.INTEGER,
      job_id: type.INTEGER,
      route_id: type.INTEGER,
      last_mile: type.INTEGER,
      quantity_boxes: type.INTEGER,
      location_id: type.INTEGER,
      type_of_charge: type.STRING,
      status: type.STRING(100),
      request_id: type.STRING(100),
    },
    {
      tableName: 'Order',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Order.associate = (models) => {
    // associations can be defined here
    Order.hasMany(models.Product, {
      foreignKey: 'order_id',
    });
    Order.hasMany(models.Buyer, {
      foreignKey: 'order_id',
    });
    Order.hasMany(models.Receiver, {
      foreignKey: 'order_id',
    });
    Order.hasMany(models.Dropoff, {
      foreignKey: 'order_id',
    });
    Order.hasMany(models.Pickup, {
      foreignKey: 'order_id',
    });
    Order.belongsTo(models.Location, {
      foreignKey: 'location_id',
      onDelete: 'CASCADE',
    });
  };
  return Order;
};
